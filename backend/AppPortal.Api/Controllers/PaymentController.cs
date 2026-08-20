using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppPortal.Api.Integrations.ExternalPayment;
using AppPortal.Api.Data;
using AppPortal.Api.DTOs;
using AppPortal.Api.Models;
using AppPortal.Api.DTOs.Integrations;
using AppPortal.Api.RequestModels;
using AppPortal.Api.Services;

namespace AppPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPaymentService _paymentService;
    private readonly ILoanAccountService _loanAccountService;
    private readonly IExternalPaymentService _externalPaymentService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        ApplicationDbContext context,
        IPaymentService paymentService,
        ILoanAccountService loanAccountService,
        IExternalPaymentService externalPaymentService,
        ILogger<PaymentsController> logger)
    {
        _context = context;
        _paymentService = paymentService;
        _loanAccountService = loanAccountService;
        _externalPaymentService = externalPaymentService;
        _logger = logger;
    }


    // =========================================================
    // GET:
    // api/payments/customer/1
    // =========================================================

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetPayments(
        int customerId)
    {
        _logger.LogInformation(
            "Payment data requested. CustomerId: {CustomerId}",
            customerId);

        var payments =
            await _paymentService.GetByCustomerId(customerId);

        var response = payments
            .Select(p => new PaymentResponse
            {
                Id = Convert.ToInt32(p.Id),

                LoanAccountId =
                    p.LoanAccountId,

                PaymentDescription =
                    p.PaymentDescription,

                PaymentAmount =
                    p.PaymentAmount,

                PaymentDate =
                    p.PaymentDate,

                Status =
                    p.Status,

                ConfirmationNumber =
                    p.ConfirmationNumber,

                CreatedDate =
                    p.CreatedDate,

                CompletedDate =
                    p.CompletedDate,

                LoanType =
                    p.LoanAccount?.LoanType,

                LenderName =
                    p.LoanAccount?.LenderName,

                MaskedAccountNumber =
                    p.LoanAccount?.AccountNumberEncrypted,

                CurrentBalance =
                    p.LoanAccount?.CurrentBalance,

                PaymentFrequency =
                    p.LoanAccount?.PaymentFrequency
            })
            .ToList();

        return Ok(response);
    }


    // =========================================================
    // GET:
    // api/payments/1
    // =========================================================

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPayment(
        int id)
    {
        var payment =
            await _paymentService.GetById(id);

        if (payment == null)
        {
            return NotFound();
        }

        return Ok(payment);
    }


    // =========================================================
    // POST:
    // api/payments
    //
    // Creates:
    //     1. LoanAccount
    //     2. External Payment
    //     3. Payment
    //
    // All database operations participate in one transaction.
    // =========================================================

    [HttpPost]
    public async Task<IActionResult> CreatePayment(
        CreatePaymentAccountRequest request)
    {
        _logger.LogInformation(
            "Payment processing initiated. CustomerId: {CustomerId}, LoanType: {LoanType}, PaymentAmount: {PaymentAmount}",
            request.CustomerId,
            request.LoanType,
            request.PaymentAmount);

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            Console.WriteLine(
                $"CustomerId received: {request.CustomerId}\n\n\n");


            // =================================================
            // STEP 1
            // Create LoanAccount through LoanAccountService
            // =================================================

            var loan = new LoanAccount
            {
                CustomerId =
                    request.CustomerId,

                LoanType =
                    request.LoanType,

                LoanName =
                    request.LoanName,

                LenderName =
                    request.LenderName,

                AccountNumberEncrypted =
                    request.LoanAccountNumber,

                CurrentBalance =
                    request.CurrentBalance,

                InterestRate =
                    request.InterestRate,

                PaymentFrequency =
                    request.PaymentFrequency
            };

            loan =
                await _loanAccountService.Create(loan);


            // =================================================
            // STEP 2
            // Process external payment
            // =================================================

            var externalPaymentRequest =
                new ExternalPaymentRequest
                {
                    CustomerId =
                        request.CustomerId,

                    LoanAccountId =
                        loan.Id,

                    PaymentAmount =
                        request.PaymentAmount,

                    PaymentType =
                        "ACH"
                };

            ExternalPaymentResponse?
                externalPaymentResponse;

            try
            {
                externalPaymentResponse =
                    await _externalPaymentService
                        .ProcessPaymentAsync(
                            externalPaymentRequest);
            }
            catch (ExternalPaymentException ex)
            {
                await transaction.RollbackAsync();

                _logger.LogError(
                    ex,
                    "External payment service failed. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                    request.CustomerId,
                    loan.Id);

                return StatusCode(
                    StatusCodes.Status503ServiceUnavailable,
                    new
                    {
                        success = false,

                        status =
                            "ExternalServiceUnavailable",

                        message =
                            ex.Message
                    });
            }


            // =================================================
            // STEP 3
            // Create Payment through PaymentService
            // =================================================

            var payment = new Payment
            {
                LoanAccountId =
                    loan.Id,

                PaymentAmount =
                    request.PaymentAmount,

                PaymentDate =
                    request.PaymentDate,

                Status =
                    externalPaymentResponse?.Status
                        ?? request.Status,

                ConfirmationNumber =
                    externalPaymentResponse?.ConfirmationNumber
                        ?? request.ConfirmationNumber
            };


            if (payment.Status == "Completed" ||
                payment.Status == "Approved")
            {
                payment.CompletedDate =
                    DateTime.UtcNow;
            }


            payment =
                await _paymentService.Create(payment);


            // =================================================
            // STEP 4
            // Commit transaction
            // =================================================

            await transaction.CommitAsync();


            _logger.LogInformation(
                "Payment creation completed. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentId: {PaymentId}, Status: {Status}",
                request.CustomerId,
                loan.Id,
                payment.Id,
                payment.Status);

            return Ok(payment);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();

            _logger.LogError(
                ex,
                "Error creating payment. CustomerId: {CustomerId}",
                request.CustomerId);

            throw;
        }
    }


    // =========================================================
    // PUT:
    // api/payments/1
    // =========================================================

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePayment(
        int id,
        PaymentRequest request)
    {
        var payment = new Payment
        {
            PaymentAmount =
                request.PaymentAmount,

            PaymentDate =
                request.PaymentDate,

            Status =
                request.Status,

            ConfirmationNumber =
                request.ConfirmationNumber
        };


        if (request.Status == "Completed")
        {
            payment.CompletedDate =
                DateTime.UtcNow;
        }


        var updated =
            await _paymentService.Update(
                id,
                payment);

        if (!updated)
        {
            return NotFound();
        }


        var updatedPayment =
            await _paymentService.GetById(id);

        return Ok(updatedPayment);
    }


    // =========================================================
    // DELETE:
    // api/payments/1
    // =========================================================

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePayment(
        int id)
    {
        var deleted =
            await _paymentService.Delete(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }


    // =========================================================
    // POST:
    // api/payments/make-payment
    //
    // Used when an EXISTING LoanAccount makes a payment.
    // =========================================================

    [HttpPost("make-payment")]
    public async Task<IActionResult> MakePayment(
        MakePaymentRequest request)
    {
        _logger.LogInformation(
            "Make payment initiated. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentAmount: {PaymentAmount}",
            request.CustomerId,
            request.LoanAccountId,
            request.PaymentAmount);


        if (request.PaymentAmount <= 0)
        {
            return BadRequest(new
            {
                success = false,

                message =
                    "Payment amount must be greater than zero."
            });
        }


        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            // =================================================
            // STEP 1
            // Get existing LoanAccount through service
            // =================================================

            var loan =
                await _loanAccountService.GetById(
                    request.LoanAccountId);


            if (loan == null ||
                loan.CustomerId != request.CustomerId)
            {
                return NotFound(new
                {
                    success = false,

                    message =
                        "Loan account was not found."
                });
            }


            // =================================================
            // STEP 2
            // Validate payment against balance
            // =================================================

            if (request.PaymentAmount >
                loan.CurrentBalance)
            {
                return BadRequest(new
                {
                    success = false,

                    message =
                        "Payment amount cannot exceed the current balance."
                });
            }


            // =================================================
            // STEP 3
            // Process external payment
            // =================================================

            var externalPaymentRequest =
                new ExternalPaymentRequest
                {
                    CustomerId =
                        request.CustomerId,

                    LoanAccountId =
                        loan.Id,

                    PaymentAmount =
                        request.PaymentAmount,

                    PaymentType =
                        "ACH"
                };


            ExternalPaymentResponse?
                externalPaymentResponse;

            try
            {
                externalPaymentResponse =
                    await _externalPaymentService
                        .ProcessPaymentAsync(
                            externalPaymentRequest);
            }
            catch (ExternalPaymentException ex)
            {
                await transaction.RollbackAsync();

                _logger.LogError(
                    ex,
                    "External payment service failed. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                    request.CustomerId,
                    request.LoanAccountId);

                return StatusCode(
                    StatusCodes.Status503ServiceUnavailable,
                    new
                    {
                        success = false,

                        status =
                            "ExternalServiceUnavailable",

                        message =
                            ex.Message
                    });
            }


            // =================================================
            // STEP 4
            // Create Payment
            // =================================================

            var payment = new Payment
            {
                LoanAccountId =
                    loan.Id,

                PaymentAmount =
                    request.PaymentAmount,

                PaymentDate =
                    request.PaymentDate,

                Status =
                    externalPaymentResponse?.Status
                        ?? "Pending",

                ConfirmationNumber =
                    externalPaymentResponse?.ConfirmationNumber
                        ?? ""
            };


            // =================================================
            // STEP 5
            // Update LoanAccount balance
            // =================================================

            if (payment.Status == "Completed" ||
                payment.Status == "Approved")
            {
                payment.CompletedDate =
                    DateTime.UtcNow;

                loan.CurrentBalance -=
                    request.PaymentAmount;

                await _loanAccountService.Update(
                    loan.Id,
                    loan);
            }


            // =================================================
            // STEP 6
            // Save Payment through PaymentService
            // =================================================

            payment =
                await _paymentService.Create(
                    payment);


            // =================================================
            // STEP 7
            // Commit transaction
            // =================================================

            await transaction.CommitAsync();


            _logger.LogInformation(
                "Payment processed successfully. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentId: {PaymentId}, Status: {Status}",
                request.CustomerId,
                request.LoanAccountId,
                payment.Id,
                payment.Status);


            return Ok(payment);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();

            _logger.LogError(
                ex,
                "Error processing payment. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                request.CustomerId,
                request.LoanAccountId);

            throw;
        }
    }
}










// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using AppPortal.Api.Integrations.ExternalPayment;
// using AppPortal.Api.Data;
// using AppPortal.Api.DTOs;
// using AppPortal.Api.Models;
// using AppPortal.Api.DTOs.Integrations;
// using AppPortal.Api.RequestModels;
// using AppPortal.Api.Services;

// namespace AppPortal.Api.Controllers;

// [ApiController]
// [Route("api/[controller]")]
// public class PaymentsController : ControllerBase
// {
//     private readonly ApplicationDbContext _context;
//     private readonly IPaymentService _paymentService;
//     private readonly IExternalPaymentService _externalPaymentService;
//     private readonly ILogger<PaymentsController> _logger;

//     public PaymentsController(
//         ApplicationDbContext context,
//         IPaymentService paymentService,
//         IExternalPaymentService externalPaymentService,
//         ILogger<PaymentsController> logger)
//     {
//         _context = context;
//         _paymentService = paymentService;
//         _externalPaymentService = externalPaymentService;
//         _logger = logger;
//     }

//     // GET:
//     // api/payments/customer/1
//     [HttpGet("customer/{customerId}")]
//     public async Task<IActionResult> GetPayments(int customerId)
//     {
//         _logger.LogInformation(
//             "Payment data requested. CustomerId: {CustomerId}",
//             customerId);

//         var payments =
//             await _paymentService.GetByCustomerId(customerId);

//         var response = payments.Select(p => new PaymentResponse
//         {
//             Id = Convert.ToInt32(p.Id),

//             LoanAccountId = p.LoanAccountId,

//             PaymentDescription = p.PaymentDescription,

//             PaymentAmount = p.PaymentAmount,

//             PaymentDate = p.PaymentDate,

//             Status = p.Status,

//             ConfirmationNumber = p.ConfirmationNumber,

//             CreatedDate = p.CreatedDate,

//             CompletedDate = p.CompletedDate,

//             LoanType = p.LoanAccount?.LoanType,

//             LenderName = p.LoanAccount?.LenderName,

//             MaskedAccountNumber =
//                 p.LoanAccount?.AccountNumberEncrypted,

//             CurrentBalance =
//                 p.LoanAccount?.CurrentBalance,

//             PaymentFrequency =
//                 p.LoanAccount?.PaymentFrequency
//         }).ToList();

//         return Ok(response);
//     }

//     // GET:
//     // api/payments/1
//     [HttpGet("{id}")]
//     public async Task<IActionResult> GetPayment(int id)
//     {
//         var payment =
//             await _paymentService.GetById(id);

//         if (payment == null)
//         {
//             return NotFound();
//         }

//         return Ok(payment);
//     }

//     // POST:
//     // api/payments
//     [HttpPost]
//     public async Task<IActionResult> CreatePayment(
//         CreatePaymentAccountRequest request)
//     {
//         _logger.LogInformation(
//             "Payment processing initiated. CustomerId: {CustomerId}, LoanType: {LoanType}, PaymentAmount: {PaymentAmount}",
//             request.CustomerId,
//             request.LoanType,
//             request.PaymentAmount);

//         await using var transaction =
//             await _context.Database.BeginTransactionAsync();

//         try
//         {
//             Console.WriteLine(
//                 $"CustomerId received: {request.CustomerId}\n\n\n");

//             var loan = new LoanAccount
//             {
//                 CustomerId = request.CustomerId,
//                 LoanType = request.LoanType,
//                 LoanName = request.LoanName,
//                 LenderName = request.LenderName,
//                 AccountNumberEncrypted = request.LoanAccountNumber,
//                 CurrentBalance = request.CurrentBalance,
//                 InterestRate = request.InterestRate,
//                 PaymentFrequency = request.PaymentFrequency
//             };

//             _context.LoanAccounts.Add(loan);

//             await _context.SaveChangesAsync();

//             var externalPaymentRequest = new ExternalPaymentRequest
//             {
//                 CustomerId = request.CustomerId,
//                 LoanAccountId = loan.Id,
//                 PaymentAmount = request.PaymentAmount,
//                 PaymentType = "ACH"
//             };

//             ExternalPaymentResponse? externalPaymentResponse;

//             try
//             {
//                 externalPaymentResponse =
//                     await _externalPaymentService.ProcessPaymentAsync(
//                         externalPaymentRequest);
//             }
//             catch (ExternalPaymentException ex)
//             {
//                 await transaction.RollbackAsync();

//                 return StatusCode(
//                     StatusCodes.Status503ServiceUnavailable,
//                     new
//                     {
//                         success = false,
//                         status = "ExternalServiceUnavailable",
//                         message = ex.Message
//                     });
//             }

//             var payment = new Payment
//             {
//                 LoanAccountId = loan.Id,

//                 PaymentAmount =
//                     request.PaymentAmount,

//                 PaymentDate =
//                     request.PaymentDate,

//                 Status =
//                     externalPaymentResponse?.Status
//                         ?? request.Status,

//                 ConfirmationNumber =
//                     externalPaymentResponse?.ConfirmationNumber
//                         ?? request.ConfirmationNumber
//             };

//             if (payment.Status == "Completed" ||
//                 payment.Status == "Approved")
//             {
//                 payment.CompletedDate =
//                     DateTime.UtcNow;
//             }

//             payment =
//                 await _paymentService.Create(payment);

//             await transaction.CommitAsync();

//             return Ok(payment);
//         }
//         catch (Exception)
//         {
//             await transaction.RollbackAsync();

//             throw;
//         }
//     }

//     // PUT:
//     // api/payments/1
//     [HttpPut("{id}")]
//     public async Task<IActionResult> UpdatePayment(
//         int id,
//         PaymentRequest request)
//     {
//         var payment = new Payment
//         {
//             PaymentAmount = request.PaymentAmount,

//             PaymentDate = request.PaymentDate,

//             Status = request.Status,

//             ConfirmationNumber =
//                 request.ConfirmationNumber
//         };

//         if (request.Status == "Completed")
//         {
//             payment.CompletedDate =
//                 DateTime.UtcNow;
//         }

//         var updated =
//             await _paymentService.Update(id, payment);

//         if (!updated)
//         {
//             return NotFound();
//         }

//         var updatedPayment =
//             await _paymentService.GetById(id);

//         return Ok(updatedPayment);
//     }

//     // DELETE:
//     // api/payments/1
//     [HttpDelete("{id}")]
//     public async Task<IActionResult> DeletePayment(int id)
//     {
//         var deleted =
//             await _paymentService.Delete(id);

//         if (!deleted)
//         {
//             return NotFound();
//         }

//         return NoContent();
//     }

//     // POST:
//     // api/payments/make-payment
//     [HttpPost("make-payment")]
//     public async Task<IActionResult> MakePayment(
//         MakePaymentRequest request)
//     {
//         _logger.LogInformation(
//             "Make payment initiated. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentAmount: {PaymentAmount}",
//             request.CustomerId,
//             request.LoanAccountId,
//             request.PaymentAmount);

//         if (request.PaymentAmount <= 0)
//         {
//             return BadRequest(new
//             {
//                 success = false,
//                 message = "Payment amount must be greater than zero."
//             });
//         }

//         await using var transaction =
//             await _context.Database.BeginTransactionAsync();

//         try
//         {
//             var loan = await _context.LoanAccounts
//                 .FirstOrDefaultAsync(l =>
//                     l.Id == request.LoanAccountId &&
//                     l.CustomerId == request.CustomerId);

//             if (loan == null)
//             {
//                 return NotFound(new
//                 {
//                     success = false,
//                     message = "Loan account was not found."
//                 });
//             }

//             if (request.PaymentAmount > loan.CurrentBalance)
//             {
//                 return BadRequest(new
//                 {
//                     success = false,
//                     message =
//                         "Payment amount cannot exceed the current balance."
//                 });
//             }

//             var externalPaymentRequest =
//                 new ExternalPaymentRequest
//                 {
//                     CustomerId = request.CustomerId,

//                     LoanAccountId =
//                         loan.Id,

//                     PaymentAmount =
//                         request.PaymentAmount,

//                     PaymentType =
//                         "ACH"
//                 };

//             ExternalPaymentResponse? externalPaymentResponse;

//             try
//             {
//                 externalPaymentResponse =
//                     await _externalPaymentService.ProcessPaymentAsync(
//                         externalPaymentRequest);
//             }
//             catch (ExternalPaymentException ex)
//             {
//                 await transaction.RollbackAsync();

//                 _logger.LogError(
//                     ex,
//                     "External payment service failed. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
//                     request.CustomerId,
//                     request.LoanAccountId);

//                 return StatusCode(
//                     StatusCodes.Status503ServiceUnavailable,
//                     new
//                     {
//                         success = false,
//                         status = "ExternalServiceUnavailable",
//                         message = ex.Message
//                     });
//             }

//             var payment = new Payment
//             {
//                 LoanAccountId =
//                     loan.Id,

//                 PaymentAmount =
//                     request.PaymentAmount,

//                 PaymentDate =
//                     request.PaymentDate,

//                 Status =
//                     externalPaymentResponse?.Status
//                         ?? "Pending",

//                 ConfirmationNumber =
//                     externalPaymentResponse?.ConfirmationNumber
//                         ?? ""
//             };

//             if (payment.Status == "Completed" ||
//                 payment.Status == "Approved")
//             {
//                 payment.CompletedDate =
//                     DateTime.UtcNow;

//                 loan.CurrentBalance -=
//                     request.PaymentAmount;
//             }

//             payment =
//                 await _paymentService.Create(payment);

//             await _context.SaveChangesAsync();

//             await transaction.CommitAsync();

//             _logger.LogInformation(
//                 "Payment processed successfully. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentId: {PaymentId}, Status: {Status}",
//                 request.CustomerId,
//                 request.LoanAccountId,
//                 payment.Id,
//                 payment.Status);

//             return Ok(payment);
//         }
//         catch (Exception ex)
//         {
//             await transaction.RollbackAsync();

//             _logger.LogError(
//                 ex,
//                 "Error processing payment. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
//                 request.CustomerId,
//                 request.LoanAccountId);

//             throw;
//         }
//     }
// }




















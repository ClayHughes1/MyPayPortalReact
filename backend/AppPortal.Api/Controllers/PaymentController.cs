using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppPortal.Api.Integrations.ExternalPayment;
using AppPortal.Api.Data;
using AppPortal.Api.DTOs;
using AppPortal.Api.Models;
using AppPortal.Api.DTOs.Integrations;

namespace AppPortal.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IExternalPaymentService _externalPaymentService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        ApplicationDbContext context,
        IExternalPaymentService externalPaymentService,
        ILogger<PaymentsController> logger)
    {
        _context = context;
        _externalPaymentService = externalPaymentService;
        _logger = logger;
    }


    // GET:
    // api/payments/customer/1
    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetPayments(
        int customerId)
    {
    _logger.LogInformation(
        "Payment data requested. CustomerId: {CustomerId}",
        customerId);

    var payments = await _context.Payments
        .Include(p => p.LoanAccount)
        .Where(p =>
            p.LoanAccount != null &&
            p.LoanAccount.CustomerId == customerId)
        .Select(p => new PaymentResponse
        {
            Id = Convert.ToInt32(p.Id),

            LoanAccountId = p.LoanAccountId,

            PaymentDescription = p.PaymentDescription,

            PaymentAmount = p.PaymentAmount,

            PaymentDate = p.PaymentDate,

            Status = p.Status,

            ConfirmationNumber = p.ConfirmationNumber,

            CreatedDate = p.CreatedDate,

            CompletedDate = p.CompletedDate,


            LoanType = p.LoanAccount!.LoanType,

            LenderName = p.LoanAccount.LenderName,

            MaskedAccountNumber = p.LoanAccount.AccountNumberEncrypted,

            CurrentBalance = p.LoanAccount.CurrentBalance,

            PaymentFrequency = p.LoanAccount.PaymentFrequency

        })
        .ToListAsync();

        return Ok(payments);

    }



    // GET:
    // api/payments/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPayment(
        int id)
    {

        var payment =
            await _context.Payments
            .FirstOrDefaultAsync(
                p => p.Id == id);


        if(payment == null)
            return NotFound();


        return Ok(payment);

    }

    // POST:
    // api/payments
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

            var loan = new LoanAccount
            {
                CustomerId = request.CustomerId,
                LoanType = request.LoanType,
                LoanName = request.LoanName,
                LenderName = request.LenderName,
                AccountNumberEncrypted = request.AccountNumber,
                CurrentBalance = request.CurrentBalance,
                InterestRate = request.InterestRate,
                PaymentFrequency = request.PaymentFrequency,
                CreatedDate = DateTime.UtcNow
            };

            _context.LoanAccounts.Add(loan);

            await _context.SaveChangesAsync();


            var externalPaymentRequest = new ExternalPaymentRequest
            {
                CustomerId = request.CustomerId,
                LoanAccountId = loan.Id,
                PaymentAmount = request.PaymentAmount,
                PaymentType = "ACH"
            };


            ExternalPaymentResponse? externalPaymentResponse;

            try
            {
                externalPaymentResponse =
                    await _externalPaymentService.ProcessPaymentAsync(
                        externalPaymentRequest);
            }
            catch (ExternalPaymentException ex)
            {
                await transaction.RollbackAsync();

                return StatusCode(
                    StatusCodes.Status503ServiceUnavailable,
                    new
                    {
                        success = false,
                        status = "ExternalServiceUnavailable",
                        message = ex.Message
                    });
            }


            var payment = new Payment
            {
                LoanAccountId = loan.Id,

                PaymentAmount =
                    request.PaymentAmount,

                PaymentDate =
                    request.PaymentDate,

                Status =
                    externalPaymentResponse?.Status
                        ?? request.Status,

                ConfirmationNumber =
                    externalPaymentResponse?.ConfirmationNumber
                        ?? request.ConfirmationNumber,

                CreatedDate =
                    DateTime.UtcNow
            };


            if (payment.Status == "Completed" ||
                payment.Status == "Approved")
            {
                payment.CompletedDate =
                    DateTime.UtcNow;
            }


            _context.Payments.Add(payment);

            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(payment);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();

            throw;
        }
    }



    // PUT:
    // api/payments/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePayment(
        int id,
        PaymentRequest request)
    {

        var payment =
            await _context.Payments
            .FirstOrDefaultAsync(
                p => p.Id == id);



        if(payment == null)
            return NotFound();



        payment.PaymentAmount =
            request.PaymentAmount;


        payment.PaymentDate =
            request.PaymentDate;


        payment.Status =
            request.Status;


        payment.ConfirmationNumber =
            request.ConfirmationNumber;



        if(request.Status == "Completed")
        {
            payment.CompletedDate =
                DateTime.UtcNow;
        }



        await _context.SaveChangesAsync();


        return Ok(payment);

    }





    // DELETE:
    // api/payments/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePayment(
        int id)
    {

        var payment =
            await _context.Payments
            .FirstOrDefaultAsync(
                p => p.Id == id);



        if(payment == null)
            return NotFound();



        _context.Payments.Remove(payment);


        await _context.SaveChangesAsync();


        return NoContent();

    }

    // POST:
    // api/payments/make-payment
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
                message = "Payment amount must be greater than zero."
            });
        }

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            // Find the existing loan belonging to this customer.
            var loan = await _context.LoanAccounts
                .FirstOrDefaultAsync(l =>
                    l.Id == request.LoanAccountId &&
                    l.CustomerId == request.CustomerId);

            if (loan == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Loan account was not found."
                });
            }


            // Make sure the payment does not exceed
            // the current loan balance.
            if (request.PaymentAmount > loan.CurrentBalance)
            {
                return BadRequest(new
                {
                    success = false,
                    message =
                        "Payment amount cannot exceed the current balance."
                });
            }


            // Send the payment to the external payment service.
            var externalPaymentRequest =
                new ExternalPaymentRequest
                {
                    CustomerId = request.CustomerId,

                    LoanAccountId =
                        loan.Id,

                    PaymentAmount =
                        request.PaymentAmount,

                    PaymentType =
                        "ACH"
                };


            ExternalPaymentResponse? externalPaymentResponse;

            try
            {
                externalPaymentResponse =
                    await _externalPaymentService.ProcessPaymentAsync(
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


            // Create the payment transaction.
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
                        ?? "",

                CreatedDate =
                    DateTime.UtcNow
            };


            // Only change the loan balance when
            // the payment was successfully completed.
            if (payment.Status == "Completed" ||
                payment.Status == "Approved")
            {
                payment.CompletedDate =
                    DateTime.UtcNow;

                loan.CurrentBalance -=
                    request.PaymentAmount;
            }


            _context.Payments.Add(payment);

            await _context.SaveChangesAsync();

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
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppPortal.Api.Integrations.ExternalPayment;
using AppPortal.Api.Data;
using AppPortal.Api.DTOs;
using AppPortal.Api.Models;
using AppPortal.Api.DTOs.Integrations;
using AppPortal.Api.RequestModels;
using AppPortal.Api.Services;
using Microsoft.AspNetCore.Authorization;

namespace AppPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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
            "GetPayments started. CustomerId: {CustomerId}",
            customerId);

        try
        {
            var payments =
                await _paymentService.GetByCustomerId(customerId);

            _logger.LogInformation(
                "Payment records retrieved. CustomerId: {CustomerId}, PaymentCount: {PaymentCount}",
                customerId,
                payments?.Count() ?? 0);

            var response = payments?
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

                    LoanName =
                        p.LoanAccount?.LoanName,

                    LoanAccountNumber =
                        p.LoanAccount?.AccountNumberEncrypted,

                    MaskedAccountNumber =
                        p.LoanAccount?.AccountNumberEncrypted,

                    CurrentBalance =
                        p.LoanAccount?.CurrentBalance,

                    PaymentFrequency =
                        p.LoanAccount?.PaymentFrequency
                })
                .ToList();

            _logger.LogInformation(
                "GetPayments completed successfully. CustomerId: {CustomerId}, PaymentCount: {PaymentCount}",
                customerId,
                response?.Count);

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error retrieving payments. CustomerId: {CustomerId}",
                customerId);

            throw;
        }
    }


    // =========================================================
    // GET:
    // api/payments/1
    // =========================================================

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPayment(
        int id)
    {
        _logger.LogInformation(
            "GetPayment started. PaymentId: {PaymentId}",
            id);

        try
        {
            var payment =
                await _paymentService.GetById(id);

            if (payment == null)
            {
                _logger.LogWarning(
                    "Payment not found. PaymentId: {PaymentId}",
                    id);

                return NotFound();
            }

            _logger.LogInformation(
                "Payment retrieved successfully. PaymentId: {PaymentId}, LoanAccountId: {LoanAccountId}",
                id,
                payment.LoanAccountId);

            return Ok(payment);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error retrieving payment. PaymentId: {PaymentId}",
                id);

            throw;
        }
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
            "CreatePayment started. CustomerId: {CustomerId}, LoanType: {LoanType}, PaymentAmount: {PaymentAmount}",
            request.CustomerId,
            request.LoanType,
            request.PaymentAmount);

        if (request.PaymentAmount <= 0)
        {
            _logger.LogWarning(
                "CreatePayment rejected because payment amount is invalid. CustomerId: {CustomerId}, PaymentAmount: {PaymentAmount}",
                request.CustomerId,
                request.PaymentAmount);

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
            _logger.LogInformation(
                "Database transaction started for CreatePayment. CustomerId: {CustomerId}",
                request.CustomerId);


            // =================================================
            // STEP 1
            // Create LoanAccount
            // =================================================

            _logger.LogInformation(
                "Creating loan account. CustomerId: {CustomerId}, LoanType: {LoanType}",
                request.CustomerId,
                request.LoanType);

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

            _logger.LogInformation(
                "Loan account created. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                request.CustomerId,
                loan.Id);


            // =================================================
            // STEP 2
            // Process external payment
            // =================================================

            _logger.LogInformation(
                "Submitting payment to external payment service. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentAmount: {PaymentAmount}",
                request.CustomerId,
                loan.Id,
                request.PaymentAmount);

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

                _logger.LogInformation(
                    "External payment service completed. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, ExternalStatus: {ExternalStatus}",
                    request.CustomerId,
                    loan.Id,
                    externalPaymentResponse?.Status);
            }
            catch (ExternalPaymentException ex)
            {
                _logger.LogError(
                    ex,
                    "External payment service failed. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                    request.CustomerId,
                    loan.Id);

                await transaction.RollbackAsync();

                _logger.LogInformation(
                    "Database transaction rolled back after external payment failure. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
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
            // Create Payment
            // =================================================

            _logger.LogInformation(
                "Creating payment record. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                request.CustomerId,
                loan.Id);

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

                _logger.LogInformation(
                    "Payment marked as completed. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, Status: {Status}",
                    request.CustomerId,
                    loan.Id,
                    payment.Status);
            }

            payment =
                await _paymentService.Create(payment);

            _logger.LogInformation(
                "Payment record created. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentId: {PaymentId}, Status: {Status}",
                request.CustomerId,
                loan.Id,
                payment.Id,
                payment.Status);


            // =================================================
            // STEP 4
            // Commit transaction
            // =================================================

            await transaction.CommitAsync();

            _logger.LogInformation(
                "CreatePayment transaction committed successfully. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentId: {PaymentId}",
                request.CustomerId,
                loan.Id,
                payment.Id);

            _logger.LogInformation(
                "CreatePayment completed successfully. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentId: {PaymentId}, Status: {Status}",
                request.CustomerId,
                loan.Id,
                payment.Id,
                payment.Status);

            return Ok(payment);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unhandled error during CreatePayment. CustomerId: {CustomerId}",
                request.CustomerId);

            try
            {
                await transaction.RollbackAsync();

                _logger.LogInformation(
                    "CreatePayment transaction rolled back. CustomerId: {CustomerId}",
                    request.CustomerId);
            }
            catch (Exception rollbackEx)
            {
                _logger.LogError(
                    rollbackEx,
                    "Error rolling back CreatePayment transaction. CustomerId: {CustomerId}",
                    request.CustomerId);
            }

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
        _logger.LogInformation(
            "UpdatePayment started. PaymentId: {PaymentId}, PaymentAmount: {PaymentAmount}, Status: {Status}",
            id,
            request.PaymentAmount,
            request.Status);

        try
        {
            var existingPayment =
                await _paymentService.GetById(id);

            if (existingPayment == null)
            {
                _logger.LogWarning(
                    "UpdatePayment failed because payment was not found. PaymentId: {PaymentId}",
                    id);

                return NotFound();
            }

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

                _logger.LogInformation(
                    "Payment completion date assigned. PaymentId: {PaymentId}",
                    id);
            }

            var updated =
                await _paymentService.Update(
                    id,
                    payment);

            if (!updated)
            {
                _logger.LogWarning(
                    "Payment update returned false. PaymentId: {PaymentId}",
                    id);

                return NotFound();
            }

            var updatedPayment =
                await _paymentService.GetById(id);

            _logger.LogInformation(
                "Payment updated successfully. PaymentId: {PaymentId}, Status: {Status}",
                id,
                request.Status);

            return Ok(updatedPayment);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error updating payment. PaymentId: {PaymentId}",
                id);

            throw;
        }
    }


    // =========================================================
    // DELETE:
    // api/payments/1
    // =========================================================

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePayment(
        int id)
    {
        _logger.LogInformation(
            "DeletePayment started. PaymentId: {PaymentId}",
            id);

        try
        {
            var existingPayment =
                await _paymentService.GetById(id);

            if (existingPayment == null)
            {
                _logger.LogWarning(
                    "DeletePayment failed because payment was not found. PaymentId: {PaymentId}",
                    id);

                return NotFound();
            }

            var deleted =
                await _paymentService.Delete(id);

            if (!deleted)
            {
                _logger.LogWarning(
                    "Payment deletion returned false. PaymentId: {PaymentId}",
                    id);

                return NotFound();
            }

            _logger.LogInformation(
                "Payment deleted successfully. PaymentId: {PaymentId}, LoanAccountId: {LoanAccountId}",
                id,
                existingPayment.LoanAccountId);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error deleting payment. PaymentId: {PaymentId}",
                id);

            throw;
        }
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
            "MakePayment started. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentAmount: {PaymentAmount}",
            request.CustomerId,
            request.LoanAccountId,
            request.PaymentAmount);

        if (request.PaymentAmount <= 0)
        {
            _logger.LogWarning(
                "MakePayment rejected because payment amount is invalid. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentAmount: {PaymentAmount}",
                request.CustomerId,
                request.LoanAccountId,
                request.PaymentAmount);

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
            _logger.LogInformation(
                "Database transaction started for MakePayment. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                request.CustomerId,
                request.LoanAccountId);


            // =================================================
            // STEP 1
            // Get existing LoanAccount
            // =================================================

            _logger.LogInformation(
                "Retrieving loan account. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                request.CustomerId,
                request.LoanAccountId);

            var loan =
                await _loanAccountService.GetById(
                    request.LoanAccountId);

            if (loan == null)
            {
                _logger.LogWarning(
                    "Loan account not found. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                    request.CustomerId,
                    request.LoanAccountId);

                return NotFound(new
                {
                    success = false,

                    message =
                        "Loan account was not found."
                });
            }

            if (loan.CustomerId != request.CustomerId)
            {
                _logger.LogWarning(
                    "Loan account does not belong to requested customer. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, ActualCustomerId: {ActualCustomerId}",
                    request.CustomerId,
                    request.LoanAccountId,
                    loan.CustomerId);

                return NotFound(new
                {
                    success = false,

                    message =
                        "Loan account was not found."
                });
            }

            _logger.LogInformation(
                "Loan account retrieved successfully. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, CurrentBalance: {CurrentBalance}",
                request.CustomerId,
                request.LoanAccountId,
                loan.CurrentBalance);


            // =================================================
            // STEP 2
            // Validate payment against balance
            // =================================================

            if (request.PaymentAmount >
                loan.CurrentBalance)
            {
                _logger.LogWarning(
                    "Payment rejected because amount exceeds current balance. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentAmount: {PaymentAmount}, CurrentBalance: {CurrentBalance}",
                    request.CustomerId,
                    request.LoanAccountId,
                    request.PaymentAmount,
                    loan.CurrentBalance);

                return BadRequest(new
                {
                    success = false,

                    message =
                        "Payment amount cannot exceed the current balance."
                });
            }

            _logger.LogInformation(
                "Payment amount validated against loan balance. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                request.CustomerId,
                request.LoanAccountId);


            // =================================================
            // STEP 3
            // Process external payment
            // =================================================

            _logger.LogInformation(
                "Submitting payment to external payment service. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentAmount: {PaymentAmount}",
                request.CustomerId,
                request.LoanAccountId,
                request.PaymentAmount);

            var externalPaymentRequest =
                new ExternalPaymentRequest
                {
                    CustomerId =
                        request.CustomerId,

                    LoanAccountId =
                        loan.Id,

                    LoanName =
                        request.LoanName,

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

                _logger.LogInformation(
                    "External payment service completed. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, ExternalStatus: {ExternalStatus}",
                    request.CustomerId,
                    request.LoanAccountId,
                    externalPaymentResponse?.Status);
            }
            catch (ExternalPaymentException ex)
            {
                _logger.LogError(
                    ex,
                    "External payment service failed. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                    request.CustomerId,
                    request.LoanAccountId);

                await transaction.RollbackAsync();

                _logger.LogInformation(
                    "MakePayment transaction rolled back after external payment failure. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
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

            _logger.LogInformation(
                "Creating payment record. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                request.CustomerId,
                request.LoanAccountId);

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

                _logger.LogInformation(
                    "Payment completed. Updating loan balance. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, NewBalance: {NewBalance}",
                    request.CustomerId,
                    loan.Id,
                    loan.CurrentBalance);

                await _loanAccountService.Update(
                    loan.Id,
                    loan);

                _logger.LogInformation(
                    "Loan account balance updated. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                    request.CustomerId,
                    loan.Id);
            }
            else
            {
                _logger.LogInformation(
                    "Loan balance not updated because payment is not completed. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, Status: {Status}",
                    request.CustomerId,
                    loan.Id,
                    payment.Status);
            }


            // =================================================
            // STEP 6
            // Save Payment
            // =================================================

            payment =
                await _paymentService.Create(
                    payment);

            _logger.LogInformation(
                "Payment record created. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentId: {PaymentId}, Status: {Status}",
                request.CustomerId,
                loan.Id,
                payment.Id,
                payment.Status);


            // =================================================
            // STEP 7
            // Commit transaction
            // =================================================

            await transaction.CommitAsync();

            _logger.LogInformation(
                "MakePayment transaction committed successfully. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentId: {PaymentId}",
                request.CustomerId,
                loan.Id,
                payment.Id);

            _logger.LogInformation(
                "MakePayment completed successfully. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentId: {PaymentId}, Status: {Status}",
                request.CustomerId,
                loan.Id,
                payment.Id,
                payment.Status);

            return Ok(payment);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unhandled error during MakePayment. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                request.CustomerId,
                request.LoanAccountId);

            try
            {
                await transaction.RollbackAsync();

                _logger.LogInformation(
                    "MakePayment transaction rolled back. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                    request.CustomerId,
                    request.LoanAccountId);
            }
            catch (Exception rollbackEx)
            {
                _logger.LogError(
                    rollbackEx,
                    "Error rolling back MakePayment transaction. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}",
                    request.CustomerId,
                    request.LoanAccountId);
            }

            throw;
        }
    }
}



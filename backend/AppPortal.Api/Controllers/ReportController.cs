using AppPortal.Api.Data;
using AppPortal.Api.DTOs.Reports;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AppPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(
        ApplicationDbContext context,
        ILogger<ReportsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/reports/payments/{customerId}
    [HttpGet("payments/{customerId}")]
    public async Task<IActionResult> GetPaymentReport(int customerId)
    {
        try
        {
            Console.WriteLine("Getting the report ");
            // Find the customer first.
            var customer = await _context.Customers
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == customerId);

            if (customer == null)
            {
                return NotFound(new
                {
                    message = "Customer not found."
                });
            }

            // Retrieve the customer's payments through
            // LoanAccount -> Customer.
            var payments = await _context.Payments
                .AsNoTracking()
                .Include(p => p.LoanAccount)
                .Where(p =>
                    p.LoanAccount != null &&
                    p.LoanAccount.CustomerId == customerId)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentReportItem
                {
                    PaymentId = p.Id ?? 0,                
                    LoanAccountId = p.LoanAccountId ?? 0,

                    LoanType = p.LoanAccount!.LoanType,
                    LoanName = p.LoanAccount.LoanName,
                    LenderName = p.LoanAccount.LenderName,

                    PaymentAmount = p.PaymentAmount ?? 0,
                    PaymentDate = p.PaymentDate ?? DateTime.Today,

                    Status = p.Status,
                    ConfirmationNumber = p.ConfirmationNumber
                })
                .ToListAsync();

            var report = new PaymentReportResponse
            {
                CustomerId = customer.Id,

                CustomerName =
                    $"{customer.FirstName} {customer.LastName}".Trim(),

                Email = customer.Email,

                ReportDate = DateTime.UtcNow,

                PaymentCount = payments.Count,

                TotalAmount = payments.Sum(p => p.PaymentAmount),

                // TotalPayments = payments.Count,

                Payments = payments
            };

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating payment report for customer {CustomerId}",
                customerId);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "An error occurred while generating the payment report."
                });
        }
    }

    // GET: api/reports/payments/{customerId}/range
    [HttpGet("payments/{customerId}/range")]
    public async Task<IActionResult> GetPaymentReportByDateRange(
        int customerId,
        [FromQuery] DateTime dateFrom,
        [FromQuery] DateTime dateTo)
    {
        try
        {
            if (dateFrom.Date > dateTo.Date)
            {
                return BadRequest(new
                {
                    message = "The start date cannot be after the end date."
                });
            }

            var customer = await _context.Customers
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == customerId);

            if (customer == null)
            {
                return NotFound(new
                {
                    message = "Customer not found."
                });
            }

            var startDate = dateFrom.Date;
            var endDate = dateTo.Date.AddDays(1);

            var payments = await _context.Payments
                .AsNoTracking()
                .Include(p => p.LoanAccount)
                .Where(p =>
                    p.LoanAccount != null &&
                    p.LoanAccount.CustomerId == customerId &&
                    p.PaymentDate >= startDate &&
                    p.PaymentDate < endDate)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentReportItem
                {
                    PaymentId = p.Id ?? 0,

                    LoanAccountId = p.LoanAccountId ?? 0,

                    LoanType = p.LoanAccount!.LoanType,
                    LoanName = p.LoanAccount.LoanName,
                    LenderName = p.LoanAccount.LenderName,

                    PaymentAmount = p.PaymentAmount ?? 0,
                    PaymentDate = p.PaymentDate ?? DateTime.Today,

                    Status = p.Status,
                    ConfirmationNumber = p.ConfirmationNumber
                })
                .ToListAsync();

            var report = new PaymentReportResponse
            {
                CustomerId = customer.Id,

                CustomerName =
                    $"{customer.FirstName} {customer.LastName}".Trim(),

                Email = customer.Email,

                ReportDate = DateTime.UtcNow,

                PaymentCount = payments.Count,

                TotalAmount = payments.Sum(p => p.PaymentAmount),

                Payments = payments
            };

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating payment report for customer {CustomerId} " +
                "between {DateFrom} and {DateTo}",
                customerId,
                dateFrom,
                dateTo);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while generating the payment report."
                });
        }
    }
}
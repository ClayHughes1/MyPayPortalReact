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

    // GET: api/reports/payment-total-by-loan-type/{customerId}
    [HttpGet("payment-total-by-loan-type/{customerId}")]
    public async Task<IActionResult> GetPaymentTotalsByLoanType(
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

            var customerExists = await _context.Customers
                .AsNoTracking()
                .AnyAsync(c => c.Id == customerId);

            if (!customerExists)
            {
                return NotFound(new
                {
                    message = "Customer not found."
                });
            }

            var startDate = dateFrom.Date;
            var endDate = dateTo.Date.AddDays(1);

            var report = await _context.Payments
                .AsNoTracking()
                .Where(p =>
                    p.LoanAccount != null &&
                    p.LoanAccount.CustomerId == customerId &&
                    p.PaymentDate >= startDate &&
                    p.PaymentDate < endDate)
                .GroupBy(p => p.LoanAccount!.LoanType)
                .Select(g => new PaymentTotalsByLoanTypeResponse
                {
                    LoanType = g.Key,
                    PaymentCount = g.Count(),
                    TotalPaid = g.Sum(p => p.PaymentAmount ?? 0)
                })
                .OrderBy(x => x.LoanType)
                .ToListAsync();

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating payment totals by loan type " +
                "for customer {CustomerId}",
                customerId);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while generating the payment totals by loan type report."
                });
        }
    }

    // GET: api/reports/payment-total-by-status/{customerId}
    [HttpGet("payment-total-by-status/{customerId}")]
    public async Task<IActionResult> GetPaymentTotalsByStatus(
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

            var customerExists = await _context.Customers
                .AsNoTracking()
                .AnyAsync(c => c.Id == customerId);

            if (!customerExists)
            {
                return NotFound(new
                {
                    message = "Customer not found."
                });
            }

            var startDate = dateFrom.Date;
            var endDate = dateTo.Date.AddDays(1);

            var report = await _context.Payments
                .AsNoTracking()
                .Where(p =>
                    p.LoanAccount != null &&
                    p.LoanAccount.CustomerId == customerId &&
                    p.PaymentDate >= startDate &&
                    p.PaymentDate < endDate)
                .GroupBy(p => p.Status)
                .Select(g => new PaymentTotalsByStatusResponse
                {
                    Status = g.Key,
                    PaymentCount = g.Count(),
                    TotalAmount = g.Sum(p => p.PaymentAmount ?? 0)
                })
                .OrderBy(x => x.Status)
                .ToListAsync();

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating payment totals by status " +
                "for customer {CustomerId}",
                customerId);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while generating the payment totals by status report."
                });
        }
    }

    // GET: api/reports/payment-by-month/{customerId}
    [HttpGet("payment-by-month/{customerId}")]
    public async Task<IActionResult> GetPaymentsByMonth(
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

            var customerExists = await _context.Customers
                .AsNoTracking()
                .AnyAsync(c => c.Id == customerId);

            if (!customerExists)
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
                .Where(p =>
                    p.LoanAccount != null &&
                    p.LoanAccount.CustomerId == customerId &&
                    p.PaymentDate >= startDate &&
                    p.PaymentDate < endDate)
                .Select(p => new
                {
                    PaymentDate = p.PaymentDate,
                    PaymentAmount = p.PaymentAmount ?? 0
                })
                .ToListAsync();

            var report = payments
                .GroupBy(p => new
                {
                    Year = p.PaymentDate!.Value.Year,
                    Month = p.PaymentDate!.Value.Month
                })
                .Select(g => new PaymentsByMonthResponse
                {
                    Month = new DateTime(
                        g.Key.Year,
                        g.Key.Month,
                        1).ToString("MMMM yyyy"),

                    PaymentCount = g.Count(),

                    TotalPaid = g.Sum(p => p.PaymentAmount)
                })
                .OrderBy(x => x.Month)
                .ToList();

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating payments by month " +
                "for customer {CustomerId}",
                customerId);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while generating the payments by month report."
                });
        }
    }

    // GET: api/reports/payment-summary/{customerId}
    [HttpGet("payment-summary/{customerId}")]
    public async Task<IActionResult> GetPaymentSummary(
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

            var customerExists = await _context.Customers
                .AsNoTracking()
                .AnyAsync(c => c.Id == customerId);

            if (!customerExists)
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
                .Where(p =>
                    p.LoanAccount != null &&
                    p.LoanAccount.CustomerId == customerId &&
                    p.PaymentDate >= startDate &&
                    p.PaymentDate < endDate)
                .Select(p => new
                {
                    Amount = p.PaymentAmount ?? 0,
                    Status = p.Status
                })
                .ToListAsync();

            var report = new PaymentSummaryResponse
            {
                PaymentCount = payments.Count,

                TotalPaid = payments.Sum(p => p.Amount),

                CompletedCount = payments.Count(
                    p => p.Status == "Completed"),

                PendingCount = payments.Count(
                    p => p.Status == "Pending"),

                FailedCount = payments.Count(
                    p => p.Status == "Failed")
            };

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating payment summary " +
                "for customer {CustomerId}",
                customerId);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while generating the payment summary report."
                });
        }
    }

    // GET: api/reports/payment-by-loan-account/{customerId}
    [HttpGet("payment-by-loan-account/{customerId}")]
    public async Task<IActionResult> GetPaymentsByLoanAccount(
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

            var customerExists = await _context.Customers
                .AsNoTracking()
                .AnyAsync(c => c.Id == customerId);

            if (!customerExists)
            {
                return NotFound(new
                {
                    message = "Customer not found."
                });
            }

            var startDate = dateFrom.Date;
            var endDate = dateTo.Date.AddDays(1);

            var report = await _context.Payments
                .AsNoTracking()
                .Where(p =>
                    p.LoanAccount != null &&
                    p.LoanAccount.CustomerId == customerId &&
                    p.PaymentDate >= startDate &&
                    p.PaymentDate < endDate)
                .GroupBy(p => new
                {
                    p.LoanAccountId,
                    p.LoanAccount!.LoanType,
                    p.LoanAccount.LoanName
                })
                .Select(g => new PaymentsByLoanAccountResponse
                {
                    LoanAccountId = g.Key.LoanAccountId ?? 0,

                    LoanType = g.Key.LoanType,

                    LoanName = g.Key.LoanName,

                    PaymentCount = g.Count(),

                    TotalPaid = g.Sum(
                        p => p.PaymentAmount ?? 0)
                })
                .OrderBy(x => x.LoanType)
                .ThenBy(x => x.LoanName)
                .ToListAsync();

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating payments by loan account " +
                "for customer {CustomerId}",
                customerId);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while generating the payments by loan account report."
                });
        }
    }
}
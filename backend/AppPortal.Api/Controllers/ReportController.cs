using AppPortal.Api.Data;
using AppPortal.Api.DTOs.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AppPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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


    // =========================================================
    // GET:
    // api/reports/payments/{customerId}
    // =========================================================

    [HttpGet("payments/{customerId}")]
    public async Task<IActionResult> GetPaymentReport(
        int customerId)
    {
        _logger.LogInformation(
            "Payment report request started. CustomerId: {CustomerId}",
            customerId);

        try
        {
            // =================================================
            // STEP 1: Find customer
            // =================================================

            _logger.LogInformation(
                "Looking up customer for payment report. CustomerId: {CustomerId}",
                customerId);

            var customer = await _context.Customers
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == customerId);

            if (customer == null)
            {
                _logger.LogWarning(
                    "Payment report requested for customer that does not exist. CustomerId: {CustomerId}",
                    customerId);

                return NotFound(new
                {
                    message = "Customer not found."
                });
            }

            _logger.LogInformation(
                "Customer found. Beginning payment query. CustomerId: {CustomerId}",
                customerId);


            // =================================================
            // STEP 2: Retrieve payments
            // =================================================

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

                    LoanAccountId =
                        p.LoanAccountId ?? 0,

                    LoanType =
                        p.LoanAccount!.LoanType,

                    LoanName =
                        p.LoanAccount.LoanName,

                    LenderName =
                        p.LoanAccount.LenderName,

                    PaymentAmount =
                        p.PaymentAmount ?? 0,

                    PaymentDate =
                        p.PaymentDate ?? DateTime.Today,

                    Status =
                        p.Status,

                    ConfirmationNumber =
                        p.ConfirmationNumber
                })
                .ToListAsync();

            _logger.LogInformation(
                "Payment query completed. CustomerId: {CustomerId}, PaymentCount: {PaymentCount}",
                customerId,
                payments.Count);


            // =================================================
            // STEP 3: Build report
            // =================================================

            var report = new PaymentReportResponse
            {
                CustomerId =
                    customer.Id,

                CustomerName =
                    $"{customer.FirstName} {customer.LastName}".Trim(),

                Email =
                    customer.Email,

                ReportDate =
                    DateTime.UtcNow,

                PaymentCount =
                    payments.Count,

                TotalAmount =
                    payments.Sum(p => p.PaymentAmount),

                Payments =
                    payments
            };

            _logger.LogInformation(
                "Payment report generated successfully. CustomerId: {CustomerId}, PaymentCount: {PaymentCount}, TotalAmount: {TotalAmount}",
                customerId,
                report.PaymentCount,
                report.TotalAmount);

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating payment report. CustomerId: {CustomerId}",
                customerId);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while generating the payment report."
                });
        }
    }


    // =========================================================
    // GET:
    // api/reports/payments/{customerId}/range
    // =========================================================

    [HttpGet("payments/{customerId}/range")]
    public async Task<IActionResult> GetPaymentReportByDateRange(
        int customerId,
        [FromQuery] DateTime dateFrom,
        [FromQuery] DateTime dateTo)
    {
        _logger.LogInformation(
            "Payment date-range report request started. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
            customerId,
            dateFrom,
            dateTo);

        try
        {
            // =================================================
            // STEP 1: Validate dates
            // =================================================

            if (dateFrom.Date > dateTo.Date)
            {
                _logger.LogWarning(
                    "Invalid payment report date range. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
                    customerId,
                    dateFrom,
                    dateTo);

                return BadRequest(new
                {
                    message =
                        "The start date cannot be after the end date."
                });
            }

            var startDate = dateFrom.Date;
            var endDate = dateTo.Date.AddDays(1);

            _logger.LogInformation(
                "Payment report date range validated. CustomerId: {CustomerId}, StartDate: {StartDate}, EndDateExclusive: {EndDate}",
                customerId,
                startDate,
                endDate);


            // =================================================
            // STEP 2: Find customer
            // =================================================

            _logger.LogInformation(
                "Looking up customer for date-range payment report. CustomerId: {CustomerId}",
                customerId);

            var customer = await _context.Customers
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == customerId);

            if (customer == null)
            {
                _logger.LogWarning(
                    "Date-range payment report requested for customer that does not exist. CustomerId: {CustomerId}",
                    customerId);

                return NotFound(new
                {
                    message = "Customer not found."
                });
            }


            // =================================================
            // STEP 3: Retrieve payments
            // =================================================

            _logger.LogInformation(
                "Querying payments for date range. CustomerId: {CustomerId}, StartDate: {StartDate}, EndDateExclusive: {EndDate}",
                customerId,
                startDate,
                endDate);

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
                    PaymentId =
                        p.Id ?? 0,

                    LoanAccountId =
                        p.LoanAccountId ?? 0,

                    LoanType =
                        p.LoanAccount!.LoanType,

                    LoanName =
                        p.LoanAccount.LoanName,

                    LenderName =
                        p.LoanAccount.LenderName,

                    PaymentAmount =
                        p.PaymentAmount ?? 0,

                    PaymentDate =
                        p.PaymentDate ?? DateTime.Today,

                    Status =
                        p.Status,

                    ConfirmationNumber =
                        p.ConfirmationNumber
                })
                .ToListAsync();

            _logger.LogInformation(
                "Date-range payment query completed. CustomerId: {CustomerId}, PaymentCount: {PaymentCount}",
                customerId,
                payments.Count);


            // =================================================
            // STEP 4: Build report
            // =================================================

            var report = new PaymentReportResponse
            {
                CustomerId =
                    customer.Id,

                CustomerName =
                    $"{customer.FirstName} {customer.LastName}".Trim(),

                Email =
                    customer.Email,

                ReportDate =
                    DateTime.UtcNow,

                PaymentCount =
                    payments.Count,

                TotalAmount =
                    payments.Sum(p => p.PaymentAmount),

                Payments =
                    payments
            };

            _logger.LogInformation(
                "Date-range payment report generated successfully. CustomerId: {CustomerId}, PaymentCount: {PaymentCount}, TotalAmount: {TotalAmount}",
                customerId,
                report.PaymentCount,
                report.TotalAmount);

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating date-range payment report. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
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


    // =========================================================
    // GET:
    // api/reports/payment-total-by-loan-type/{customerId}
    // =========================================================

    [HttpGet("payment-total-by-loan-type/{customerId}")]
    public async Task<IActionResult> GetPaymentTotalsByLoanType(
        int customerId,
        [FromQuery] DateTime dateFrom,
        [FromQuery] DateTime dateTo)
    {
        _logger.LogInformation(
            "Payment totals by loan type report started. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
            customerId,
            dateFrom,
            dateTo);

        try
        {
            if (dateFrom.Date > dateTo.Date)
            {
                _logger.LogWarning(
                    "Invalid date range for payment totals by loan type. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
                    customerId,
                    dateFrom,
                    dateTo);

                return BadRequest(new
                {
                    message =
                        "The start date cannot be after the end date."
                });
            }

            var customerExists = await _context.Customers
                .AsNoTracking()
                .AnyAsync(c => c.Id == customerId);

            if (!customerExists)
            {
                _logger.LogWarning(
                    "Payment totals by loan type requested for non-existent customer. CustomerId: {CustomerId}",
                    customerId);

                return NotFound(new
                {
                    message = "Customer not found."
                });
            }

            _logger.LogInformation(
                "Customer validated. Querying payment totals by loan type. CustomerId: {CustomerId}",
                customerId);

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

            _logger.LogInformation(
                "Payment totals by loan type generated successfully. CustomerId: {CustomerId}, LoanTypeCount: {LoanTypeCount}",
                customerId,
                report.Count);

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating payment totals by loan type. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
                customerId,
                dateFrom,
                dateTo);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while generating the payment totals by loan type report."
                });
        }
    }


    // =========================================================
    // GET:
    // api/reports/payment-total-by-status/{customerId}
    // =========================================================

    [HttpGet("payment-total-by-status/{customerId}")]
    public async Task<IActionResult> GetPaymentTotalsByStatus(
        int customerId,
        [FromQuery] DateTime dateFrom,
        [FromQuery] DateTime dateTo)
    {
        _logger.LogInformation(
            "Payment totals by status report started. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
            customerId,
            dateFrom,
            dateTo);

        try
        {
            if (dateFrom.Date > dateTo.Date)
            {
                _logger.LogWarning(
                    "Invalid date range for payment totals by status. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
                    customerId,
                    dateFrom,
                    dateTo);

                return BadRequest(new
                {
                    message =
                        "The start date cannot be after the end date."
                });
            }

            var customerExists = await _context.Customers
                .AsNoTracking()
                .AnyAsync(c => c.Id == customerId);

            if (!customerExists)
            {
                _logger.LogWarning(
                    "Payment totals by status requested for non-existent customer. CustomerId: {CustomerId}",
                    customerId);

                return NotFound(new
                {
                    message = "Customer not found."
                });
            }

            _logger.LogInformation(
                "Customer validated. Querying payment totals by status. CustomerId: {CustomerId}",
                customerId);

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

            _logger.LogInformation(
                "Payment totals by status generated successfully. CustomerId: {CustomerId}, StatusCount: {StatusCount}",
                customerId,
                report.Count);

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating payment totals by status. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
                customerId,
                dateFrom,
                dateTo);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while generating the payment totals by status report."
                });
        }
    }


    // =========================================================
    // GET:
    // api/reports/payment-by-month/{customerId}
    // =========================================================

    [HttpGet("payment-by-month/{customerId}")]
    public async Task<IActionResult> GetPaymentsByMonth(
        int customerId,
        [FromQuery] DateTime dateFrom,
        [FromQuery] DateTime dateTo)
    {
        _logger.LogInformation(
            "Payments by month report started. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
            customerId,
            dateFrom,
            dateTo);

        try
        {
            if (dateFrom.Date > dateTo.Date)
            {
                _logger.LogWarning(
                    "Invalid date range for payments by month. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
                    customerId,
                    dateFrom,
                    dateTo);

                return BadRequest(new
                {
                    message =
                        "The start date cannot be after the end date."
                });
            }

            var customerExists = await _context.Customers
                .AsNoTracking()
                .AnyAsync(c => c.Id == customerId);

            if (!customerExists)
            {
                _logger.LogWarning(
                    "Payments by month requested for non-existent customer. CustomerId: {CustomerId}",
                    customerId);

                return NotFound(new
                {
                    message = "Customer not found."
                });
            }

            var startDate = dateFrom.Date;
            var endDate = dateTo.Date.AddDays(1);

            _logger.LogInformation(
                "Querying payment records for monthly report. CustomerId: {CustomerId}, StartDate: {StartDate}, EndDateExclusive: {EndDate}",
                customerId,
                startDate,
                endDate);

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

            _logger.LogInformation(
                "Payment records retrieved for monthly report. CustomerId: {CustomerId}, PaymentCount: {PaymentCount}",
                customerId,
                payments.Count);

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

                    TotalPaid = g.Sum(
                        p => p.PaymentAmount)
                })
                .OrderBy(x => x.Month)
                .ToList();

            _logger.LogInformation(
                "Payments by month report generated successfully. CustomerId: {CustomerId}, MonthCount: {MonthCount}",
                customerId,
                report.Count);

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating payments by month report. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
                customerId,
                dateFrom,
                dateTo);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while generating the payments by month report."
                });
        }
    }


    // =========================================================
    // GET:
    // api/reports/payment-summary/{customerId}
    // =========================================================

    [HttpGet("payment-summary/{customerId}")]
    public async Task<IActionResult> GetPaymentSummary(
        int customerId,
        [FromQuery] DateTime dateFrom,
        [FromQuery] DateTime dateTo)
    {
        _logger.LogInformation(
            "Payment summary report started. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
            customerId,
            dateFrom,
            dateTo);

        try
        {
            if (dateFrom.Date > dateTo.Date)
            {
                _logger.LogWarning(
                    "Invalid date range for payment summary. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
                    customerId,
                    dateFrom,
                    dateTo);

                return BadRequest(new
                {
                    message =
                        "The start date cannot be after the end date."
                });
            }

            var customerExists = await _context.Customers
                .AsNoTracking()
                .AnyAsync(c => c.Id == customerId);

            if (!customerExists)
            {
                _logger.LogWarning(
                    "Payment summary requested for non-existent customer. CustomerId: {CustomerId}",
                    customerId);

                return NotFound(new
                {
                    message = "Customer not found."
                });
            }

            var startDate = dateFrom.Date;
            var endDate = dateTo.Date.AddDays(1);

            _logger.LogInformation(
                "Querying payments for payment summary. CustomerId: {CustomerId}, StartDate: {StartDate}, EndDateExclusive: {EndDate}",
                customerId,
                startDate,
                endDate);

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

            _logger.LogInformation(
                "Payment summary source data retrieved. CustomerId: {CustomerId}, PaymentCount: {PaymentCount}",
                customerId,
                payments.Count);

            var report = new PaymentSummaryResponse
            {
                PaymentCount =
                    payments.Count,

                TotalPaid =
                    payments.Sum(p => p.Amount),

                CompletedCount =
                    payments.Count(
                        p => p.Status == "Completed"),

                PendingCount =
                    payments.Count(
                        p => p.Status == "Pending"),

                FailedCount =
                    payments.Count(
                        p => p.Status == "Failed")
            };

            _logger.LogInformation(
                "Payment summary generated successfully. CustomerId: {CustomerId}, PaymentCount: {PaymentCount}, TotalPaid: {TotalPaid}, CompletedCount: {CompletedCount}, PendingCount: {PendingCount}, FailedCount: {FailedCount}",
                customerId,
                report.PaymentCount,
                report.TotalPaid,
                report.CompletedCount,
                report.PendingCount,
                report.FailedCount);

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating payment summary. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
                customerId,
                dateFrom,
                dateTo);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while generating the payment summary report."
                });
        }
    }


    // =========================================================
    // GET:
    // api/reports/payment-by-loan-account/{customerId}
    // =========================================================

    [HttpGet("payment-by-loan-account/{customerId}")]
    public async Task<IActionResult> GetPaymentsByLoanAccount(
        int customerId,
        [FromQuery] DateTime dateFrom,
        [FromQuery] DateTime dateTo)
    {
        _logger.LogInformation(
            "Payments by loan account report started. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
            customerId,
            dateFrom,
            dateTo);

        try
        {
            if (dateFrom.Date > dateTo.Date)
            {
                _logger.LogWarning(
                    "Invalid date range for payments by loan account. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
                    customerId,
                    dateFrom,
                    dateTo);

                return BadRequest(new
                {
                    message =
                        "The start date cannot be after the end date."
                });
            }

            var customerExists = await _context.Customers
                .AsNoTracking()
                .AnyAsync(c => c.Id == customerId);

            if (!customerExists)
            {
                _logger.LogWarning(
                    "Payments by loan account requested for non-existent customer. CustomerId: {CustomerId}",
                    customerId);

                return NotFound(new
                {
                    message = "Customer not found."
                });
            }

            var startDate = dateFrom.Date;
            var endDate = dateTo.Date.AddDays(1);

            _logger.LogInformation(
                "Querying payments grouped by loan account. CustomerId: {CustomerId}, StartDate: {StartDate}, EndDateExclusive: {EndDate}",
                customerId,
                startDate,
                endDate);

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
                    LoanAccountId =
                        g.Key.LoanAccountId ?? 0,

                    LoanType =
                        g.Key.LoanType,

                    LoanName =
                        g.Key.LoanName,

                    PaymentCount =
                        g.Count(),

                    TotalPaid =
                        g.Sum(p =>
                            p.PaymentAmount ?? 0)
                })
                .OrderBy(x => x.LoanType)
                .ThenBy(x => x.LoanName)
                .ToListAsync();

            _logger.LogInformation(
                "Payments by loan account report generated successfully. CustomerId: {CustomerId}, LoanAccountCount: {LoanAccountCount}",
                customerId,
                report.Count);

            foreach (var item in report)
            {
                _logger.LogInformation(
                    "Loan account report result. CustomerId: {CustomerId}, LoanAccountId: {LoanAccountId}, PaymentCount: {PaymentCount}, TotalPaid: {TotalPaid}",
                    customerId,
                    item.LoanAccountId,
                    item.PaymentCount,
                    item.TotalPaid);
            }

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating payments by loan account report. CustomerId: {CustomerId}, DateFrom: {DateFrom}, DateTo: {DateTo}",
                customerId,
                dateFrom,
                dateTo);

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


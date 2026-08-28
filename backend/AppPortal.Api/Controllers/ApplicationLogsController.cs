using AppPortal.Api.Data;
using AppPortal.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AppPortal.Api.DTOs;

namespace AppPortal.Api.Controllers;

[ApiController]
[Route("api/applicationlogs")]
[Authorize]
public class ApplicationLogsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ApplicationLogsController> _logger;

    public ApplicationLogsController(
        ApplicationDbContext context,
        ILogger<ApplicationLogsController> logger)
    {
        _context = context;
        _logger = logger;
    }


    [HttpPost]
    public async Task<IActionResult> CreateLog(
        [FromBody] ApplicationLogRequest request)
    {
        try
        {
            var log = new ApplicationLog
            {
                Timestamp = DateTime.UtcNow,

                Level =
                    string.IsNullOrWhiteSpace(request.Level)
                        ? "Information"
                        : request.Level,

                Message =
                    request.Message,

                Exception =
                    request.Exception,

                SourceContext =
                    request.SourceContext,

                RequestPath =
                    request.RequestPath,

                HttpMethod =
                    request.HttpMethod,

                StatusCode =
                    request.StatusCode,

                CustomerId =
                    request.CustomerId,

                LoanAccountId =
                    request.LoanAccountId,

                PaymentId =
                    request.PaymentId,

                TransactionId =
                    request.TransactionId,

                CorrelationId =
                    request.CorrelationId
            };


            _context.ApplicationLogs.Add(log);

            await _context.SaveChangesAsync();

            return Ok();
        }
        catch (Exception ex)
        {
            // This is intentionally not written back
            // through the database logging mechanism,
            // otherwise a database logging failure could
            // result in a recursive logging failure.

            _logger.LogError(
                ex,
                "Unable to write application log to database.");

            return StatusCode(
                StatusCodes.Status500InternalServerError);
        }
    }
}
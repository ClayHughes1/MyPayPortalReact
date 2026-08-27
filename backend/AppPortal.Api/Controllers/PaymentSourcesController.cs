using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppPortal.Api.Data;
using AppPortal.Api.DTOs;
using AppPortal.Api.Models;

namespace AppPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentSourcesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PaymentSourcesController> _logger;

    public PaymentSourcesController(
        ApplicationDbContext context,
        ILogger<PaymentSourcesController> logger)
    {
        _context = context;
        _logger = logger;
    }


    // ============================================================
    // GET:
    // api/PaymentSources
    // ============================================================

    [HttpGet]
    public async Task<IActionResult> GetPaymentSources()
    {
        var userId = GetAuthenticatedUserId();

        if (userId == null)
        {
            _logger.LogWarning(
                "Unable to retrieve payment sources because authenticated user ID could not be determined.");

            return Unauthorized();
        }

        _logger.LogInformation(
            "Payment sources request started. CustomerId: {CustomerId}",
            userId.Value);

        try
        {
            var paymentSources =
                await _context.PaymentSources

                    .Where(p =>
                        p.CustomerId == userId.Value &&
                        p.Status == "Active")

                    .OrderByDescending(
                        p => p.IsDefault)

                    .ThenBy(
                        p => p.CreatedDate)

                    .Select(p => new PaymentSourceResponse
                    {
                        Id = p.Id,

                        PaymentType =
                            p.PaymentType ?? string.Empty,

                        AccountType =
                            p.AccountType,

                        LastFour =
                            p.LastFour,

                        Provider =
                            p.Provider,

                        IsDefault =
                            p.IsDefault,

                        Status =
                            p.Status ?? string.Empty,

                        CreatedDate =
                            p.CreatedDate,

                        UpdatedDate =
                            p.UpdatedDate
                    })

                    .ToListAsync();


            _logger.LogInformation(
                "Payment sources retrieved successfully. CustomerId: {CustomerId}, PaymentSourceCount: {PaymentSourceCount}",
                userId.Value,
                paymentSources.Count);

            return Ok(paymentSources);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error retrieving payment sources. CustomerId: {CustomerId}",
                userId.Value);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while retrieving payment sources."
                });
        }
    }


    // ============================================================
    // GET:
    // api/PaymentSources/1
    // ============================================================

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPaymentSource(int id)
    {
        var userId = GetAuthenticatedUserId();

        if (userId == null)
        {
            _logger.LogWarning(
                "Unable to retrieve payment source {PaymentSourceId} because authenticated user ID could not be determined.",
                id);

            return Unauthorized();
        }

        _logger.LogInformation(
            "Payment source request started. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}",
            userId.Value,
            id);

        try
        {
            var paymentSource =
                await _context.PaymentSources

                    .Where(p =>
                        p.Id == id &&
                        p.CustomerId == userId.Value &&
                        p.Status == "Active")

                    .Select(p => new PaymentSourceResponse
                    {
                        Id = p.Id,

                        PaymentType =
                            p.PaymentType ?? string.Empty,

                        AccountType =
                            p.AccountType,

                        LastFour =
                            p.LastFour,

                        Provider =
                            p.Provider,

                        IsDefault =
                            p.IsDefault,

                        Status =
                            p.Status ?? string.Empty,

                        CreatedDate =
                            p.CreatedDate,

                        UpdatedDate =
                            p.UpdatedDate
                    })

                    .FirstOrDefaultAsync();


            if (paymentSource == null)
            {
                _logger.LogWarning(
                    "Payment source not found. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}",
                    userId.Value,
                    id);

                return NotFound();
            }


            _logger.LogInformation(
                "Payment source retrieved successfully. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}",
                userId.Value,
                id);

            return Ok(paymentSource);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error retrieving payment source. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}",
                userId.Value,
                id);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while retrieving the payment source."
                });
        }
    }


    // ============================================================
    // POST:
    // api/PaymentSources
    // ============================================================

    [HttpPost]
    public async Task<IActionResult> CreatePaymentSource(
        CreatePaymentSourceRequest request)
    {
        var userId = GetAuthenticatedUserId();

        if (userId == null)
        {
            _logger.LogWarning(
                "Payment source creation rejected because authenticated user ID could not be determined.");

            return Unauthorized();
        }

        _logger.LogInformation(
            "Payment source creation started. CustomerId: {CustomerId}, PaymentType: {PaymentType}, AccountType: {AccountType}, Provider: {Provider}, IsDefault: {IsDefault}",
            userId.Value,
            request.PaymentType,
            request.AccountType,
            request.Provider,
            request.IsDefault);

        try
        {
            // --------------------------------------------------------
            // If this source is being made the default,
            // remove the default status from existing sources.
            // --------------------------------------------------------

            if (request.IsDefault)
            {
                _logger.LogInformation(
                    "New payment source will be set as default. Checking existing default payment sources. CustomerId: {CustomerId}",
                    userId.Value);

                var existingDefaults =
                    await _context.PaymentSources

                        .Where(p =>
                            p.CustomerId == userId.Value &&
                            p.IsDefault &&
                            p.Status == "Active")

                        .ToListAsync();


                _logger.LogInformation(
                    "Existing default payment sources found. CustomerId: {CustomerId}, ExistingDefaultCount: {ExistingDefaultCount}",
                    userId.Value,
                    existingDefaults.Count);


                foreach (var source in existingDefaults)
                {
                    source.IsDefault = false;
                }

                if (existingDefaults.Count > 0)
                {
                    _logger.LogInformation(
                        "Existing default payment sources cleared. CustomerId: {CustomerId}",
                        userId.Value);
                }
            }


            var paymentSource = new PaymentSource
            {
                CustomerId =
                    userId.Value,

                PaymentType =
                    request.PaymentType,

                AccountType =
                    request.AccountType,

                LastFour =
                    request.LastFour,

                Provider =
                    request.Provider,

                ProviderPaymentMethodId =
                    request.ProviderPaymentMethodId,

                IsDefault =
                    request.IsDefault,

                Status =
                    "Active",

                CreatedDate =
                    DateTime.UtcNow
            };


            _context.PaymentSources.Add(
                paymentSource);


            _logger.LogInformation(
                "Payment source entity created and being saved. CustomerId: {CustomerId}, PaymentType: {PaymentType}, Provider: {Provider}, IsDefault: {IsDefault}",
                userId.Value,
                request.PaymentType,
                request.Provider,
                request.IsDefault);


            await _context.SaveChangesAsync();


            _logger.LogInformation(
                "Payment source created successfully. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}, IsDefault: {IsDefault}",
                userId.Value,
                paymentSource.Id,
                paymentSource.IsDefault);


            var response = new PaymentSourceResponse
            {
                Id =
                    paymentSource.Id,

                PaymentType =
                    paymentSource.PaymentType,

                AccountType =
                    paymentSource.AccountType,

                LastFour =
                    paymentSource.LastFour,

                Provider =
                    paymentSource.Provider,

                IsDefault =
                    paymentSource.IsDefault,

                Status =
                    paymentSource.Status,

                CreatedDate =
                    paymentSource.CreatedDate,

                UpdatedDate =
                    paymentSource.UpdatedDate
            };


            return CreatedAtAction(
                nameof(GetPaymentSource),
                new
                {
                    id = paymentSource.Id
                },
                response);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error creating payment source. CustomerId: {CustomerId}, PaymentType: {PaymentType}, Provider: {Provider}",
                userId.Value,
                request.PaymentType,
                request.Provider);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while creating the payment source."
                });
        }
    }


    // ============================================================
    // PUT:
    // api/PaymentSources/1
    // ============================================================

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePaymentSource(
        int id,
        CreatePaymentSourceRequest request)
    {
        var userId = GetAuthenticatedUserId();

        if (userId == null)
        {
            _logger.LogWarning(
                "Payment source update rejected because authenticated user ID could not be determined. PaymentSourceId: {PaymentSourceId}",
                id);

            return Unauthorized();
        }

        _logger.LogInformation(
            "Payment source update started. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}, PaymentType: {PaymentType}, Provider: {Provider}, IsDefault: {IsDefault}",
            userId.Value,
            id,
            request.PaymentType,
            request.Provider,
            request.IsDefault);

        try
        {
            var paymentSource =
                await _context.PaymentSources

                    .FirstOrDefaultAsync(p =>
                        p.Id == id &&
                        p.CustomerId == userId.Value &&
                        p.Status == "Active");


            if (paymentSource == null)
            {
                _logger.LogWarning(
                    "Payment source update failed because payment source was not found or does not belong to customer. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}",
                    userId.Value,
                    id);

                return NotFound();
            }


            // --------------------------------------------------------
            // Handle default payment source
            // --------------------------------------------------------

            if (request.IsDefault)
            {
                _logger.LogInformation(
                    "Payment source is being changed to default. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}",
                    userId.Value,
                    id);

                var existingDefaults =
                    await _context.PaymentSources

                        .Where(p =>
                            p.CustomerId == userId.Value &&
                            p.Id != id &&
                            p.IsDefault &&
                            p.Status == "Active")

                        .ToListAsync();


                _logger.LogInformation(
                    "Existing default payment sources found during update. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}, ExistingDefaultCount: {ExistingDefaultCount}",
                    userId.Value,
                    id,
                    existingDefaults.Count);


                foreach (var source in existingDefaults)
                {
                    source.IsDefault = false;
                }
            }


            paymentSource.PaymentType =
                request.PaymentType;

            paymentSource.AccountType =
                request.AccountType;

            paymentSource.LastFour =
                request.LastFour;

            paymentSource.Provider =
                request.Provider;

            paymentSource.ProviderPaymentMethodId =
                request.ProviderPaymentMethodId;

            paymentSource.IsDefault =
                request.IsDefault;

            paymentSource.UpdatedDate =
                DateTime.UtcNow;


            _logger.LogInformation(
                "Payment source entity updated and being saved. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}",
                userId.Value,
                id);


            await _context.SaveChangesAsync();


            _logger.LogInformation(
                "Payment source updated successfully. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}, IsDefault: {IsDefault}",
                userId.Value,
                id,
                paymentSource.IsDefault);


            var response = new PaymentSourceResponse
            {
                Id =
                    paymentSource.Id,

                PaymentType =
                    paymentSource.PaymentType,

                AccountType =
                    paymentSource.AccountType,

                LastFour =
                    paymentSource.LastFour,

                Provider =
                    paymentSource.Provider,

                IsDefault =
                    paymentSource.IsDefault,

                Status =
                    paymentSource.Status ?? string.Empty,

                CreatedDate =
                    paymentSource.CreatedDate,

                UpdatedDate =
                    paymentSource.UpdatedDate
            };


            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error updating payment source. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}",
                userId.Value,
                id);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while updating the payment source."
                });
        }
    }


    // ============================================================
    // DELETE:
    // api/PaymentSources/1
    // ============================================================

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePaymentSource(
        int id)
    {
        var userId = GetAuthenticatedUserId();

        if (userId == null)
        {
            _logger.LogWarning(
                "Payment source deletion rejected because authenticated user ID could not be determined. PaymentSourceId: {PaymentSourceId}",
                id);

            return Unauthorized();
        }

        _logger.LogInformation(
            "Payment source deletion started. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}",
            userId.Value,
            id);

        try
        {
            var paymentSource =
                await _context.PaymentSources

                    .FirstOrDefaultAsync(p =>
                        p.Id == id &&
                        p.CustomerId == userId.Value &&
                        p.Status == "Active");


            if (paymentSource == null)
            {
                _logger.LogWarning(
                    "Payment source deletion failed because payment source was not found or does not belong to customer. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}",
                    userId.Value,
                    id);

                return NotFound();
            }


            // --------------------------------------------------------
            // Soft delete
            // --------------------------------------------------------

            paymentSource.Status =
                "Inactive";

            paymentSource.IsDefault =
                false;

            paymentSource.UpdatedDate =
                DateTime.UtcNow;


            _logger.LogInformation(
                "Payment source marked inactive. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}",
                userId.Value,
                id);


            await _context.SaveChangesAsync();


            _logger.LogInformation(
                "Payment source deleted successfully using soft delete. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}",
                userId.Value,
                id);


            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error deleting payment source. CustomerId: {CustomerId}, PaymentSourceId: {PaymentSourceId}",
                userId.Value,
                id);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while deleting the payment source."
                });
        }
    }


    // ============================================================
    // AUTHENTICATED USER ID
    // ============================================================

    private int? GetAuthenticatedUserId()
    {
        var userIdClaim =
            User.FindFirst(
                ClaimTypes.NameIdentifier);


        if (userIdClaim == null)
        {
            _logger.LogWarning(
                "Authenticated request did not contain a NameIdentifier claim.");

            return null;
        }


        if (!int.TryParse(
                userIdClaim.Value,
                out var userId))
        {
            _logger.LogWarning(
                "NameIdentifier claim could not be parsed as an integer.");

            return null;
        }


        return userId;
    }
}

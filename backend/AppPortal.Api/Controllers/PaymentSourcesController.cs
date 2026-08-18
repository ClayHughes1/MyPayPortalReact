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
            return Unauthorized();
        }


        _logger.LogInformation(
            "Payment sources requested for UserId: {UserId}",
            userId);


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


        return Ok(paymentSources);
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
            return Unauthorized();
        }


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
                        p.PaymentType ?? string .Empty,

                    AccountType =
                        p.AccountType,

                    LastFour =
                        p.LastFour,

                    Provider =
                        p.Provider,

                    IsDefault =
                        p.IsDefault,

                    Status =
                        p.Status ?? string .Empty,

                    CreatedDate =
                        p.CreatedDate,

                    UpdatedDate =
                        p.UpdatedDate
                })

                .FirstOrDefaultAsync();


        if (paymentSource == null)
        {
            return NotFound();
        }


        return Ok(paymentSource);
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
            return Unauthorized();
        }


        _logger.LogInformation(
            "Creating payment source for UserId: {UserId}",
            userId);


        // --------------------------------------------------------
        // If this source is being made the default,
        // remove the default status from existing sources.
        // --------------------------------------------------------

        if (request.IsDefault)
        {
            var existingDefaults =
                await _context.PaymentSources

                    .Where(p =>
                        p.CustomerId == userId.Value &&
                        p.IsDefault &&
                        p.Status == "Active")

                    .ToListAsync();


            foreach (var source in existingDefaults)
            {
                source.IsDefault = false;
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


        await _context.SaveChangesAsync();


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
            return Unauthorized();
        }


        var paymentSource =
            await _context.PaymentSources

                .FirstOrDefaultAsync(p =>
                    p.Id == id &&
                    p.CustomerId == userId.Value &&
                    p.Status == "Active");


        if (paymentSource == null)
        {
            return NotFound();
        }


        // --------------------------------------------------------
        // Handle default payment source
        // --------------------------------------------------------

        if (request.IsDefault)
        {
            var existingDefaults =
                await _context.PaymentSources

                    .Where(p =>
                        p.CustomerId == userId.Value &&
                        p.Id != id &&
                        p.IsDefault &&
                        p.Status == "Active")

                    .ToListAsync();


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


        await _context.SaveChangesAsync();


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
                paymentSource.Status ?? string .Empty,

            CreatedDate =
                paymentSource.CreatedDate,

            UpdatedDate =
                paymentSource.UpdatedDate
        };


        return Ok(response);
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
            return Unauthorized();
        }


        var paymentSource =
            await _context.PaymentSources

                .FirstOrDefaultAsync(p =>
                    p.Id == id &&
                    p.CustomerId == userId.Value &&
                    p.Status == "Active");


        if (paymentSource == null)
        {
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


        await _context.SaveChangesAsync();


        return NoContent();
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
            return null;
        }


        if (!int.TryParse(
                userIdClaim.Value,
                out var userId))
        {
            return null;
        }


        return userId;
    }
}

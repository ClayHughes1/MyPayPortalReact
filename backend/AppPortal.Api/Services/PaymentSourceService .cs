using AppPortal.Api.Data;
using AppPortal.Api.DTOs;
using AppPortal.Api.Models;
using AppPortal.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace AppPortal.Api.Services;

public class PaymentSourceService : IPaymentSourceService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PaymentSourceService> _logger;

    public PaymentSourceService(
        ApplicationDbContext context,
        ILogger<PaymentSourceService> logger)
    {
        _context = context;
        _logger = logger;
    }


    // ============================================================
    // GET ALL
    // ============================================================

    public async Task<List<PaymentSourceResponse>>
        GetPaymentSourcesAsync(int customerId)
    {
        _logger.LogInformation(
            "Retrieving payment sources. CustomerId: {CustomerId}",
            customerId);

        return await _context.PaymentSources

            .Where(p =>
                p.CustomerId == customerId &&
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
    }


    // ============================================================
    // GET BY ID
    // ============================================================

    public async Task<PaymentSourceResponse?>
        GetPaymentSourceAsync(
            int customerId,
            int paymentSourceId)
    {
        return await _context.PaymentSources

            .Where(p =>
                p.Id == paymentSourceId &&
                p.CustomerId == customerId &&
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
    }


    // ============================================================
    // CREATE
    // ============================================================

    public async Task<PaymentSourceResponse>
        CreatePaymentSourceAsync(
            int customerId,
            CreatePaymentSourceRequest request)
    {
        // --------------------------------------------------------
        // Handle default payment source
        // --------------------------------------------------------

        if (request.IsDefault)
        {
            var existingDefaults =
                await _context.PaymentSources

                    .Where(p =>
                        p.CustomerId == customerId &&
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
                customerId,

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


        return MapToResponse(
            paymentSource);
    }


    // ============================================================
    // UPDATE
    // ============================================================

    public async Task<PaymentSourceResponse?>
        UpdatePaymentSourceAsync(
            int customerId,
            int paymentSourceId,
            CreatePaymentSourceRequest request)
    {
        var paymentSource =
            await _context.PaymentSources

                .FirstOrDefaultAsync(p =>
                    p.Id == paymentSourceId &&
                    p.CustomerId == customerId &&
                    p.Status == "Active");


        if (paymentSource == null)
        {
            return null;
        }


        // --------------------------------------------------------
        // Handle default payment source
        // --------------------------------------------------------

        if (request.IsDefault)
        {
            var existingDefaults =
                await _context.PaymentSources

                    .Where(p =>
                        p.CustomerId == customerId &&
                        p.Id != paymentSourceId &&
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


        return MapToResponse(
            paymentSource);
    }


    // ============================================================
    // DELETE / SOFT DELETE
    // ============================================================

    public async Task<bool>
        DeletePaymentSourceAsync(
            int customerId,
            int paymentSourceId)
    {
        var paymentSource =
            await _context.PaymentSources

                .FirstOrDefaultAsync(p =>
                    p.Id == paymentSourceId &&
                    p.CustomerId == customerId &&
                    p.Status == "Active");


        if (paymentSource == null)
        {
            return false;
        }


        paymentSource.Status =
            "Inactive";

        paymentSource.IsDefault =
            false;

        paymentSource.UpdatedDate =
            DateTime.UtcNow;


        await _context.SaveChangesAsync();


        return true;
    }


    // ============================================================
    // MAPPING
    // ============================================================

    private static PaymentSourceResponse
        MapToResponse(
            PaymentSource paymentSource)
    {
        return new PaymentSourceResponse
        {
            Id =
                paymentSource.Id,

            PaymentType =
                paymentSource.PaymentType ?? string.Empty,

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
    }
}

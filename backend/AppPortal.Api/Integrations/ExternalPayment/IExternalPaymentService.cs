using AppPortal.Api.DTOs.Integrations;

namespace AppPortal.Api.Integrations.ExternalPayment;

public interface IExternalPaymentService
{
    Task<ExternalPaymentResponse?> ProcessPaymentAsync(
        ExternalPaymentRequest request);
}
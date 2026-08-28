using AppPortal.Api.DTOs;

namespace AppPortal.Api.Services;

public interface IPaymentSourceService
{
    Task<List<PaymentSourceResponse>> GetPaymentSourcesAsync(
        int customerId);

    Task<PaymentSourceResponse?> GetPaymentSourceAsync(
        int customerId,
        int paymentSourceId);

    Task<PaymentSourceResponse> CreatePaymentSourceAsync(
        int customerId,
        CreatePaymentSourceRequest request);

    Task<PaymentSourceResponse?> UpdatePaymentSourceAsync(
        int customerId,
        int paymentSourceId,
        CreatePaymentSourceRequest request);

    Task<bool> DeletePaymentSourceAsync(
        int customerId,
        int paymentSourceId);
}

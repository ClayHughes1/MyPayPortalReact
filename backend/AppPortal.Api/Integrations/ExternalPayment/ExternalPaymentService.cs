using System.Net.Http.Json;
using AppPortal.Api.DTOs.Integrations;

namespace AppPortal.Api.Integrations.ExternalPayment;

public class ExternalPaymentService : IExternalPaymentService
{
    private readonly HttpClient _httpClient;

    public ExternalPaymentService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ExternalPaymentResponse?> ProcessPaymentAsync(
        ExternalPaymentRequest request)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync(
                "api/external/payments",
                request);

            if (!response.IsSuccessStatusCode)
            {
                throw new ExternalPaymentException(
                    $"External payment API returned HTTP {(int)response.StatusCode}.");
            }

            return await response.Content
                .ReadFromJsonAsync<ExternalPaymentResponse>();
        }
        catch (HttpRequestException ex)
        {
            throw new ExternalPaymentException(
                "The external payment service could not be reached.",
                ex);
        }
        catch (TaskCanceledException ex)
        {
            throw new ExternalPaymentException(
                "The external payment service request timed out.",
                ex);
        }
    }
}
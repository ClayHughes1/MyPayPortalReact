namespace AppPortal.Api.DTOs;

public class CreatePaymentSourceRequest
{
    public string PaymentType { get; set; } = string.Empty;

    public string? AccountType { get; set; }

    public string? LastFour { get; set; }

    public string? Provider { get; set; }

    public string? ProviderPaymentMethodId { get; set; }

    public bool IsDefault { get; set; }
}



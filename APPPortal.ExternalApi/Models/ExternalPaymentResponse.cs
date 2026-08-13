namespace APPPortal.ExternalApi.Models;

public class ExternalPaymentResponse
{
    public bool Success { get; set; }

    public string ConfirmationNumber { get; set; } = string.Empty;

    public string TransactionId { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;
}
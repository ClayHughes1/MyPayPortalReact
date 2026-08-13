namespace APPPortal.ExternalApi.Models;

public class ExternalPaymentRequest
{
    public int CustomerId { get; set; }

    public int LoanAccountId { get; set; }

    public decimal PaymentAmount { get; set; }

    public string PaymentType { get; set; } = string.Empty;
}
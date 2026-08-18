namespace AppPortal.Api.DTOs.Reports;

public class PaymentTotalsByStatusResponse
{
    public string? Status { get; set; }

    public int PaymentCount { get; set; }

    public decimal TotalAmount { get; set; }
}
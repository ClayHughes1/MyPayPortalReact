namespace AppPortal.Api.DTOs.Reports;

public class PaymentsByMonthResponse
{
    public string? Month { get; set; }

    public int PaymentCount { get; set; }

    public decimal TotalPaid { get; set; }
}
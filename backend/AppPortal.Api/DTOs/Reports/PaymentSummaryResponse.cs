namespace AppPortal.Api.DTOs.Reports;

public class PaymentSummaryResponse
{
    public int PaymentCount { get; set; }

    public decimal TotalPaid { get; set; }

    public int CompletedCount { get; set; }

    public int PendingCount { get; set; }

    public int FailedCount { get; set; }
}
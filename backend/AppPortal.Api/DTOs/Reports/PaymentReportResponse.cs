namespace AppPortal.Api.DTOs.Reports;

public class PaymentReportResponse
{
    public int CustomerId { get; set; }

    public string? CustomerName { get; set; }

    public string? Email { get; set; }

    public DateTime ReportDate { get; set; }

    // public decimal TotalPayments { get; set; }

    public int PaymentCount { get; set; }

    public decimal TotalAmount { get; set; }

    public List<PaymentReportItem> Payments { get; set; }
        = new List<PaymentReportItem>();
}
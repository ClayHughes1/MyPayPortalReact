namespace AppPortal.Api.DTOs.Reports;

public class PaymentReportItem
{
    public int PaymentId { get; set; }

    public int LoanAccountId { get; set; }

    public string? LoanType { get; set; }

    public string? LoanName { get; set; }

    public string? LenderName { get; set; }

    public decimal PaymentAmount { get; set; }

    public DateTime PaymentDate { get; set; }

    public string? Status { get; set; }

    public string? ConfirmationNumber { get; set; }
}
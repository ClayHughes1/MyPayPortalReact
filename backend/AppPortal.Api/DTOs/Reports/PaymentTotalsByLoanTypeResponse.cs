namespace AppPortal.Api.DTOs.Reports;

public class PaymentTotalsByLoanTypeResponse
{
    public string? LoanType { get; set; }

    public int PaymentCount { get; set; }

    public decimal TotalPaid { get; set; }
}
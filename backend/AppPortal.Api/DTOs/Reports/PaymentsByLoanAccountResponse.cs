namespace AppPortal.Api.DTOs.Reports;

public class PaymentsByLoanAccountResponse
{
    public int LoanAccountId { get; set; }

    public string? LoanType { get; set; }

    public string? LoanName { get; set; }

    public int PaymentCount { get; set; }

    public decimal TotalPaid { get; set; }
}
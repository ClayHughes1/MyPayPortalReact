namespace AppPortal.Api.Models;

public class LoanAccount
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public string? LoanType { get; set; }

    public string? LoanName { get; set; }

    public string? LenderName { get; set; }

    public string? AccountNumberEncrypted { get; set; }

    public decimal CurrentBalance { get; set; }

    public decimal OriginalLoanAmount { get; set; }

    public decimal InterestRate { get; set; }

    public decimal MinimumPayment { get; set; }

    public decimal PaymentAmount { get; set; }

    public string? PaymentFrequency { get; set; }

    public DateTime? PaymentDate { get; set; }

    public DateTime? CreatedDate { get; set; }

    public string? PaymentMethod { get; set; }

    public string? Status { get; set; }

    public bool IsActive { get; set; }


    public Customer? Customer { get; set; }

    public List<Payment>? Payments {get;set;}
}
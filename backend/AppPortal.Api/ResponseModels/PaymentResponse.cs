namespace AppPortal.Api.DTOs;

public class PaymentResponse
{
    public int Id { get; set; }

    public int? LoanAccountId { get; set; }

    public string? LoanAccountNumber {get;set;}

    public string? PaymentDescription { get; set; }

    public decimal? PaymentAmount { get; set; }

    public DateTime? PaymentDate { get; set; }

    public string? Status { get; set; }

    public string? ConfirmationNumber { get; set; }

    public DateTime? CreatedDate { get; set; }

    public DateTime? CompletedDate { get; set; }


    // Loan Account Information

    public string? LoanType { get; set; }

    public string? LoanName { get; set; }

    public string? LenderName { get; set; }

    public string? MaskedAccountNumber { get; set; }

    public decimal? CurrentBalance { get; set; }

    public string? PaymentFrequency { get; set; }
}
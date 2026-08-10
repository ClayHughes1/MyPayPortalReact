namespace AppPortal.Api.Models;

public class Payment
{
    public int? Id { get; set; }

    public int? LoanAccountId { get; set; }

    public decimal? PaymentAmount { get; set; }

    public string? PaymentDescription {get;set;}

    public DateTime? PaymentDate { get; set; }

    public string? Status { get; set; } = string.Empty;

    public string? ConfirmationNumber { get; set; }

    public DateTime? CreatedDate { get; set; }

    public DateTime? CompletedDate { get; set; }


    // Navigation property
    public LoanAccount? LoanAccount { get; set; }
}
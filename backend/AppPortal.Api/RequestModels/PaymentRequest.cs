using AppPortal.Api.Models;

namespace AppPortal.Api.DTOs;

public class PaymentRequest
{
    public int? LoanAccountId { get; set; }

    public decimal? PaymentAmount { get; set; }

    // public string PaymentType { get; set; } = string.Empty;
    public String? PaymentDescription {get;set;}

    public DateTime? PaymentDate { get; set; }

    public String? ConfirmationNumber {get;set;}

    public string? Status { get; set; } = string.Empty;

    public LoanAccount? LoanAccount {get;set;}
}
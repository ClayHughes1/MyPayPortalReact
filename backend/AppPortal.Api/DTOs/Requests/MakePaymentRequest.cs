namespace AppPortal.Api.DTOs;

public class MakePaymentRequest
{
    public int CustomerId { get; set; }

    public int LoanAccountId { get; set; }

    public string? LoanName {get;set;}

    public decimal PaymentAmount { get; set; }

    public DateTime PaymentDate { get; set; }
}
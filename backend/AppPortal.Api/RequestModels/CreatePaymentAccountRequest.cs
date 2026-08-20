public class CreatePaymentAccountRequest
{
    // Loan Account

    public int CustomerId { get; set; }

    public string LoanType { get; set; } = string.Empty;

    public string LoanName { get; set; } = string.Empty;

    public string LenderName { get; set; } = string.Empty;

    public string LoanAccountNumber { get; set; } = string.Empty;

    public decimal CurrentBalance { get; set; }

    public decimal InterestRate { get; set; }

    public string PaymentFrequency { get; set; } = string.Empty;


    // Payment

    public decimal PaymentAmount { get; set; }

    public DateTime PaymentDate { get; set; }

    public string Status { get; set; } = "Pending";

    public string? ConfirmationNumber { get; set; }

    public string? PaymentDescription { get; set; }
}
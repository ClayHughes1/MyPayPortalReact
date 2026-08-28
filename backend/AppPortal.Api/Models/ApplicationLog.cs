namespace AppPortal.Api.Models
{
    public class ApplicationLog
    {
        public long Id { get; set; }

    public DateTime Timestamp { get; set; }

    public string? Level { get; set; }

    public string? Message { get; set; }

    public string? Exception { get; set; }

    public string? SourceContext { get; set; }

    public string? RequestPath { get; set; }

    public string? HttpMethod { get; set; }

    public int? StatusCode { get; set; }

    public int? CustomerId { get; set; }

    public int? LoanAccountId { get; set; }

    public int? PaymentId { get; set; }

    public int? TransactionId { get; set; }

    public string? CorrelationId { get; set; }
    }
}











// namespace AppPortal.Api.Models;

// public class ApplicationLog
// {
//     public long Id { get; set; }

//     public DateTime Timestamp { get; set; }

//     public string? Level { get; set; }

//     public string? Message { get; set; }

//     public string? Exception { get; set; }

//     public string? SourceContext { get; set; }

//     public string? RequestPath { get; set; }

//     public string? HttpMethod { get; set; }

//     public int? StatusCode { get; set; }

//     public int? CustomerId { get; set; }

//     public int? LoanAccountId { get; set; }

//     public int? PaymentId { get; set; }

//     public int? TransactionId { get; set; }

//     public string? CorrelationId { get; set; }
// }
namespace AppPortal.Api.DTOs;

public class PaymentSourceResponse
{
    public int Id { get; set; }

    public string PaymentType { get; set; } = string.Empty;

    public string? AccountType { get; set; }

    public string? LastFour { get; set; }

    public string? Provider { get; set; }

    public bool IsDefault { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedDate { get; set; }

    public DateTime? UpdatedDate { get; set; }
}

namespace AppPortal.Api.Models;

public class Address
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public string AddressType { get; set; } = "Primary";

    public string? Address1 { get; set; } = string.Empty;

    public string? Address2 { get; set; }

    public string? City { get; set; }

    public string? State { get; set; }

    public string? ZipCode { get; set; }

    public string Country { get; set; } = "United States";

    public bool IsActive { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? ModifiedDate { get; set; }


    public Customer? Customer { get; set; }
}
namespace AppPortal.Api.Models;

public class Customer
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string? FirstName { get; set; }

    public string? MiddleName { get; set; }

    public string? LastName { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public string? SSNLast4 { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? ModifiedDate { get; set; }


    public User? User { get; set; }

    public ICollection<Address> Addresses { get; set; }
        = new List<Address>();

    public ICollection<LoanAccount> LoanAccounts { get; set; }
        = new List<LoanAccount>();
}
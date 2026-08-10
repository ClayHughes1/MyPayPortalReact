namespace AppPortal.Api.Models;

public class User
{
    public int Id { get; set; }


    public string? FirstName { get; set; }


    public string? LastName { get; set; }


    public string? Email { get; set; }


    public string? Role { get; set; }


    public bool IsActive { get; set; }


    public DateTime CreatedDate { get; set; }


    public DateTime? ModifiedDate { get; set; }

    public Login Login { get; set; } = null!;
}
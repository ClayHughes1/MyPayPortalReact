namespace AppPortal.Api.Models;

public class Login
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string? Username { get; set; } 

    public string? Password { get; set; } 

    public DateTime? LastLoginDate { get; set; }

    public int FailedLoginAttempts { get; set; }

    public bool IsLocked { get; set; }

    public DateTime? LockedDate { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? ModifiedDate { get; set; }


    public User? User { get; set; }
}
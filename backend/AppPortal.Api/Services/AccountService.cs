using AppPortal.Api.Data;
using AppPortal.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace AppPortal.Api.Services;

public class AccountService
{
    private readonly ApplicationDbContext _context;

    public AccountService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User> CreateAccountAsync(CreateAccountRequest request)
    {
        // Check if email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (existingUser != null)
        {
            throw new InvalidOperationException(
                "An account with this email already exists.");
        }

        // Create the User record
        var user = new User
        {
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            UserName = request.UserName,
            Role = request.Role
        };

        _context.Users.Add(user);

        // Save User so the database generates user.Id
        await _context.SaveChangesAsync();

        // Create the Login record using the newly created User.Id
        var login = new Login
        {
            Username = request.UserName,
            UserId = user.Id,
            Password = request.Password
        };

        _context.Logins.Add(login);

        // Save Login
        await _context.SaveChangesAsync();

        return user;
    }

    // private static string HashPassword(string password)
    // {
    //     using var sha256 = SHA256.Create();

    //     var bytes = Encoding.UTF8.GetBytes(password);
    //     var hash = sha256.ComputeHash(bytes);

    //     return Convert.ToBase64String(hash);
    // }
}
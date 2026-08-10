using AppPortal.Api.Data;
using AppPortal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AppPortal.Api.Services;

public class AuthService
{
    private readonly ApplicationDbContext _context;


    public AuthService(ApplicationDbContext context)
    {
        _context = context;
    }


    public async Task<Login?> AuthenticateAsync(
        string username,
        string password)
    {
        var login = await _context.Logins
            .FirstOrDefaultAsync(x => x.Username == username);


        if (login == null)
            return null;


        bool valid =
            BCrypt.Net.BCrypt.Verify(
                password,
                login.Password);


        if (!valid)
            return null;


        return login;
    }
}
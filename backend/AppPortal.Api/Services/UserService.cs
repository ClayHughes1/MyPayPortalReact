using AppPortal.Api.Data;
using AppPortal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AppPortal.Api.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;


    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }


    public async Task<User?> GetUser(string username)
    {
        return await _context.Users
            .FirstOrDefaultAsync(x =>
                x.Email == username);
    }
}
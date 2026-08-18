
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppPortal.Api.Services;
using AppPortal.Api.Data;
namespace AppPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // private readonly AuthService _authService;
    // private readonly IJwtService _jwtService;
    // private readonly ApplicationDbContext _context;

    private readonly ApplicationDbContext _context;
    private readonly IJwtService _jwtService;

    public AuthController(
        ApplicationDbContext context,
        IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

[HttpPost("login")]
public async Task<IActionResult> Login(LoginRequest request)
{
    Console.Write("In Login method");

    if (string.IsNullOrWhiteSpace(request.Username) ||
        string.IsNullOrWhiteSpace(request.Password))
    {
        return BadRequest("Username and password are required.");
    }

    var login = await _context.Logins
        .Include(l => l.User)
        .FirstOrDefaultAsync(l => l.Username == request.Username);

    if (login == null || login.IsLocked)
    {
        return Unauthorized(
            "Invalid username or password."
        );
    }
    
    // Replace this with BCrypt or ASP.NET Identity hashing later
    if (login.Password != request.Password)
    {
        login.FailedLoginAttempts++;

        if (login.FailedLoginAttempts >= 5)
        {
            login.IsLocked = true;
            login.LockedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Unauthorized("Invalid username or password.");
    }

    // Successful login
    login.LastLoginDate = DateTime.UtcNow;
    login.FailedLoginAttempts = 0;

    await _context.SaveChangesAsync();

    var token = _jwtService.GenerateJwtToken(login);

    return Ok(new
    {
        token,
        user = new
        {
            login.User?.FirstName,
            login.User?.LastName,
            login.User?.Email,
            login.User?.Id
        }
    });
}}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppPortal.Api.Services;
using AppPortal.Api.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using System.Security.Claims;

namespace AppPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly GoogleLoginStateService _googleLoginStateService;
    public AuthController(
        ApplicationDbContext context,
        IJwtService jwtService,
        GoogleLoginStateService googleLoginStateService)
    {
        _context = context;
        _jwtService = jwtService;
        _googleLoginStateService = googleLoginStateService;
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
    }

    [HttpGet("google")]
    public IActionResult GoogleLogin()
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = "/api/auth/google-callback"
        };

        return Challenge(
            properties,
            GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("google-callback")]
    public async Task<IActionResult> GoogleCallback()
    {
        // var result = await HttpContext.AuthenticateAsync(
        //     GoogleDefaults.AuthenticationScheme);

        var result = await HttpContext.AuthenticateAsync(
            "GoogleCookie");

        if (!result.Succeeded)
        {
            return Unauthorized("Google authentication failed.");
        }

        var email = result.Principal?
            .FindFirst(ClaimTypes.Email)?
            .Value;

        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized(
                "Google did not provide an email address.");
        }

        var login = await _context.Logins
            .Include(l => l.User)
            .FirstOrDefaultAsync(
                l => l.User != null &&
                    l.User.Email == email);

        if (login == null)
        {
            return Unauthorized(
                "No MyPayPortal account exists for this Google account.");
        }

        if (login.IsLocked)
        {
            return Unauthorized(
                "This MyPayPortal account is locked.");
        }

        login.LastLoginDate = DateTime.UtcNow;
        login.FailedLoginAttempts = 0;

        await _context.SaveChangesAsync();

        var token = _jwtService.GenerateJwtToken(login);

        // return Ok(new
        // {
        //     token,
        //     user = new
        //     {
        //         login.User?.FirstName,
        //         login.User?.LastName,
        //         login.User?.Email,
        //         login.User?.Id
        //     }
        // });

        var code = _googleLoginStateService.Create(
            token,
            login.User!.Id);

        return Redirect(
            $"http://localhost:5173/google-callback?code={code}");
    }

    [HttpPost("google-token")]
    public IActionResult GoogleToken(
        [FromBody] GoogleTokenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest("Google login code is required.");
        }

        var state = _googleLoginStateService.Consume(request.Code);

        if (state == null)
        {
            return Unauthorized(
                "The Google login code is invalid or expired.");
        }

        var user = _context.Users
            .FirstOrDefault(u => u.Id == state.UserId);

        if (user == null)
        {
            return Unauthorized("User account not found.");
        }

        return Ok(new
        {
            token = state.Token,
            user = new
            {
                user.FirstName,
                user.LastName,
                user.Email,
                user.Id
            }
        });
    }

}
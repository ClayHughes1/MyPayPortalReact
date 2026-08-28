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
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        ApplicationDbContext context,
        IJwtService jwtService,
        GoogleLoginStateService googleLoginStateService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _jwtService = jwtService;
        _googleLoginStateService = googleLoginStateService;
        _logger = logger;
    }


    // =========================================================
    // LOGIN
    // =========================================================

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var correlationId = HttpContext.TraceIdentifier;

        _logger.LogInformation(
            "Login workflow started. CorrelationId: {CorrelationId}, Username: {Username}",
            correlationId,
            request.Username);

        try
        {
            // -------------------------------------------------
            // VALIDATE REQUEST
            // -------------------------------------------------

            if (string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                _logger.LogWarning(
                    "Login validation failed. Username and/or password was not provided. CorrelationId: {CorrelationId}",
                    correlationId);

                return BadRequest(
                    "Username and password are required.");
            }


            _logger.LogInformation(
                "Login request validated. Looking up account. CorrelationId: {CorrelationId}, Username: {Username}",
                correlationId,
                request.Username);


            // -------------------------------------------------
            // LOOK UP ACCOUNT
            // -------------------------------------------------

            var login = await _context.Logins
                .Include(l => l.User)
                .FirstOrDefaultAsync(
                    l => l.Username == request.Username);


            if (login == null)
            {
                _logger.LogWarning(
                    "Login failed. Account was not found. CorrelationId: {CorrelationId}, Username: {Username}",
                    correlationId,
                    request.Username);

                return Unauthorized(
                    "Invalid username or password.");
            }


            _logger.LogInformation(
                "Login account located. CorrelationId: {CorrelationId}, LoginId: {LoginId}, UserId: {UserId}",
                correlationId,
                login.Id,
                login.User?.Id);


            // -------------------------------------------------
            // CHECK LOCKED STATUS
            // -------------------------------------------------

            if (login.IsLocked)
            {
                _logger.LogWarning(
                    "Login rejected because account is locked. CorrelationId: {CorrelationId}, LoginId: {LoginId}, UserId: {UserId}",
                    correlationId,
                    login.Id,
                    login.User?.Id);

                return Unauthorized(
                    "Invalid username or password.");
            }


            _logger.LogInformation(
                "Account is not locked. Beginning password validation. CorrelationId: {CorrelationId}, LoginId: {LoginId}",
                correlationId,
                login.Id);


            // -------------------------------------------------
            // PASSWORD VALIDATION
            // -------------------------------------------------

            // TODO:
            // Replace plaintext password comparison with BCrypt
            // or ASP.NET Identity password hashing.

            if (login.Password != request.Password)
            {
                login.FailedLoginAttempts++;


                _logger.LogWarning(
                    "Invalid password supplied. CorrelationId: {CorrelationId}, LoginId: {LoginId}, FailedAttempts: {FailedAttempts}",
                    correlationId,
                    login.Id,
                    login.FailedLoginAttempts);


                // -------------------------------------------------
                // LOCK ACCOUNT
                // -------------------------------------------------

                if (login.FailedLoginAttempts >= 5)
                {
                    login.IsLocked = true;
                    login.LockedDate = DateTime.UtcNow;


                    _logger.LogWarning(
                        "Account locked after maximum failed login attempts. CorrelationId: {CorrelationId}, LoginId: {LoginId}",
                        correlationId,
                        login.Id);
                }


                await _context.SaveChangesAsync();


                _logger.LogInformation(
                    "Failed login attempt information saved. CorrelationId: {CorrelationId}, LoginId: {LoginId}",
                    correlationId,
                    login.Id);


                return Unauthorized(
                    "Invalid username or password.");
            }


            // -------------------------------------------------
            // SUCCESSFUL AUTHENTICATION
            // -------------------------------------------------

            _logger.LogInformation(
                "Password authentication successful. CorrelationId: {CorrelationId}, LoginId: {LoginId}, UserId: {UserId}",
                correlationId,
                login.Id,
                login.User?.Id);


            login.LastLoginDate = DateTime.UtcNow;
            login.FailedLoginAttempts = 0;


            await _context.SaveChangesAsync();


            _logger.LogInformation(
                "Successful login information saved. CorrelationId: {CorrelationId}, LoginId: {LoginId}",
                correlationId,
                login.Id);


            // -------------------------------------------------
            // GENERATE JWT
            // -------------------------------------------------

            _logger.LogInformation(
                "Generating JWT token. CorrelationId: {CorrelationId}, LoginId: {LoginId}",
                correlationId,
                login.Id);


            var token =
                _jwtService.GenerateJwtToken(login);


            _logger.LogInformation(
                "JWT token generated successfully. CorrelationId: {CorrelationId}, LoginId: {LoginId}",
                correlationId,
                login.Id);


            _logger.LogInformation(
                "Login workflow completed successfully. CorrelationId: {CorrelationId}, LoginId: {LoginId}, UserId: {UserId}",
                correlationId,
                login.Id,
                login.User?.Id);


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
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unhandled exception during login workflow. CorrelationId: {CorrelationId}, Username: {Username}",
                correlationId,
                request.Username);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                "An error occurred while processing the login request.");
        }
    }


    // =========================================================
    // GOOGLE LOGIN
    // =========================================================

    [HttpGet("google")]
    public IActionResult GoogleLogin()
    {
        var correlationId = HttpContext.TraceIdentifier;

        _logger.LogInformation(
            "Google login workflow started. CorrelationId: {CorrelationId}",
            correlationId);

        try
        {
            var properties =
                new AuthenticationProperties
                {
                    RedirectUri =
                        "/api/auth/google-callback"
                };


            _logger.LogInformation(
                "Redirecting user to Google authentication. CorrelationId: {CorrelationId}",
                correlationId);


            return Challenge(
                properties,
                GoogleDefaults.AuthenticationScheme);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unhandled exception while starting Google authentication. CorrelationId: {CorrelationId}",
                correlationId);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                "An error occurred while starting Google authentication.");
        }
    }


    // =========================================================
    // GOOGLE CALLBACK
    // =========================================================

    [HttpGet("google-callback")]
    public async Task<IActionResult> GoogleCallback()
    {
        var correlationId = HttpContext.TraceIdentifier;

        _logger.LogInformation(
            "Google authentication callback received. CorrelationId: {CorrelationId}",
            correlationId);

        try
        {
            // Authenticate using the temporary Google authentication cookie.
            var result =
                await HttpContext.AuthenticateAsync(
                    "GoogleCookie");


            if (!result.Succeeded)
            {
                _logger.LogWarning(
                    "Google authentication failed. CorrelationId: {CorrelationId}",
                    correlationId);

                return Unauthorized(
                    "Google authentication failed.");
            }


            _logger.LogInformation(
                "Google authentication succeeded. CorrelationId: {CorrelationId}",
                correlationId);


            // -------------------------------------------------
            // GET GOOGLE EMAIL
            // -------------------------------------------------

            var email =
                result.Principal?
                    .FindFirst(ClaimTypes.Email)?
                    .Value;


            if (string.IsNullOrWhiteSpace(email))
            {
                _logger.LogWarning(
                    "Google authentication succeeded but no email address was supplied. CorrelationId: {CorrelationId}",
                    correlationId);

                return Unauthorized(
                    "Google did not provide an email address.");
            }


            _logger.LogInformation(
                "Google email retrieved. Beginning local account lookup. CorrelationId: {CorrelationId}, Email: {Email}",
                correlationId,
                email);


            // -------------------------------------------------
            // LOOK UP LOCAL ACCOUNT
            // -------------------------------------------------

            var login =
                await _context.Logins
                    .Include(l => l.User)
                    .FirstOrDefaultAsync(
                        l =>
                            l.User != null &&
                            l.User.Email == email);


            if (login == null)
            {
                _logger.LogWarning(
                    "No local account was found for Google account. CorrelationId: {CorrelationId}, Email: {Email}",
                    correlationId,
                    email);

                return Unauthorized(
                    "No MyPayPortal account exists for this Google account.");
            }


            _logger.LogInformation(
                "Local account found for Google authentication. CorrelationId: {CorrelationId}, LoginId: {LoginId}, UserId: {UserId}",
                correlationId,
                login.Id,
                login.User?.Id);


            // -------------------------------------------------
            // CHECK LOCKED ACCOUNT
            // -------------------------------------------------

            if (login.IsLocked)
            {
                _logger.LogWarning(
                    "Google login rejected because local account is locked. CorrelationId: {CorrelationId}, LoginId: {LoginId}, UserId: {UserId}",
                    correlationId,
                    login.Id,
                    login.User?.Id);

                return Unauthorized(
                    "This MyPayPortal account is locked.");
            }


            // -------------------------------------------------
            // UPDATE LOGIN INFORMATION
            // -------------------------------------------------

            login.LastLoginDate = DateTime.UtcNow;
            login.FailedLoginAttempts = 0;


            await _context.SaveChangesAsync();


            _logger.LogInformation(
                "Google login information saved. CorrelationId: {CorrelationId}, LoginId: {LoginId}",
                correlationId,
                login.Id);


            // -------------------------------------------------
            // GENERATE JWT
            // -------------------------------------------------

            _logger.LogInformation(
                "Generating JWT for Google login. CorrelationId: {CorrelationId}, LoginId: {LoginId}",
                correlationId,
                login.Id);


            var token =
                _jwtService.GenerateJwtToken(login);


            _logger.LogInformation(
                "JWT generated successfully for Google login. CorrelationId: {CorrelationId}, LoginId: {LoginId}",
                correlationId,
                login.Id);


            // -------------------------------------------------
            // CREATE ONE-TIME LOGIN CODE
            // -------------------------------------------------

            _logger.LogInformation(
                "Creating Google login state. CorrelationId: {CorrelationId}, UserId: {UserId}",
                correlationId,
                login.User!.Id);


            var code =
                _googleLoginStateService.Create(
                    token,
                    login.User!.Id);


            // DO NOT LOG THE CODE.
            // DO NOT LOG THE JWT TOKEN.


            _logger.LogInformation(
                "Google login state created successfully. CorrelationId: {CorrelationId}, UserId: {UserId}",
                correlationId,
                login.User.Id);


            _logger.LogInformation(
                "Google authentication workflow completed. Redirecting to frontend. CorrelationId: {CorrelationId}, UserId: {UserId}",
                correlationId,
                login.User.Id);


            return Redirect(
                $"http://localhost:5173/google-callback?code={code}");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unhandled exception during Google callback workflow. CorrelationId: {CorrelationId}",
                correlationId);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                "An error occurred while processing Google authentication.");
        }
    }


    // =========================================================
    // GOOGLE TOKEN
    // =========================================================

    [HttpPost("google-token")]
    public IActionResult GoogleToken(
        [FromBody] GoogleTokenRequest request)
    {
        var correlationId = HttpContext.TraceIdentifier;

        _logger.LogInformation(
            "Google token exchange workflow started. CorrelationId: {CorrelationId}",
            correlationId);

        try
        {
            // -------------------------------------------------
            // VALIDATE REQUEST
            // -------------------------------------------------

            if (string.IsNullOrWhiteSpace(request.Code))
            {
                _logger.LogWarning(
                    "Google token exchange rejected because no code was provided. CorrelationId: {CorrelationId}",
                    correlationId);

                return BadRequest(
                    "Google login code is required.");
            }


            // IMPORTANT:
            //
            // Do NOT log request.Code.
            //
            // The Google login code is a credential.


            _logger.LogInformation(
                "Google login state consumption started. CorrelationId: {CorrelationId}",
                correlationId);


            var state =
                _googleLoginStateService.Consume(
                    request.Code);


            // -------------------------------------------------
            // INVALID / EXPIRED CODE
            // -------------------------------------------------

            if (state == null)
            {
                _logger.LogWarning(
                    "Google login code was invalid or expired. CorrelationId: {CorrelationId}",
                    correlationId);

                return Unauthorized(
                    "The Google login code is invalid or expired.");
            }


            _logger.LogInformation(
                "Google login state consumed successfully. CorrelationId: {CorrelationId}, UserId: {UserId}",
                correlationId,
                state.UserId);


            // -------------------------------------------------
            // FIND USER
            // -------------------------------------------------

            _logger.LogInformation(
                "Looking up user for Google token exchange. CorrelationId: {CorrelationId}, UserId: {UserId}",
                correlationId,
                state.UserId);


            var user =
                _context.Users
                    .FirstOrDefault(
                        u => u.Id == state.UserId);


            if (user == null)
            {
                _logger.LogWarning(
                    "Google token exchange failed because user was not found. CorrelationId: {CorrelationId}, UserId: {UserId}",
                    correlationId,
                    state.UserId);

                return Unauthorized(
                    "User account not found.");
            }


            _logger.LogInformation(
                "User located successfully for Google token exchange. CorrelationId: {CorrelationId}, UserId: {UserId}",
                correlationId,
                user.Id);


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            _logger.LogInformation(
                "Google token exchange completed successfully. CorrelationId: {CorrelationId}, UserId: {UserId}",
                correlationId,
                user.Id);


            // DO NOT LOG state.Token.


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
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unhandled exception during Google token exchange. CorrelationId: {CorrelationId}",
                correlationId);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                "An error occurred while processing the Google login.");
        }
    }
}



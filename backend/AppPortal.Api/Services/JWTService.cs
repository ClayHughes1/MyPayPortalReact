using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using Microsoft.IdentityModel.Tokens;

using AppPortal.Api.Models;

namespace AppPortal.Api.Services;

public class JWTService : IJwtService
{
    private readonly IConfiguration _configuration;


    public JWTService(IConfiguration configuration)
    {
        _configuration = configuration;
    }


    public string GenerateJwtToken(Login login)
    {
        if (string.IsNullOrWhiteSpace(login.Username))
        {
            throw new InvalidOperationException("User username is missing.");
        }

        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                login.User!.Id.ToString()
            ),

            new Claim(
                ClaimTypes.Name,
                login.Username
            ),
            
            new Claim(
                ClaimTypes.Email,
                login.User.Email ?? string.Empty
            )

        };


        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"]!
            )
        );


        var credentials =
            new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );


        var token = new JwtSecurityToken(
            issuer:
                _configuration["Jwt:Issuer"],

            audience:
                _configuration["Jwt:Audience"],

            claims: claims,

            expires:
                DateTime.UtcNow.AddMinutes(
                    Convert.ToDouble(
                        _configuration["Jwt:ExpirationMinutes"]
                    )
                ),

            signingCredentials:
                credentials
        );


        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}
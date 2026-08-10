using AppPortal.Api.Models;

namespace AppPortal.Api.Services;

public interface IJwtService
{
     string GenerateJwtToken(Login login);
}
using AppPortal.Api.Models;

namespace AppPortal.Api.Services;

public interface IUserService
{
    Task<User?> GetUser(string username);
}
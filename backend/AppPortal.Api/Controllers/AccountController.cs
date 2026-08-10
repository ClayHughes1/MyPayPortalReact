using Microsoft.AspNetCore.Mvc;
using AppPortal.Api.Services;

namespace AppPortal.Api.Controllers;

[ApiController]
[Route("api/account")]
public class AccountController : ControllerBase
{
    private readonly AccountService _accountService;

    public AccountController(AccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateAccount( [FromBody]CreateAccountRequest request)
    {
        var account = await _accountService.CreateAccountAsync(request);

        return Ok(new
        {
            account.Id,
            account.Email,
            account.FirstName,
            account.LastName
        });
    }
}
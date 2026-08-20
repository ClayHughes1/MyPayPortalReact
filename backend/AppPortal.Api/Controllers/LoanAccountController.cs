using Microsoft.AspNetCore.Mvc;
using AppPortal.Api.Models;
using AppPortal.Api.Services;

namespace AppPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoanAccountsController : ControllerBase
{
    private readonly ILoanAccountService _loanAccountService;
    private readonly ILogger<LoanAccountsController> _logger;

    public LoanAccountsController(
        ILoanAccountService loanAccountService,
        ILogger<LoanAccountsController> logger)
    {
        _loanAccountService = loanAccountService;
        _logger = logger;
    }

    // GET:
    // api/loanaccounts
    [HttpGet]
    public async Task<IActionResult> GetLoanAccounts()
    {
        _logger.LogInformation(
            "All loan accounts requested.");

        var loanAccounts =
            await _loanAccountService.GetAll();

        return Ok(loanAccounts);
    }

    // GET:
    // api/loanaccounts/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetLoanAccount(int id)
    {
        _logger.LogInformation(
            "Loan account requested. LoanAccountId: {LoanAccountId}",
            id);

        var loanAccount =
            await _loanAccountService.GetById(id);

        if (loanAccount == null)
        {
            return NotFound();
        }

        return Ok(loanAccount);
    }

    // GET:
    // api/loanaccounts/customer/1
    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetLoanAccountsByCustomer(
        int customerId)
    {
        _logger.LogInformation(
            "Loan accounts requested. CustomerId: {CustomerId}",
            customerId);

        var loanAccounts =
            await _loanAccountService.GetByCustomerId(customerId);

        return Ok(loanAccounts);
    }

    // POST:
    // api/loanaccounts
    [HttpPost]
    public async Task<IActionResult> CreateLoanAccount(
        LoanAccount loanAccount)
    {
        _logger.LogInformation(
            "Loan account creation requested. CustomerId: {CustomerId}",
            loanAccount.CustomerId);

        try
        {
            var createdLoanAccount =
                await _loanAccountService.Create(loanAccount);

            return CreatedAtAction(
                nameof(GetLoanAccount),
                new { id = createdLoanAccount.Id },
                createdLoanAccount);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(
                ex,
                "Unable to create loan account. CustomerId: {CustomerId}",
                loanAccount.CustomerId);

            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    // PUT:
    // api/loanaccounts/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLoanAccount(
        int id,
        LoanAccount loanAccount)
    {
        _logger.LogInformation(
            "Loan account update requested. LoanAccountId: {LoanAccountId}",
            id);

        var updated =
            await _loanAccountService.Update(
                id,
                loanAccount);

        if (!updated)
        {
            return NotFound();
        }

        var updatedLoanAccount =
            await _loanAccountService.GetById(id);

        return Ok(updatedLoanAccount);
    }

    // DELETE:
    // api/loanaccounts/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLoanAccount(int id)
    {
        _logger.LogInformation(
            "Loan account deletion requested. LoanAccountId: {LoanAccountId}",
            id);

        var deleted =
            await _loanAccountService.Delete(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
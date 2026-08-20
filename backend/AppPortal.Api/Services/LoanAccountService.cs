using AppPortal.Api.Data;
using AppPortal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AppPortal.Api.Services;

public class LoanAccountService : ILoanAccountService
{
    private readonly ApplicationDbContext _context;

    public LoanAccountService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<LoanAccount>> GetAll()
    {
        return await _context.LoanAccounts
            .Include(l => l.Customer)
            .ToListAsync();
    }

    public async Task<LoanAccount?> GetById(int id)
    {
        return await _context.LoanAccounts
            .Include(l => l.Customer)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<IEnumerable<LoanAccount>> GetByCustomerId(int customerId)
    {
        return await _context.LoanAccounts
            .Where(l => l.CustomerId == customerId)
            .ToListAsync();
    }

    public async Task<LoanAccount> Create(LoanAccount loanAccount)
    {
        var customerExists = await _context.Customers
            .AnyAsync(c => c.Id == loanAccount.CustomerId);

        if (!customerExists)
        {
            throw new ArgumentException(
                $"Customer with ID {loanAccount.CustomerId} does not exist.");
        }

        loanAccount.CreatedDate ??= DateTime.UtcNow;

        _context.LoanAccounts.Add(loanAccount);

        await _context.SaveChangesAsync();

        return loanAccount;
    }

    public async Task<bool> Update(int id, LoanAccount loanAccount)
    {
        var existingLoanAccount = await _context.LoanAccounts
            .FirstOrDefaultAsync(l => l.Id == id);

        if (existingLoanAccount == null)
        {
            return false;
        }

        existingLoanAccount.CustomerId = loanAccount.CustomerId;
        existingLoanAccount.LoanType = loanAccount.LoanType;
        existingLoanAccount.LoanName = loanAccount.LoanName;
        existingLoanAccount.LenderName = loanAccount.LenderName;
        existingLoanAccount.AccountNumberEncrypted =
            loanAccount.AccountNumberEncrypted;
        existingLoanAccount.CurrentBalance = loanAccount.CurrentBalance;
        existingLoanAccount.OriginalLoanAmount =
            loanAccount.OriginalLoanAmount;
        existingLoanAccount.InterestRate = loanAccount.InterestRate;
        existingLoanAccount.MinimumPayment = loanAccount.MinimumPayment;
        existingLoanAccount.PaymentAmount = loanAccount.PaymentAmount;
        existingLoanAccount.PaymentFrequency =
            loanAccount.PaymentFrequency;
        existingLoanAccount.PaymentDate = loanAccount.PaymentDate;
        existingLoanAccount.PaymentMethod = loanAccount.PaymentMethod;
        existingLoanAccount.Status = loanAccount.Status;
        existingLoanAccount.IsActive = loanAccount.IsActive;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> Delete(int id)
    {
        var loanAccount = await _context.LoanAccounts
            .FirstOrDefaultAsync(l => l.Id == id);

        if (loanAccount == null)
        {
            return false;
        }

        _context.LoanAccounts.Remove(loanAccount);

        await _context.SaveChangesAsync();

        return true;
    }
}
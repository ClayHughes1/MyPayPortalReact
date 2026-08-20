using AppPortal.Api.Data;
using AppPortal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AppPortal.Api.Services;

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;

    public PaymentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Payment>> GetAll()
    {
        return await _context.Payments
            .Include(p => p.LoanAccount)
            .ToListAsync();
    }

    public async Task<Payment?> GetById(int id)
    {
        return await _context.Payments
            .Include(p => p.LoanAccount)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Payment>> GetByLoanAccountId(
        int loanAccountId)
    {
        return await _context.Payments
            .Where(p => p.LoanAccountId == loanAccountId)
            .ToListAsync();
    }

    public async Task<Payment> Create(Payment payment)
    {
        if (payment.LoanAccountId.HasValue)
        {
            var loanAccountExists = await _context.LoanAccounts
                .AnyAsync(l => l.Id == payment.LoanAccountId.Value);

            if (!loanAccountExists)
            {
                throw new ArgumentException(
                    $"LoanAccount with ID {payment.LoanAccountId} does not exist.");
            }
        }

        payment.CreatedDate ??= DateTime.UtcNow;

        _context.Payments.Add(payment);

        await _context.SaveChangesAsync();

        return payment;
    }

    public async Task<bool> Update(int id, Payment payment)
    {
        var existingPayment = await _context.Payments
            .FirstOrDefaultAsync(p => p.Id == id);

        if (existingPayment == null)
        {
            return false;
        }

        existingPayment.LoanAccountId = payment.LoanAccountId;
        existingPayment.PaymentAmount = payment.PaymentAmount;
        existingPayment.PaymentDescription =
            payment.PaymentDescription;
        existingPayment.PaymentDate = payment.PaymentDate;
        existingPayment.Status = payment.Status;
        existingPayment.ConfirmationNumber =
            payment.ConfirmationNumber;
        existingPayment.CompletedDate = payment.CompletedDate;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> Delete(int id)
    {
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment == null)
        {
            return false;
        }

        _context.Payments.Remove(payment);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<Payment>> GetByCustomerId(int customerId)
    {
        return await _context.Payments
            .Include(p => p.LoanAccount)
            .Where(p =>
                p.LoanAccount != null &&
                p.LoanAccount.CustomerId == customerId)
            .ToListAsync();
    }
}
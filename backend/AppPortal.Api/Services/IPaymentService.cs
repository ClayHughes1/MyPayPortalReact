using AppPortal.Api.Models;

namespace AppPortal.Api.Services;

public interface IPaymentService
{
    Task<IEnumerable<Payment>> GetAll();

    Task<Payment?> GetById(int id);

    Task<IEnumerable<Payment>> GetByLoanAccountId(int loanAccountId);

    Task<Payment> Create(Payment payment);

    Task<bool> Update(int id, Payment payment);

    Task<bool> Delete(int id);
}
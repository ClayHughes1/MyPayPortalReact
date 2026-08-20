using AppPortal.Api.Models;

namespace AppPortal.Api.Services;

public interface ILoanAccountService
{
    Task<IEnumerable<LoanAccount>> GetAll();

    Task<LoanAccount?> GetById(int id);

    Task<IEnumerable<LoanAccount>> GetByCustomerId(int customerId);

    Task<LoanAccount> Create(LoanAccount loanAccount);

    Task<bool> Update(int id, LoanAccount loanAccount);

    Task<bool> Delete(int id);
}
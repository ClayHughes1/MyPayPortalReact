using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using AppPortal.Api.Data;
using AppPortal.Api.DTOs;
using AppPortal.Api.Models;


namespace AppPortal.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;


    public PaymentsController(
        ApplicationDbContext context)
    {
        _context = context;
    }



    // GET:
    // api/payments/customer/1
    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetPayments(
        int customerId)
    {

        // var payments = await _context.Payments
        //     .Where(p =>
        //         p.LoanAccount!.CustomerId == customerId)
        //     .ToListAsync();

    var payments = await _context.Payments
        .Include(p => p.LoanAccount)
        .Where(p =>
            p.LoanAccount != null &&
            p.LoanAccount.CustomerId == customerId)
        .Select(p => new PaymentResponse
        {
            Id = Convert.ToInt32(p.Id),

            LoanAccountId = p.LoanAccountId,

            PaymentDescription = p.PaymentDescription,

            PaymentAmount = p.PaymentAmount,

            PaymentDate = p.PaymentDate,

            Status = p.Status,

            ConfirmationNumber = p.ConfirmationNumber,

            CreatedDate = p.CreatedDate,

            CompletedDate = p.CompletedDate,


            LoanType = p.LoanAccount!.LoanType,

            LenderName = p.LoanAccount.LenderName,

            MaskedAccountNumber = p.LoanAccount.AccountNumberEncrypted,

            CurrentBalance = p.LoanAccount.CurrentBalance,

            PaymentFrequency = p.LoanAccount.PaymentFrequency

        })
        .ToListAsync();

        return Ok(payments);

    }



    // GET:
    // api/payments/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPayment(
        int id)
    {

        var payment =
            await _context.Payments
            .FirstOrDefaultAsync(
                p => p.Id == id);


        if(payment == null)
            return NotFound();


        return Ok(payment);

    }



    // POST:
    // api/payments
    [HttpPost]
    public async Task<IActionResult> CreatePayment(
        CreatePaymentAccountRequest request)
    {

        Console.WriteLine($"CustomerId received: {request.CustomerId}\n\n\n");
        var loan = new LoanAccount
        {
            CustomerId = request.CustomerId,
            LoanType = request.LoanType,
            LoanName = request.LoanName,
            LenderName = request.LenderName,
            AccountNumberEncrypted = request.AccountNumber,
            CurrentBalance = request.CurrentBalance,
            InterestRate = request.InterestRate,
            PaymentFrequency = request.PaymentFrequency,
            CreatedDate = DateTime.UtcNow
        };

        _context.LoanAccounts.Add(loan);

        await _context.SaveChangesAsync();

        var payment = new Payment
        {
            LoanAccountId = loan.Id,

            PaymentAmount =
                request.PaymentAmount,

            PaymentDate =
                request.PaymentDate,

            Status =
                request.Status,

            ConfirmationNumber =
                request.ConfirmationNumber,

            CreatedDate =
                DateTime.UtcNow
        };


        if(request.Status == "Completed")
        {
            payment.CompletedDate =
                DateTime.UtcNow;
        }


        _context.Payments.Add(payment);


        await _context.SaveChangesAsync();


        return Ok(payment);

    }




    // PUT:
    // api/payments/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePayment(
        int id,
        PaymentRequest request)
    {

        var payment =
            await _context.Payments
            .FirstOrDefaultAsync(
                p => p.Id == id);



        if(payment == null)
            return NotFound();



        payment.PaymentAmount =
            request.PaymentAmount;


        payment.PaymentDate =
            request.PaymentDate;


        payment.Status =
            request.Status;


        payment.ConfirmationNumber =
            request.ConfirmationNumber;



        if(request.Status == "Completed")
        {
            payment.CompletedDate =
                DateTime.UtcNow;
        }



        await _context.SaveChangesAsync();


        return Ok(payment);

    }





    // DELETE:
    // api/payments/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePayment(
        int id)
    {

        var payment =
            await _context.Payments
            .FirstOrDefaultAsync(
                p => p.Id == id);



        if(payment == null)
            return NotFound();



        _context.Payments.Remove(payment);


        await _context.SaveChangesAsync();


        return NoContent();

    }
}
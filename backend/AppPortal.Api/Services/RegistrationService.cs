using AppPortal.Api.Data;
using AppPortal.Api.Models;

namespace AppPortal.Api.Services;

public class RegistrationService
{

    private readonly ApplicationDbContext _context;


    public RegistrationService(
        ApplicationDbContext context)
    {
        _context=context;
    }



    public async Task<object> CreateAccount(
        CreateAccountRequest request)
    {


        using var transaction =
            await _context.Database.BeginTransactionAsync();


        try
        {


            // 1. CREATE USER

            // var passwordHash =
            //     BCrypt.Net.BCrypt.HashPassword(
            //         request.Password);



            var user = new User
            {

                FirstName= request?.FirstName,

                LastName=request?.LastName,

                Email=request?.Email,

                Role="Customer",

                IsActive=true,

                UserName = request?.UserName  

            };


            _context.Users.Add(user);


            await _context.SaveChangesAsync();



            // 2. CREATE LOGIN

            var login = new Login
            {

                UserId=user.Id,

                Username=request?.UserName,

                Password=request?.Password,

                FailedLoginAttempts=0,

                IsLocked=false

            };


            _context.Logins.Add(login);


            await _context.SaveChangesAsync();




            // 3. CREATE CUSTOMER


            var customer = new Customer
            {

                UserId=user.Id,

                FirstName=request?.FirstName,

                LastName=request?.LastName,

                Email=request?.Email,

                Phone=request?.Phone,

                DateOfBirth=request?.DateOfBirth,

                SSNLast4=request?.SSNLast4,

                IsActive=true

            };


            _context.Customers.Add(customer);


            await _context.SaveChangesAsync();




            // 4. CREATE ADDRESS


            var address = new Address
            {

                CustomerId=customer.Id,

                AddressType="Primary",

                Address1=request?.Address1,

                Address2=request?.Address2,

                City=request?.City,

                State=request?.State,

                ZipCode=request?.ZipCode,

                Country="United States"

            };


            _context.Addresses.Add(address);


            await _context.SaveChangesAsync();




            // COMMIT

            await transaction.CommitAsync();



            return new
            {
                UserId=user.Id,
                CustomerId=customer.Id,
               
            };


        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

}
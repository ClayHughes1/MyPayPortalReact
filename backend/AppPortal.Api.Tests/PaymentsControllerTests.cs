using AppPortal.Api.Controllers;
using AppPortal.Api.Data;
using AppPortal.Api.DTOs;
using AppPortal.Api.DTOs.Integrations;
using AppPortal.Api.Integrations.ExternalPayment;
using AppPortal.Api.Models;
using Microsoft.Data.Sqlite;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using Moq;
using Xunit;
using Xunit.Sdk;

namespace AppPortal.Api.Tests.Controllers
{
    public class PaymentsControllerTest : IDisposable
    {
   private readonly SqliteConnection _connection;
        private readonly ApplicationDbContext _context;
        private readonly Mock<IExternalPaymentService> _externalPaymentServiceMock;
        private readonly Mock<ILogger<PaymentsController>> _loggerMock;
        private readonly PaymentsController _controller;

        public PaymentsControllerTest()
        {
            _connection =
                new SqliteConnection("Data Source=:memory:");

            _connection.Open();

            var options =
                new DbContextOptionsBuilder<ApplicationDbContext>()
                    .UseSqlite(_connection)
                    .Options;

            _context =
                new ApplicationDbContext(options);

            _context.Database.EnsureCreated();

            // var customer = new Customer
            // {
            //     Id = 1000,
            //     UserId = 1,
            //     FirstName = "Test",
            //     LastName = "Customer",
            //     Email = "test@example.com",
            //     Phone = "555-555-5555",
            //     IsActive = true,
            //     CreatedDate = DateTime.UtcNow
            // };

            // _context.Customers.Add(customer);
            // _context.SaveChanges();

            _externalPaymentServiceMock =
                new Mock<IExternalPaymentService>();

            _loggerMock =
                new Mock<ILogger<PaymentsController>>();

            _controller =
                new PaymentsController(
                    _context,
                    _externalPaymentServiceMock.Object,
                    _loggerMock.Object);
        }

        // ---------------------------------------------------------
        // GET api/payments/{id}
        // ---------------------------------------------------------

        //Passed
        // [Fact]
        // public async Task GetPayment_ReturnsNotFound_WhenPaymentDoesNotExist()
        // {
        //     // Arrange
        //     var paymentId = 999;

        //     // Act
        //     var result = await _controller.GetPayment(paymentId);

        //     // Assert
        //     Assert.IsType<NotFoundResult>(result);
        // }

        [Fact]
        public async Task GetPayment_ReturnsOk_WhenPaymentExists()
        {
            // Arrange
            var loanAccount = new LoanAccount
            {
                CustomerId = 1,
                LoanType = "Auto",
                LoanName = "Test Auto Loan",
                LenderName = "Test Bank",
                AccountNumberEncrypted = "****1234",
                CurrentBalance = 5000m,
                InterestRate = 5.5m,
                PaymentFrequency = "Monthly",
                CreatedDate = DateTime.UtcNow
            };

            _context.LoanAccounts.Add(loanAccount);
            await _context.SaveChangesAsync();


            var payment = new Payment
            {
                LoanAccountId = 1,
                PaymentAmount = 425m,
                PaymentDate = DateTime.UtcNow,
                Status = "Completed",
                ConfirmationNumber = "CONF123",
                CreatedDate = DateTime.UtcNow
            };

            // _context.Payments.Add(payment);
            // await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetPayment(
                Convert.ToInt32(payment.Id));

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            var returnedPayment =
                Assert.IsType<Payment>(okResult.Value);

            Assert.Equal(payment.Id, returnedPayment.Id);
            Assert.Equal(250m, returnedPayment.PaymentAmount);
            Assert.Equal("Completed", returnedPayment.Status);
            Assert.Equal(
                "CONF123",
                returnedPayment.ConfirmationNumber);



        }

    //     // ---------------------------------------------------------
    //     // GET api/payments/customer/{customerId}
    //     // ---------------------------------------------------------

    //     [Fact]
    //     public async Task GetPayments_ReturnsPaymentsForCustomer()
    //     {
    //         // Arrange
    //         var loanAccount = new LoanAccount
    //         {
    //             CustomerId = 1,
    //             LoanType = "Auto",
    //             LoanName = "Auto Loan",
    //             LenderName = "Test Bank",
    //             AccountNumberEncrypted = "****1234",
    //             CurrentBalance = 5000m,
    //             InterestRate = 5.5m,
    //             PaymentFrequency = "Monthly",
    //             CreatedDate = DateTime.UtcNow
    //         };

    //         _context.LoanAccounts.Add(loanAccount);
    //         await _context.SaveChangesAsync();

    //         var payment = new Payment
    //         {
    //             LoanAccountId = loanAccount.Id,
    //             PaymentDescription = "Monthly Payment",
    //             PaymentAmount = 500m,
    //             PaymentDate = DateTime.UtcNow,
    //             Status = "Completed",
    //             ConfirmationNumber = "CONF001",
    //             CreatedDate = DateTime.UtcNow
    //         };

    //         _context.Payments.Add(payment);
    //         await _context.SaveChangesAsync();

    //         // Act
    //         var result =
    //             await _controller.GetPayments(1);

    //         // Assert
    //         var okResult =
    //             Assert.IsType<OkObjectResult>(result);

    //         var payments =
    //             Assert.IsAssignableFrom<IEnumerable<PaymentResponse>>(
    //                 okResult.Value);

    //         var paymentList = payments.ToList();

    //         Assert.Single(paymentList);

    //         Assert.Equal(
    //             payment.Id,
    //             paymentList[0].Id);

    //         Assert.Equal(
    //             loanAccount.Id,
    //             paymentList[0].LoanAccountId);

    //         Assert.Equal(
    //             500m,
    //             paymentList[0].PaymentAmount);

    //         Assert.Equal(
    //             "Completed",
    //             paymentList[0].Status);

    //         Assert.Equal(
    //             "Auto",
    //             paymentList[0].LoanType);

    //         Assert.Equal(
    //             "Test Bank",
    //             paymentList[0].LenderName);
    //     }

    //     [Fact]
    //     public async Task GetPayments_ReturnsEmptyList_WhenCustomerHasNoPayments()
    //     {
    //         // Arrange
    //         var customerId = 1;

    //         // Act
    //         var result =
    //             await _controller.GetPayments(customerId);

    //         // Assert
    //         var okResult =
    //             Assert.IsType<OkObjectResult>(result);

    //         var payments =
    //             Assert.IsAssignableFrom<IEnumerable<PaymentResponse>>(
    //                 okResult.Value);

    //         Assert.Empty(payments);
    //     }

    //     // ---------------------------------------------------------
    //     // PUT api/payments/{id}
    //     // ---------------------------------------------------------

    //     [Fact]
    //     public async Task UpdatePayment_ReturnsNotFound_WhenPaymentDoesNotExist()
    //     {
    //         // Arrange
    //         var request = new PaymentRequest
    //         {
    //             PaymentAmount = 100m,
    //             PaymentDate = DateTime.UtcNow,
    //             Status = "Completed",
    //             ConfirmationNumber = "CONF999"
    //         };

    //         // Act
    //         var result =
    //             await _controller.UpdatePayment(999, request);

    //         // Assert
    //         Assert.IsType<NotFoundResult>(result);
    //     }

    //     [Fact]
    //     public async Task UpdatePayment_UpdatesPaymentSuccessfully()
    //     {
    //         // Arrange
    //         var loanAccount = new LoanAccount
    //         {
    //             CustomerId = 1,
    //             LoanType = "Auto",
    //             LoanName = "Test Auto Loan",
    //             LenderName = "Test Bank",
    //             AccountNumberEncrypted = "****1005",
    //             CurrentBalance = 5000m,
    //             InterestRate = 5.5m,
    //             PaymentFrequency = "Monthly",
    //             CreatedDate = DateTime.UtcNow
    //         };

    //         _context.LoanAccounts.Add(loanAccount);
    //         await _context.SaveChangesAsync();

    //         var payment = new Payment
    //         {
    //             LoanAccountId = 1,
    //             PaymentAmount = 100m,
    //             PaymentDate = DateTime.UtcNow.AddDays(-1),
    //             Status = "Pending",
    //             ConfirmationNumber = "OLD123",
    //             CreatedDate = DateTime.UtcNow.AddDays(-2)
    //         };

    //         _context.Payments.Add(payment);
    //         await _context.SaveChangesAsync();

    //         var request = new PaymentRequest
    //         {
    //             PaymentAmount = 250m,
    //             PaymentDate = DateTime.UtcNow,
    //             Status = "Completed",
    //             ConfirmationNumber = "NEW123"
    //         };

    //         // Act
    //         var result =
    //             await _controller.UpdatePayment(
    //                 Convert.ToInt32(payment.Id),
    //                 request);

    //         // Assert
    //         var okResult =
    //             Assert.IsType<OkObjectResult>(result);

    //         var updatedPayment =
    //             Assert.IsType<Payment>(okResult.Value);

    //         Assert.Equal(
    //             250m,
    //             updatedPayment.PaymentAmount);

    //         Assert.Equal(
    //             "Completed",
    //             updatedPayment.Status);

    //         Assert.Equal(
    //             "NEW123",
    //             updatedPayment.ConfirmationNumber);

    //         Assert.NotNull(updatedPayment.CompletedDate);
    //     }

    //     // ---------------------------------------------------------
    //     // DELETE api/payments/{id}
    //     // ---------------------------------------------------------

    //     [Fact]
    //     public async Task DeletePayment_ReturnsNotFound_WhenPaymentDoesNotExist()
    //     {
    //         // Arrange
    //         var paymentId = 999;

    //         // Act
    //         var result =
    //             await _controller.DeletePayment(paymentId);

    //         // Assert
    //         Assert.IsType<NotFoundResult>(result);
    //     }

    //     [Fact]
    //     public async Task DeletePayment_ReturnsNoContent_WhenPaymentExists()
    //     {
    //         // Arrange
    //         var loanAccount = new LoanAccount
    //         {
    //             CustomerId = 1,
    //             LoanType = "Auto",
    //             LoanName = "Test Auto Loan",
    //             LenderName = "Test Bank",
    //             AccountNumberEncrypted = "****5678",
    //             CurrentBalance = 6000m,
    //             InterestRate = 5.25m,
    //             PaymentFrequency = "Monthly",
    //             CreatedDate = DateTime.UtcNow
    //         };

    //         _context.LoanAccounts.Add(loanAccount);
    //         await _context.SaveChangesAsync();

    //         var payment = new Payment
    //         {
    //             LoanAccountId = loanAccount.Id,
    //             PaymentAmount = 300m,
    //             PaymentDate = DateTime.UtcNow,
    //             Status = "Completed",
    //             ConfirmationNumber = "DELETE123",
    //             CreatedDate = DateTime.UtcNow
    //         };

    //         _context.Payments.Add(payment);
    //         await _context.SaveChangesAsync();

    //         var paymentId = Convert.ToInt32(payment.Id);

    //         // Act
    //         var result =
    //             await _controller.DeletePayment(paymentId);

    //         // Assert
    //         Assert.IsType<NoContentResult>(result);

    //         var deletedPayment =
    //             await _context.Payments
    //                 .FirstOrDefaultAsync(
    //                     p => p.Id == payment.Id);

    //         Assert.Null(deletedPayment);
    //     }

    //     // ---------------------------------------------------------
    //     // POST api/payments
    //     // ---------------------------------------------------------

    //     [Fact]
    //     public async Task CreatePayment_CreatesPayment_WhenExternalServiceSucceeds()
    //     {
    //         // Arrange
    //         var request = new CreatePaymentAccountRequest
    //         {
    //             CustomerId = 1,
    //             LoanType = "Auto",
    //             LoanName = "Auto Loan",
    //             LenderName = "Test Bank",
    //             AccountNumber = "123456789",
    //             CurrentBalance = 5000m,
    //             InterestRate = 5.5m,
    //             PaymentFrequency = "Monthly",
    //             PaymentAmount = 500m,
    //             PaymentDate = DateTime.UtcNow,
    //             Status = "Pending",
    //             ConfirmationNumber = "REQUEST123"
    //         };

    //         var externalResponse =
    //             new ExternalPaymentResponse
    //             {
    //                 Status = "Completed",
    //                 ConfirmationNumber = "EXTERNAL123"
    //             };

    //         _externalPaymentServiceMock
    //             .Setup(x =>
    //                 x.ProcessPaymentAsync(
    //                     It.IsAny<ExternalPaymentRequest>()))
    //             .ReturnsAsync(externalResponse);

    //         // Act
    //         var result =
    //             await _controller.CreatePayment(request);

    //         // Assert
    //         var okResult =
    //             Assert.IsType<OkObjectResult>(result);

    //         var payment =
    //             Assert.IsType<Payment>(okResult.Value);

    //         Assert.Equal(
    //             500m,
    //             payment.PaymentAmount);

    //         Assert.Equal(
    //             "Completed",
    //             payment.Status);

    //         Assert.Equal(
    //             "EXTERNAL123",
    //             payment.ConfirmationNumber);

    //         Assert.NotNull(payment.CompletedDate);

    //         // Verify external service was called.
    //         _externalPaymentServiceMock.Verify(
    //             x => x.ProcessPaymentAsync(
    //                 It.Is<ExternalPaymentRequest>(
    //                     r =>
    //                         r.CustomerId == 1 &&
    //                         r.PaymentAmount == 500m &&
    //                         r.PaymentType == "ACH")),
    //             Times.Once);

    //         // Verify loan was created.
    //         var loan =
    //             await _context.LoanAccounts
    //                 .FirstOrDefaultAsync(
    //                     x => x.CustomerId == 1);

    //         Assert.NotNull(loan);

    //         // Verify payment was saved.
    //         var savedPayment =
    //             await _context.Payments
    //                 .FirstOrDefaultAsync(
    //                     x => x.Id == payment.Id);

    //         Assert.NotNull(savedPayment);
    //     }

    //     [Fact]
    //     public async Task CreatePayment_Returns503_WhenExternalServiceFails()
    //     {
    //         // Arrange
    //         var request = new CreatePaymentAccountRequest
    //         {
    //             CustomerId = 1,
    //             LoanType = "Mortgage",
    //             LoanName = "Home Loan",
    //             LenderName = "Test Bank",
    //             AccountNumber = "987654321",
    //             CurrentBalance = 100000m,
    //             InterestRate = 4.5m,
    //             PaymentFrequency = "Monthly",
    //             PaymentAmount = 1500m,
    //             PaymentDate = DateTime.UtcNow,
    //             Status = "Pending",
    //             ConfirmationNumber = "REQUEST456"
    //         };

    //         _externalPaymentServiceMock
    //             .Setup(x =>
    //                 x.ProcessPaymentAsync(
    //                     It.IsAny<ExternalPaymentRequest>()))
    //             .ThrowsAsync(
    //                 new ExternalPaymentException(
    //                     "External payment service unavailable"));

    //         // Act
    //         var result =
    //             await _controller.CreatePayment(request);

    //         // Assert
    //         var objectResult =
    //             Assert.IsType<ObjectResult>(result);

    //         Assert.Equal(
    //             StatusCodes.Status503ServiceUnavailable,
    //             objectResult.StatusCode);

    //         // The payment should not have been created.
    //         Assert.Empty(
    //             await _context.Payments.ToListAsync());
    //     }

    //     // ---------------------------------------------------------
    //     // Cleanup
    //     // ---------------------------------------------------------

        public void Dispose()
        {
            _context.Dispose();
            _connection.Dispose();
        }
    }
}
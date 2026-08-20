using AppPortal.Api.Controllers;
using AppPortal.Api.Data;
using AppPortal.Api.RequestModels;
using AppPortal.Api.Integrations.ExternalPayment;
using AppPortal.Api.Models;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using Moq;
using Xunit;

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
            // ---------------------------------------------------------
            // SQLite in-memory database
            // ---------------------------------------------------------

            _connection = new SqliteConnection("Data Source=:memory:");
            _connection.Open();

            var options =
                new DbContextOptionsBuilder<ApplicationDbContext>()
                    .UseSqlite(_connection)
                    .Options;

            _context = new ApplicationDbContext(options);

            // Create the database schema.
            _context.Database.EnsureCreated();

            // ---------------------------------------------------------
            // Mocks
            // ---------------------------------------------------------

            _externalPaymentServiceMock =
                new Mock<IExternalPaymentService>();

            _loggerMock =
                new Mock<ILogger<PaymentsController>>();

            // ---------------------------------------------------------
            // Controller
            // ---------------------------------------------------------

            _controller =
                new PaymentsController(
                    _context,
                    _externalPaymentServiceMock.Object,
                    _loggerMock.Object);
        }

        // =========================================================
        // GET api/payments/{id}
        // =========================================================

        [Fact]
        public async Task GetPayment_ReturnsNotFound_WhenPaymentDoesNotExist()
        {
            // Arrange
            var paymentId = 999;

            // Act
            var result =
                await _controller.GetPayment(paymentId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetPayment_ReturnsOk_WhenPaymentExists()
        {
            // ---------------------------------------------------------
            // Arrange
            // ---------------------------------------------------------

            // Create the User required by Customer.UserId.
            var user = new User
            {
                FirstName = "Test",
                LastName = "User",
                Email = "test@example.com",
                UserName = "testuser",
                Role = "Customer",
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create the Customer using the generated User ID.
            var customer = new Customer
            {
                UserId = user.Id,
                FirstName = "Test",
                LastName = "Customer",
                Email = "test@example.com",
                Phone = "555-555-5555",
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            // Create the LoanAccount using the generated Customer ID.
            var loanAccount = new LoanAccount
            {
                CustomerId = customer.Id,
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

            // Create the Payment using the generated LoanAccount ID.
            var payment = new Payment
            {
                LoanAccountId = loanAccount.Id,
                PaymentAmount = 425m,
                PaymentDate = DateTime.UtcNow,
                Status = "Completed",
                ConfirmationNumber = "CONF123",
                CreatedDate = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Verify the database generated the Payment ID.
            Assert.True(payment.Id.HasValue);

            var paymentId = payment.Id.Value;

            // ---------------------------------------------------------
            // Act
            // ---------------------------------------------------------

            var result =
                await _controller.GetPayment(paymentId);

            // ---------------------------------------------------------
            // Assert
            // ---------------------------------------------------------

            var okResult =
                Assert.IsType<OkObjectResult>(result);

            var returnedPayment =
                Assert.IsType<Payment>(okResult.Value);

            Assert.Equal(
                payment.Id,
                returnedPayment.Id);

            Assert.Equal(
                loanAccount.Id,
                returnedPayment.LoanAccountId);

            Assert.Equal(
                425m,
                returnedPayment.PaymentAmount);

            Assert.Equal(
                "Completed",
                returnedPayment.Status);

            Assert.Equal(
                "CONF123",
                returnedPayment.ConfirmationNumber);
        }

        // =========================================================
        // PUT api/payments/{id}
        // =========================================================

        [Fact]
        public async Task UpdatePayment_UpdatesPaymentSuccessfully()
        {
            // ---------------------------------------------------------
            // Arrange
            // ---------------------------------------------------------

            var user = new User
            {
                FirstName = "Update",
                LastName = "User",
                Email = "update@example.com",
                UserName = "updateuser",
                Role = "Customer",
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var customer = new Customer
            {
                UserId = user.Id,
                FirstName = "Update",
                LastName = "Customer",
                Email = "update@example.com",
                Phone = "555-555-5555",
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            var loanAccount = new LoanAccount
            {
                CustomerId = customer.Id,
                LoanType = "Auto",
                LoanName = "Test Auto Loan",
                LenderName = "Test Bank",
                AccountNumberEncrypted = "****1005",
                CurrentBalance = 5000m,
                InterestRate = 5.5m,
                PaymentFrequency = "Monthly",
                CreatedDate = DateTime.UtcNow
            };

            _context.LoanAccounts.Add(loanAccount);
            await _context.SaveChangesAsync();

            var originalCreatedDate = DateTime.UtcNow.AddDays(-2);

            var payment = new Payment
            {
                LoanAccountId = loanAccount.Id,
                PaymentAmount = 100m,
                PaymentDate = DateTime.UtcNow.AddDays(-1),
                Status = "Pending",
                ConfirmationNumber = "OLD123",
                CreatedDate = originalCreatedDate
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            Assert.True(payment.Id.HasValue);

            var paymentId = payment.Id.Value;

            var originalPaymentDate = payment.PaymentDate;

            var request = new PaymentRequest
            {
                PaymentAmount = 250m,
                PaymentDate = DateTime.UtcNow,
                Status = "Completed",
                ConfirmationNumber = "NEW123"
            };

            // ---------------------------------------------------------
            // Act
            // ---------------------------------------------------------

            var result =
                await _controller.UpdatePayment(
                    paymentId,
                    request);

            // ---------------------------------------------------------
            // Assert - HTTP response
            // ---------------------------------------------------------

            var okResult =
                Assert.IsType<OkObjectResult>(result);

            var updatedPayment =
                Assert.IsType<Payment>(okResult.Value);

            // ---------------------------------------------------------
            // Assert - updated values
            // ---------------------------------------------------------

            Assert.Equal(
                paymentId,
                updatedPayment.Id);

            Assert.Equal(
                250m,
                updatedPayment.PaymentAmount);

            Assert.NotEqual(
                originalPaymentDate,
                updatedPayment.PaymentDate);

            Assert.Equal(
                request.PaymentDate,
                updatedPayment.PaymentDate);

            Assert.Equal(
                "Completed",
                updatedPayment.Status);

            Assert.Equal(
                "NEW123",
                updatedPayment.ConfirmationNumber);

            // Controller should set CompletedDate
            // when Status becomes Completed.
            Assert.NotNull(
                updatedPayment.CompletedDate);

            // These values should not be changed by UpdatePayment.
            Assert.Equal(
                loanAccount.Id,
                updatedPayment.LoanAccountId);

            Assert.Equal(
                originalCreatedDate,
                updatedPayment.CreatedDate);

            // ---------------------------------------------------------
            // Assert - database persistence
            // ---------------------------------------------------------

            var savedPayment =
                await _context.Payments
                    .AsNoTracking()
                    .FirstAsync(
                        p => p.Id == paymentId);

            Assert.Equal(
                250m,
                savedPayment.PaymentAmount);

            Assert.Equal(
                request.PaymentDate,
                savedPayment.PaymentDate);

            Assert.Equal(
                "Completed",
                savedPayment.Status);

            Assert.Equal(
                "NEW123",
                savedPayment.ConfirmationNumber);

            Assert.NotNull(
                savedPayment.CompletedDate);

            Assert.Equal(
                originalCreatedDate,
                savedPayment.CreatedDate);
        }


        [Fact]
        public async Task UpdatePayment_ReturnsNotFound_WhenPaymentDoesNotExist()
        {
            // ---------------------------------------------------------
            // Arrange
            // ---------------------------------------------------------

            var request = new PaymentRequest
            {
                PaymentAmount = 250m,
                PaymentDate = DateTime.UtcNow,
                Status = "Completed",
                ConfirmationNumber = "NOTFOUND123"
            };

            var nonexistentPaymentId = 999999;

            // ---------------------------------------------------------
            // Act
            // ---------------------------------------------------------

            var result =
                await _controller.UpdatePayment(
                    nonexistentPaymentId,
                    request);

            // ---------------------------------------------------------
            // Assert
            // ---------------------------------------------------------

            Assert.IsType<NotFoundResult>(result);
        }


        // =========================================================
        // DELETE api/payments/{id}
        // =========================================================

        [Fact]
        public async Task DeletePayment_DeletesPaymentSuccessfully()
        {
            // ---------------------------------------------------------
            // Arrange
            // ---------------------------------------------------------

            var user = new User
            {
                FirstName = "Delete",
                LastName = "User",
                Email = "delete@example.com",
                UserName = "deleteuser",
                Role = "Customer",
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var customer = new Customer
            {
                UserId = user.Id,
                FirstName = "Delete",
                LastName = "Customer",
                Email = "delete@example.com",
                Phone = "555-555-5555",
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            var loanAccount = new LoanAccount
            {
                CustomerId = customer.Id,
                LoanType = "Auto",
                LoanName = "Delete Test Loan",
                LenderName = "Test Bank",
                AccountNumberEncrypted = "****5678",
                CurrentBalance = 6000m,
                InterestRate = 5.25m,
                PaymentFrequency = "Monthly",
                CreatedDate = DateTime.UtcNow
            };

            _context.LoanAccounts.Add(loanAccount);
            await _context.SaveChangesAsync();

            var payment = new Payment
            {
                LoanAccountId = loanAccount.Id,
                PaymentAmount = 300m,
                PaymentDate = DateTime.UtcNow,
                Status = "Completed",
                ConfirmationNumber = "DELETE123",
                CreatedDate = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            Assert.True(payment.Id.HasValue);

            var paymentId = payment.Id.Value;

            // Verify payment exists before deletion.
            var existingPayment =
                await _context.Payments
                    .FirstOrDefaultAsync(
                        p => p.Id == paymentId);

            Assert.NotNull(existingPayment);

            // ---------------------------------------------------------
            // Act
            // ---------------------------------------------------------

            var result =
                await _controller.DeletePayment(paymentId);

            // ---------------------------------------------------------
            // Assert - HTTP response
            // ---------------------------------------------------------

            Assert.IsType<NoContentResult>(result);

            // ---------------------------------------------------------
            // Assert - database record was deleted
            // ---------------------------------------------------------

            var deletedPayment =
                await _context.Payments
                    .FirstOrDefaultAsync(
                        p => p.Id == paymentId);

            Assert.Null(deletedPayment);
        }


        [Fact]
        public async Task DeletePayment_ReturnsNotFound_WhenPaymentDoesNotExist()
        {
            // ---------------------------------------------------------
            // Arrange
            // ---------------------------------------------------------

            var nonexistentPaymentId = 999999;

            // ---------------------------------------------------------
            // Act
            // ---------------------------------------------------------

            var result =
                await _controller.DeletePayment(
                    nonexistentPaymentId);

            // ---------------------------------------------------------
            // Assert
            // ---------------------------------------------------------

            Assert.IsType<NotFoundResult>(result);
        }

        // =========================================================
        // Cleanup
        // =========================================================

        public void Dispose()
        {
            _context.Dispose();
            _connection.Dispose();
        }
    }
}
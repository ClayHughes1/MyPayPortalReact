using Microsoft.EntityFrameworkCore;
using AppPortal.Api.Models;
using AppPortal.Api.DTOs.Reports;

namespace AppPortal.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }


    public DbSet<User> Users { get; set; }

    public DbSet<Login> Logins { get; set; }

    public DbSet<Customer> Customers { get; set; }

    public DbSet<Address> Addresses { get; set; }

    public DbSet<Payment> Payments { get; set; }

    public DbSet<PaymentSource> PaymentSources { get; set; }

    public DbSet<LoanAccount> LoanAccounts { get; set; }

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>()
            .HasMany(c => c.LoanAccounts)
            .WithOne(l => l.Customer)
            .HasForeignKey(l => l.CustomerId);


        modelBuilder.Entity<LoanAccount>()
            .HasMany(l => l.Payments)
            .WithOne(p => p.LoanAccount)
            .HasForeignKey(p => p.LoanAccountId);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Login)
            .WithOne(l => l.User)
            .HasForeignKey<Login>(l => l.UserId);

        modelBuilder.Entity<PaymentSource>()
            .HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LoanAccount>()
            .Property(l => l.CurrentBalance)
            .HasPrecision(18, 2);

        modelBuilder.Entity<LoanAccount>()
            .Property(l => l.InterestRate)
            .HasPrecision(5, 2);

        modelBuilder.Entity<LoanAccount>()
            .Property(l => l.MinimumPayment)
            .HasPrecision(5, 2);

        modelBuilder.Entity<LoanAccount>()
            .Property(l => l.OriginalLoanAmount)
            .HasPrecision(5, 2);

        modelBuilder.Entity<LoanAccount>()
            .Property(l => l.PaymentAmount)
            .HasPrecision(5, 2);

        modelBuilder.Entity<Payment>()
            .Property(p => p.PaymentAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Payment>()
            .ToTable("PaymentTransactions");
            
        base.OnModelCreating(modelBuilder);
    }
}
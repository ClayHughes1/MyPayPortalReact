namespace AppPortal.Api.Models
{
    public class PaymentSource
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }

        public string? PaymentType { get; set; }

        public string? AccountType { get; set; }

        public string? LastFour { get; set; }

        public string? Provider { get; set; }

        public string? ProviderPaymentMethodId { get; set; }

        public bool IsDefault { get; set; }

        public string? Status { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }


        // Relationship to Users
        public User? User { get; set; }
    }
}

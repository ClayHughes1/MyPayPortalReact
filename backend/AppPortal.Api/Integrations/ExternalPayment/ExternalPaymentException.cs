namespace AppPortal.Api.Integrations.ExternalPayment;

public class ExternalPaymentException : Exception
{
    public ExternalPaymentException(string message)
        : base(message)
    {
    }

    public ExternalPaymentException(
        string message,
        Exception innerException)
        : base(message, innerException)
    {
    }
}
using APPPortal.ExternalApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace APPPortal.ExternalApi.Controllers;

[ApiController]
[Route("api/external/payments")]
public class ExternalPaymentsController : ControllerBase
{
    [HttpPost]
    public ActionResult<ExternalPaymentResponse> ProcessPayment(
        ExternalPaymentRequest request)
    {
        var transactionId = $"TXN-{Random.Shared.Next(100000, 999999)}";

        var confirmationNumber =
            $"ENT-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(10000, 99999)}";

        var response = new ExternalPaymentResponse
        {
            Success = true,
            ConfirmationNumber = confirmationNumber,
            TransactionId = transactionId,
            Status = "Approved",
            Message = "Payment processed successfully by external payment system."
        };

        return Ok(response);
    }
}
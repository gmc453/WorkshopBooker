using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Legal.Infrastructure.Services;

public class DummyPaymentGateway : IPaymentGateway
{
    public Task<string> CreatePaymentAsync(Guid referenceId, decimal amount, string currency)
        => Task.FromResult(Guid.NewGuid().ToString());

    public Task<bool> CapturePaymentAsync(string paymentId) => Task.FromResult(true);
}

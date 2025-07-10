using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Insurance.Infrastructure.Services;

public class DummyPaymentGateway : IPaymentGateway
{
    public Task<string> CreatePaymentAsync(Guid referenceId, decimal amount, string currency)
    {
        // Placeholder implementation
        return Task.FromResult(Guid.NewGuid().ToString());
    }

    public Task<bool> CapturePaymentAsync(string paymentId)
    {
        return Task.FromResult(true);
    }
}

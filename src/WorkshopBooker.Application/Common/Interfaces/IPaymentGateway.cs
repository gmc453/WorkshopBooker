namespace WorkshopBooker.Application.Common.Interfaces;

public interface IPaymentGateway
{
    Task<string> CreatePaymentAsync(Guid referenceId, decimal amount, string currency);
    Task<bool> CapturePaymentAsync(string paymentId);
}

using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Legal.Infrastructure.Services;

public class ConsultationPaymentService
{
    private readonly IPaymentGateway _payments;

    public ConsultationPaymentService(IPaymentGateway payments)
    {
        _payments = payments;
    }

    public Task<string> PayForConsultationAsync(Guid caseId, decimal amount)
    {
        return _payments.CreatePaymentAsync(caseId, amount, "PLN");
    }
}

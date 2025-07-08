using MediatR;
using WorkshopBooker.Application.Analytics.Dtos;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Analytics.Queries.GetPredictions;

public class GetPredictionsQuery : IRequest<Result<PredictiveAnalyticsDto>>
{
    public Guid WorkshopId { get; set; }
    public int PredictionDays { get; set; } = 30; // Domyślnie 30 dni
} 
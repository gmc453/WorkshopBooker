using MediatR;
using WorkshopBooker.Application.Analytics.Dtos;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Analytics.Queries.GetSeasonalAnalytics;

public class GetSeasonalAnalyticsQuery : IRequest<Result<SeasonalAnalyticsDto>>
{
    public Guid WorkshopId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
} 
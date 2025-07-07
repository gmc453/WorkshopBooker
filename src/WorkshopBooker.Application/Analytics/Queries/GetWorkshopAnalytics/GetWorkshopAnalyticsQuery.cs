using MediatR;
using WorkshopBooker.Application.Analytics.Dtos;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Analytics.Queries.GetWorkshopAnalytics;

public record GetWorkshopAnalyticsQuery : IRequest<Result<WorkshopAnalyticsDto>>
{
    public Guid WorkshopId { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public string GroupBy { get; init; } = "day";
} 
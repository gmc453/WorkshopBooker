using MediatR;
using WorkshopBooker.Application.Analytics.Dtos;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Analytics.Queries.GetGlobalAnalytics;

public record GetGlobalAnalyticsQuery(
    DateTime StartDate,
    DateTime EndDate
) : IRequest<Result<GlobalAnalyticsDto>>; 
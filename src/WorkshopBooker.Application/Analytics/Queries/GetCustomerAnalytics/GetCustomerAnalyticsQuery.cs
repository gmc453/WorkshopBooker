using MediatR;
using WorkshopBooker.Application.Analytics.Dtos;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Analytics.Queries.GetCustomerAnalytics;

public class GetCustomerAnalyticsQuery : IRequest<Result<CustomerAnalyticsDto>>
{
    public Guid WorkshopId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
} 
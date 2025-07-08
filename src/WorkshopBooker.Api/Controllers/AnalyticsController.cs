using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using WorkshopBooker.Application.Analytics.Queries.GetWorkshopAnalytics;
using WorkshopBooker.Application.Analytics.Dtos;
using WorkshopBooker.Application.Common.Constants;
using Microsoft.AspNetCore.RateLimiting;

namespace WorkshopBooker.Api.Controllers;

[ApiController]
[Route("api/workshops/{workshopId}/analytics")]
[Authorize]
[EnableRateLimiting("AnalyticsPolicy")]
public class AnalyticsController : ControllerBase
{
    private readonly ISender _sender;

    public AnalyticsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenue(Guid workshopId, [FromQuery] int months = 6)
    {
        var startDate = DateTime.UtcNow.AddMonths(-months);
        var endDate = DateTime.UtcNow;

        var query = new GetWorkshopAnalyticsQuery
        {
            WorkshopId = workshopId,
            StartDate = startDate,
            EndDate = endDate,
            GroupBy = "month"
        };

        var result = await _sender.Send(query);
        
        if (result.IsSuccess)
            return Ok(result.Value);
        
        return BadRequest(result.Error);
    }

    [HttpGet("popular-services")]
    public async Task<IActionResult> GetPopularServices(Guid workshopId, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-TimeConstants.DefaultAnalyticsPeriodDays);
        var end = endDate ?? DateTime.UtcNow;

        var query = new GetWorkshopAnalyticsQuery
        {
            WorkshopId = workshopId,
            StartDate = start,
            EndDate = end
        };

        var result = await _sender.Send(query);
        
        if (result.IsSuccess)
            return Ok(result.Value.ServiceDistribution);
        
        return BadRequest(result.Error);
    }

    [HttpGet("time-slots-popularity")]
    public async Task<IActionResult> GetTimeSlotsPopularity(Guid workshopId, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-TimeConstants.DefaultAnalyticsPeriodDays);
        var end = endDate ?? DateTime.UtcNow;

        var query = new GetWorkshopAnalyticsQuery
        {
            WorkshopId = workshopId,
            StartDate = start,
            EndDate = end
        };

        var result = await _sender.Send(query);
        
        if (result.IsSuccess)
            return Ok(result.Value.PopularTimeSlots);
        
        return BadRequest(result.Error);
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview(Guid workshopId, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-TimeConstants.DefaultAnalyticsPeriodDays);
        var end = endDate ?? DateTime.UtcNow;

        var query = new GetWorkshopAnalyticsQuery
        {
            WorkshopId = workshopId,
            StartDate = start,
            EndDate = end
        };

        var result = await _sender.Send(query);
        
        if (result.IsSuccess)
            return Ok(result.Value);
        
        return BadRequest(result.Error);
    }

    [HttpGet("revenue-trend")]
    public async Task<IActionResult> GetRevenueTrend(Guid workshopId, [FromQuery] int days = TimeConstants.DefaultAnalyticsPeriodDays)
    {
        var startDate = DateTime.UtcNow.AddDays(-days);
        var endDate = DateTime.UtcNow;

        var query = new GetWorkshopAnalyticsQuery
        {
            WorkshopId = workshopId,
            StartDate = startDate,
            EndDate = endDate,
            GroupBy = "day"
        };

        var result = await _sender.Send(query);
        
        if (result.IsSuccess)
            return Ok(result.Value.RevenueOverTime);
        
        return BadRequest(result.Error);
    }

    [HttpGet("conflicts")]
    public async Task<IActionResult> GetConflicts(Guid workshopId, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-TimeConstants.DefaultAnalyticsPeriodDays);
        var end = endDate ?? DateTime.UtcNow;

        // TODO: Implement conflict detection logic
        // This could include double bookings, overlapping slots, etc.
        
        return Ok(new { message = "Conflict detection endpoint - to be implemented" });
    }
} 
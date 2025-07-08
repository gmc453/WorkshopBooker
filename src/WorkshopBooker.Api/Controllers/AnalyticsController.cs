using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using WorkshopBooker.Application.Analytics.Queries.GetWorkshopAnalytics;
using WorkshopBooker.Application.Analytics.Queries.GetGlobalAnalytics;
using WorkshopBooker.Application.Analytics.Queries.GetCustomerAnalytics;
using WorkshopBooker.Application.Analytics.Queries.GetPredictions;
using WorkshopBooker.Application.Analytics.Queries.GetSeasonalAnalytics;
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
        
        if (result.IsSuccess && result.Value != null)
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
        
        if (result.IsSuccess && result.Value != null)
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
        
        if (result.IsSuccess && result.Value != null)
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
        
        if (result.IsSuccess && result.Value != null)
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
        
        if (result.IsSuccess && result.Value != null)
            return Ok(result.Value.RevenueOverTime);
        
        return BadRequest(result.Error);
    }

    [HttpGet("conflicts")]
    public Task<IActionResult> GetConflicts(Guid workshopId, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-TimeConstants.DefaultAnalyticsPeriodDays);
        var end = endDate ?? DateTime.UtcNow;

        // TODO: Implement conflict detection logic
        // This could include double bookings, overlapping slots, etc.
        
        return Task.FromResult<IActionResult>(Ok(new { message = "Conflict detection endpoint - to be implemented" }));
    }

    [HttpGet("quick-stats")]
    public async Task<IActionResult> GetQuickStats(Guid workshopId)
    {
        // Szybkie statystyki dla dashboard dropdown
        var query = new GetWorkshopAnalyticsQuery
        {
            WorkshopId = workshopId,
            StartDate = DateTime.UtcNow.AddDays(-30),
            EndDate = DateTime.UtcNow
        };

        var result = await _sender.Send(query);
        
        if (result.IsSuccess && result.Value != null)
        {
            var quickStats = new
            {
                monthlyRevenue = result.Value.MonthlyRevenue,
                monthlyBookings = result.Value.MonthlyBookings,
                averageRating = result.Value.AverageRating,
                revenueGrowth = result.Value.RevenueGrowth
            };
            return Ok(quickStats);
        }
        
        return BadRequest(result.Error);
    }

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomerAnalytics(Guid workshopId, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-TimeConstants.DefaultAnalyticsPeriodDays);
        var end = endDate ?? DateTime.UtcNow;

        var query = new GetCustomerAnalyticsQuery
        {
            WorkshopId = workshopId,
            StartDate = start,
            EndDate = end
        };

        var result = await _sender.Send(query);
        
        if (result.IsSuccess && result.Value != null)
            return Ok(result.Value);
        
        return BadRequest(result.Error);
    }

    [HttpGet("predictions")]
    public async Task<IActionResult> GetPredictions(Guid workshopId, [FromQuery] int predictionDays = 30)
    {
        var query = new GetPredictionsQuery
        {
            WorkshopId = workshopId,
            PredictionDays = predictionDays
        };

        var result = await _sender.Send(query);
        
        if (result.IsSuccess && result.Value != null)
            return Ok(result.Value);
        
        return BadRequest(result.Error);
    }

    [HttpGet("seasonal")]
    public async Task<IActionResult> GetSeasonalAnalytics(Guid workshopId, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-TimeConstants.DefaultAnalyticsPeriodDays);
        var end = endDate ?? DateTime.UtcNow;

        var query = new GetSeasonalAnalyticsQuery
        {
            WorkshopId = workshopId,
            StartDate = start,
            EndDate = end
        };

        var result = await _sender.Send(query);
        
        if (result.IsSuccess && result.Value != null)
            return Ok(result.Value);
        
        return BadRequest(result.Error);
    }
} 
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using WorkshopBooker.Application.Analytics.Queries.GetGlobalAnalytics;
using WorkshopBooker.Application.Common.Constants;
using Microsoft.AspNetCore.RateLimiting;

namespace WorkshopBooker.Api.Controllers;

[ApiController]
[Route("api/analytics/global")]
[Authorize]
[EnableRateLimiting("AnalyticsPolicy")]
public class GlobalAnalyticsController : ControllerBase
{
    private readonly ISender _sender;

    public GlobalAnalyticsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetGlobalOverview([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        var query = new GetGlobalAnalyticsQuery(start, end);
        var result = await _sender.Send(query);
        
        if (result.IsSuccess)
            return Ok(result.Value);
        
        return BadRequest(result.Error);
    }

    [HttpGet("today-stats")]
    public async Task<IActionResult> GetTodayStats()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var query = new GetGlobalAnalyticsQuery(today, tomorrow);
        var result = await _sender.Send(query);
        
        if (result.IsSuccess)
        {
            var todayStats = new
            {
                todaysBookings = result.Value.TotalBookings,
                pendingBookings = result.Value.TopWorkshops?.Sum(w => w.Bookings) ?? 0, // Uproszczone - w rzeczywistości należałoby dodać filtrowanie po statusie
                completedBookings = 0, // TODO: Dodać logikę dla zakończonych rezerwacji
                canceledBookings = 0, // TODO: Dodać logikę dla anulowanych rezerwacji
                weeklyRevenue = result.Value.TotalRevenue, // Tymczasowo używamy dzisiejszych przychodów
                activeWorkshops = result.Value.TotalWorkshops,
                avgRating = result.Value.AverageRating
            };
            return Ok(todayStats);
        }
        
        return BadRequest(result.Error);
    }

    [HttpGet("workshops-comparison")]
    public async Task<IActionResult> GetWorkshopsComparison([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        var query = new GetGlobalAnalyticsQuery(start, end);
        var result = await _sender.Send(query);
        
        if (result.IsSuccess)
            return Ok(result.Value.WorkshopComparison);
        
        return BadRequest(result.Error);
    }

    [HttpGet("performance-insights")]
    public async Task<IActionResult> GetPerformanceInsights([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        var query = new GetGlobalAnalyticsQuery(start, end);
        var result = await _sender.Send(query);
        
        if (result.IsSuccess)
        {
            var insights = new
            {
                topPerformer = result.Value.TopWorkshops?.FirstOrDefault()?.WorkshopName,
                revenueGrowth = result.Value.RevenueGrowth,
                bookingsGrowth = result.Value.BookingsGrowth,
                averageRating = result.Value.AverageRating,
                recommendations = GenerateRecommendations(result.Value)
            };
            return Ok(insights);
        }
        
        return BadRequest(result.Error);
    }

    private List<string> GenerateRecommendations(WorkshopBooker.Application.Analytics.Dtos.GlobalAnalyticsDto analytics)
    {
        var recommendations = new List<string>();

        if (analytics.RevenueGrowth < 0)
        {
            recommendations.Add("Przychody spadają. Sprawdź ceny usług i dostępność slotów czasowych.");
        }

        if (analytics.AverageRating < 4.0)
        {
            recommendations.Add("Średnia ocena jest niska. Rozważ poprawę jakości usług i obsługi klienta.");
        }

        if (analytics.TopWorkshops?.Any(w => w.UtilizationRate < 50) == true)
        {
            recommendations.Add("Niektóre warsztaty mają niskie wykorzystanie. Zoptymalizuj dostępne sloty czasowe.");
        }

        return recommendations;
    }
} 
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using WorkshopBooker.Application.Analytics.Queries.GetGlobalAnalytics;
using WorkshopBooker.Application.Common.Constants;
using Microsoft.AspNetCore.RateLimiting;
using WorkshopBooker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Api.Controllers;

[ApiController]
[Route("api/analytics/global")]
[Authorize]
[EnableRateLimiting("AnalyticsPolicy")]
public class GlobalAnalyticsController : ControllerBase
{
    private readonly ISender _sender;
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public GlobalAnalyticsController(
        ISender sender, 
        IApplicationDbContext context,
        ICurrentUserProvider currentUserProvider)
    {
        _sender = sender;
        _context = context;
        _currentUserProvider = currentUserProvider;
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
            // Pobierz rezerwacje z dzisiaj według statusu
            var currentUserId = _currentUserProvider.UserId;
            if (currentUserId == null)
                return BadRequest("Użytkownik nie jest zalogowany");

            // Pobierz warsztaty użytkownika
            var userWorkshopIds = await _context.Workshops
                .Where(w => w.UserId == currentUserId)
                .Select(w => w.Id)
                .ToListAsync();

            if (!userWorkshopIds.Any())
            {
                var emptyStats = new
                {
                    todaysBookings = 0,
                    pendingBookings = 0,
                    completedBookings = 0,
                    canceledBookings = 0,
                    weeklyRevenue = 0m,
                    activeWorkshops = 0,
                    avgRating = 0.0
                };
                return Ok(emptyStats);
            }

            // Pobierz rezerwacje z dzisiaj według statusu
            var todaysBookings = await _context.Bookings
                .Where(b => userWorkshopIds.Contains(b.Slot.WorkshopId) && 
                           b.Slot.StartTime >= today && 
                           b.Slot.StartTime < tomorrow)
                .ToListAsync();

            var pendingBookings = todaysBookings.Count(b => b.Status == BookingStatus.Requested);
            var completedBookings = todaysBookings.Count(b => b.Status == BookingStatus.Completed);
            var canceledBookings = todaysBookings.Count(b => b.Status == BookingStatus.Canceled);

            // Pobierz przychody z ostatniego tygodnia
            var weekAgo = today.AddDays(-7);
            var weeklyRevenue = await _context.Bookings
                .Where(b => userWorkshopIds.Contains(b.Slot.WorkshopId) && 
                           b.Slot.StartTime >= weekAgo && 
                           b.Slot.StartTime < tomorrow)
                .Include(b => b.Service)
                .SumAsync(b => b.Service != null ? b.Service.Price : 0);

            var todayStats = new
            {
                todaysBookings = todaysBookings.Count,
                pendingBookings = pendingBookings,
                completedBookings = completedBookings,
                canceledBookings = canceledBookings,
                weeklyRevenue = weeklyRevenue,
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
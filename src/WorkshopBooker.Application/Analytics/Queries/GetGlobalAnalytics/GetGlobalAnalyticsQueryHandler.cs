using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Analytics.Dtos;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Analytics.Queries.GetGlobalAnalytics;

public class GetGlobalAnalyticsQueryHandler : IRequestHandler<GetGlobalAnalyticsQuery, Result<GlobalAnalyticsDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public GetGlobalAnalyticsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<Result<GlobalAnalyticsDto>> Handle(GetGlobalAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserProvider.UserId;
        if (currentUserId == null)
            return Result<GlobalAnalyticsDto>.Failure("Użytkownik nie jest zalogowany");

        // Pobierz wszystkie warsztaty użytkownika
        var userWorkshops = await _context.Workshops
            .Where(w => w.UserId == currentUserId)
            .ToListAsync(cancellationToken);

        if (!userWorkshops.Any())
            return Result<GlobalAnalyticsDto>.Success(new GlobalAnalyticsDto());

        var workshopIds = userWorkshops.Select(w => w.Id).ToList();

        // Pobierz wszystkie rezerwacje ze wszystkich warsztatów w okresie
        var allBookings = await _context.Bookings
            .Where(b => workshopIds.Contains(b.Slot.WorkshopId) && 
                       b.Slot.StartTime >= request.StartDate && 
                       b.Slot.StartTime <= request.EndDate)
            .Include(b => b.Service)
            .Include(b => b.Slot)
            .ToListAsync(cancellationToken);

        // Pobierz recenzje dla tych bookingów
        var bookingIds = allBookings.Select(b => b.Id).ToList();
        var allReviews = await _context.Reviews
            .Where(r => bookingIds.Contains(r.BookingId))
            .ToListAsync(cancellationToken);

        // Oblicz globalne KPI
        var totalRevenue = allBookings.Sum(b => b.Service?.Price ?? 0);
        var totalBookings = allBookings.Count;
        var totalReviews = allReviews.Count;
        var averageRating = totalReviews > 0 
            ? allReviews.Average(r => r.Rating)
            : 0.0;

        // Analiza per warsztat
        var workshopPerformance = allBookings
            .GroupBy(b => b.Slot.WorkshopId)
            .Select(g => {
                var bookingsInGroup = g.ToList();
                var bookingIdsInGroup = bookingsInGroup.Select(b => b.Id).ToList();
                var reviewsInGroup = allReviews.Where(r => bookingIdsInGroup.Contains(r.BookingId)).ToList();
                return new WorkshopPerformanceDto
                {
                    WorkshopId = g.Key,
                    WorkshopName = userWorkshops.First(w => w.Id == g.Key).Name,
                    Revenue = bookingsInGroup.Sum(b => b.Service?.Price ?? 0),
                    Bookings = bookingsInGroup.Count(),
                    RevenuePerBooking = bookingsInGroup.Count() > 0 ? bookingsInGroup.Sum(b => b.Service?.Price ?? 0) / bookingsInGroup.Count() : 0,
                    AverageRating = reviewsInGroup.Any() ? reviewsInGroup.Average(r => r.Rating) : 0.0,
                    UtilizationRate = CalculateUtilizationRate(g.Key, request.StartDate, request.EndDate, bookingsInGroup.Count())
                };
            })
            .OrderByDescending(w => w.Revenue)
            .ToList();

        // Analiza porównawcza (bieżący vs poprzedni miesiąc)
        var previousPeriodStart = request.StartDate.AddMonths(-1);
        var previousPeriodEnd = request.EndDate.AddMonths(-1);

        var previousPeriodBookings = await _context.Bookings
            .Where(b => workshopIds.Contains(b.Slot.WorkshopId) && 
                       b.Slot.StartTime >= previousPeriodStart && 
                       b.Slot.StartTime <= previousPeriodEnd)
            .Include(b => b.Service)
            .Include(b => b.Slot)
            .ToListAsync(cancellationToken);

        var workshopComparison = workshopPerformance.Select((WorkshopPerformanceDto wp) => {
            var previousRevenue = previousPeriodBookings
                .Where(b => b.Slot.WorkshopId == wp.WorkshopId)
                .Sum(b => b.Service?.Price ?? 0);

            var growthPercentage = previousRevenue > 0 
                ? ((wp.Revenue - previousRevenue) / previousRevenue) * 100
                : 0;

            var performanceCategory = growthPercentage >= 20 ? "excellent" 
                : growthPercentage >= 0 ? "good" 
                : "needs_attention";

            return new WorkshopComparisonDto
            {
                WorkshopId = wp.WorkshopId,
                WorkshopName = wp.WorkshopName,
                CurrentMonthRevenue = wp.Revenue,
                PreviousMonthRevenue = previousRevenue,
                GrowthPercentage = growthPercentage,
                PerformanceCategory = performanceCategory
            };
        }).ToList();

        // Oblicz trendy wzrostu
        var previousTotalRevenue = previousPeriodBookings.Sum(b => b.Service?.Price ?? 0);
        var previousTotalBookings = previousPeriodBookings.Count;

        var revenueGrowth = previousTotalRevenue > 0 
            ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100
            : 0;

        var bookingsGrowth = previousTotalBookings > 0 
            ? ((totalBookings - previousTotalBookings) / (double)previousTotalBookings) * 100
            : 0;

        // Analiza popularnych usług
        var topServices = allBookings
            .GroupBy(b => b.Service.Id)
            .Select(g => new ServiceAnalyticsDto
            {
                ServiceId = g.Key,
                ServiceName = g.First().Service.Name,
                BookingCount = g.Count(),
                TotalRevenue = g.Sum(b => b.Service?.Price ?? 0),
                Percentage = totalBookings > 0 ? (g.Count() / (double)totalBookings) * 100 : 0,
                AverageRating = allReviews.Where(r => g.Select(b => b.Id).Contains(r.BookingId)).Any()
                    ? allReviews.Where(r => g.Select(b => b.Id).Contains(r.BookingId)).Average(r => r.Rating)
                    : 0.0
            })
            .OrderByDescending(s => s.TotalRevenue)
            .Take(5)
            .ToList();

        // Przychody w czasie
        var revenueOverTime = allBookings
            .GroupBy(b => b.Slot.StartTime.Date)
            .Select(g => new RevenueDataPointDto
            {
                Date = g.Key,
                Revenue = g.Sum(b => b.Service?.Price ?? 0),
                Bookings = g.Count()
            })
            .OrderBy(r => r.Date)
            .ToList();

        return Result<GlobalAnalyticsDto>.Success(new GlobalAnalyticsDto
        {
            TotalWorkshops = userWorkshops.Count,
            TotalRevenue = totalRevenue,
            TotalBookings = totalBookings,
            AverageRating = averageRating,
            TotalReviews = totalReviews,
            RevenueGrowth = revenueGrowth,
            BookingsGrowth = (decimal)bookingsGrowth,
            TopWorkshops = workshopPerformance.Take(5).ToList(),
            TopServices = topServices,
            RevenueOverTime = revenueOverTime,
            WorkshopComparison = workshopComparison
        });
    }

    private double CalculateUtilizationRate(Guid workshopId, DateTime startDate, DateTime endDate, int actualBookings)
    {
        // Uproszczona kalkulacja wykorzystania - w rzeczywistości należałoby sprawdzić dostępne sloty
        var totalDays = (endDate - startDate).Days;
        var estimatedSlotsPerDay = 8; // Zakładamy 8 slotów dziennie
        var totalPossibleSlots = totalDays * estimatedSlotsPerDay;
        
        return totalPossibleSlots > 0 ? (actualBookings / (double)totalPossibleSlots) * 100 : 0;
    }
} 
using MediatR;
using WorkshopBooker.Application.Analytics.Dtos;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common;
using Microsoft.EntityFrameworkCore;

namespace WorkshopBooker.Application.Analytics.Queries.GetWorkshopAnalytics;

public class GetWorkshopAnalyticsQueryHandler : IRequestHandler<GetWorkshopAnalyticsQuery, Result<WorkshopAnalyticsDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public GetWorkshopAnalyticsQueryHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<Result<WorkshopAnalyticsDto>> Handle(GetWorkshopAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserProvider.UserId;
        if (currentUserId == null)
            return Result<WorkshopAnalyticsDto>.Failure("Użytkownik nie jest zalogowany");

        // Sprawdź czy warsztat należy do użytkownika
        var workshop = await _context.Workshops
            .FirstOrDefaultAsync(w => w.Id == request.WorkshopId && w.UserId == currentUserId, cancellationToken);

        if (workshop == null)
            return Result<WorkshopAnalyticsDto>.Failure("Warsztat nie został znaleziony");

        // Pobierz rezerwacje w danym okresie
        var bookings = await _context.Bookings
            .Where(b => b.Slot.WorkshopId == request.WorkshopId && 
                       b.Slot.StartTime >= request.StartDate && 
                       b.Slot.StartTime <= request.EndDate)
            .Select(b => new
            {
                b.Id,
                b.Service.Price,
                b.Service.DurationInMinutes,
                ServiceId = b.Service.Id,
                b.Service.Name,
                b.Slot.StartTime
            })
            .ToListAsync(cancellationToken);

        // Pobierz recenzje
        var reviews = await _context.Reviews
            .Where(r => r.WorkshopId == request.WorkshopId)
            .ToListAsync(cancellationToken);

        // Oblicz podstawowe KPI
        var monthlyRevenue = bookings.Sum(b => b.Price);
        var monthlyBookings = bookings.Count;
        var averageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;
        var totalReviews = reviews.Count;
        var averageServiceTime = bookings.Any() ? bookings.Average(b => b.DurationInMinutes) / 60.0 : 0;

        // Oblicz trendy (porównanie z poprzednim okresem)
        var previousStartDate = request.StartDate.AddDays(-(request.EndDate - request.StartDate).Days);
        var previousEndDate = request.StartDate.AddDays(-1);

        var previousBookings = await _context.Bookings
            .Where(b => b.Slot.WorkshopId == request.WorkshopId && 
                       b.Slot.StartTime >= previousStartDate && 
                       b.Slot.StartTime <= previousEndDate)
            .Select(b => new { b.Service.Price })
            .ToListAsync(cancellationToken);

        var previousRevenue = previousBookings.Sum(b => b.Price);
        var previousBookingsCount = previousBookings.Count;

        var revenueGrowth = previousRevenue > 0 ? ((monthlyRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        var bookingsGrowth = previousBookingsCount > 0 ? (int)(((monthlyBookings - previousBookingsCount) / (double)previousBookingsCount) * 100) : 0;

        // Rozkład usług
        var serviceDistribution = bookings
            .GroupBy(b => new { ServiceId = b.ServiceId, b.Name })
            .Select(g => new ServiceAnalyticsDto
            {
                ServiceId = g.Key.ServiceId,
                ServiceName = g.Key.Name,
                BookingCount = g.Count(),
                TotalRevenue = g.Sum(b => b.Price),
                Percentage = (double)g.Count() / monthlyBookings * 100,
                AverageRating = reviews.Where(r => g.Any(b => b.Id == r.BookingId)).Any() ? 
                    reviews.Where(r => g.Any(b => b.Id == r.BookingId)).Average(r => r.Rating) : 0
            })
            .OrderByDescending(s => s.BookingCount)
            .ToList();

        // Popularne godziny
        var timeSlotDistribution = bookings
            .GroupBy(b => b.StartTime.Hour)
            .Select(g => new TimeSlotAnalyticsDto
            {
                TimeSlot = $"{g.Key:00}:00-{(g.Key + 1):00}:00",
                BookingCount = g.Count(),
                UtilizationRate = (double)g.Count() / (request.EndDate - request.StartDate).Days * 100
            })
            .OrderByDescending(t => t.BookingCount)
            .ToList();

        // Przychody w czasie
        var revenueOverTime = bookings
            .GroupBy(b => b.StartTime.Date)
            .Select(g => new RevenueDataPointDto
            {
                Date = g.Key,
                Revenue = g.Sum(b => b.Price),
                Bookings = g.Count()
            })
            .OrderBy(r => r.Date)
            .ToList();

        var analytics = new WorkshopAnalyticsDto
        {
            WorkshopId = workshop.Id,
            WorkshopName = workshop.Name,
            MonthlyRevenue = monthlyRevenue,
            MonthlyBookings = monthlyBookings,
            AverageRating = averageRating,
            TotalReviews = totalReviews,
            AverageServiceTime = averageServiceTime,
            RevenueGrowth = revenueGrowth,
            BookingsGrowth = bookingsGrowth,
            ServiceDistribution = serviceDistribution,
            PopularTimeSlots = timeSlotDistribution,
            RevenueOverTime = revenueOverTime
        };

        return Result<WorkshopAnalyticsDto>.Success(analytics);
    }
} 
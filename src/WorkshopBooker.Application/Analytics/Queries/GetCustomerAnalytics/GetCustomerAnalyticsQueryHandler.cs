using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Analytics.Dtos;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Analytics.Queries.GetCustomerAnalytics;

public class GetCustomerAnalyticsQueryHandler : IRequestHandler<GetCustomerAnalyticsQuery, Result<CustomerAnalyticsDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public GetCustomerAnalyticsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<Result<CustomerAnalyticsDto>> Handle(GetCustomerAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserProvider.UserId;
        if (currentUserId == null)
            return Result<CustomerAnalyticsDto>.Failure("Użytkownik nie jest zalogowany");

        // Sprawdź czy warsztat należy do użytkownika
        var workshop = await _context.Workshops
            .FirstOrDefaultAsync(w => w.Id == request.WorkshopId && w.UserId == currentUserId, cancellationToken);

        if (workshop == null)
            return Result<CustomerAnalyticsDto>.Failure("Warsztat nie został znaleziony lub brak uprawnień");

        // Pobierz wszystkie rezerwacje w okresie
        var bookings = await _context.Bookings
            .Where(b => b.Slot.WorkshopId == request.WorkshopId && 
                       b.Slot.StartTime >= request.StartDate && 
                       b.Slot.StartTime <= request.EndDate)
            .Include(b => b.Service)
            .Include(b => b.Slot)
            .ToListAsync(cancellationToken);

        if (!bookings.Any())
            return Result<CustomerAnalyticsDto>.Success(new CustomerAnalyticsDto());

        // Grupuj po klientach (email/telefon)
        var customerGroups = bookings
            .GroupBy(b => new { b.CustomerEmail, b.CustomerPhone })
            .Where(g => !string.IsNullOrEmpty(g.Key.CustomerEmail) || !string.IsNullOrEmpty(g.Key.CustomerPhone))
            .ToList();

        // Analiza nowych vs powracających klientów
        var allTimeBookings = await _context.Bookings
            .Where(b => b.Slot.WorkshopId == request.WorkshopId)
            .Include(b => b.Slot)
            .ToListAsync(cancellationToken);

        var newCustomers = customerGroups
            .Where(g => allTimeBookings
                .Where(b => (b.CustomerEmail == g.Key.CustomerEmail && !string.IsNullOrEmpty(g.Key.CustomerEmail)) ||
                           (b.CustomerPhone == g.Key.CustomerPhone && !string.IsNullOrEmpty(g.Key.CustomerPhone)))
                .Min(b => b.Slot.StartTime) >= request.StartDate)
            .Count();

        var returningCustomers = customerGroups.Count - newCustomers;

        // Top klienci
        var topCustomers = customerGroups
            .Select(g => new TopCustomerDto
            {
                Email = g.Key.CustomerEmail,
                Phone = g.Key.CustomerPhone,
                CustomerEmail = g.Key.CustomerEmail,
                CustomerName = !string.IsNullOrEmpty(g.Key.CustomerEmail) ? g.Key.CustomerEmail.Split('@')[0] : "Klient",
                BookingCount = g.Count(),
                TotalBookings = g.Count(),
                TotalSpent = (double)g.Sum(b => b.Service?.Price ?? 0),
                LastVisit = g.Max(b => b.Slot.StartTime),
                FirstBooking = g.Min(b => b.Slot.StartTime).ToString("yyyy-MM-dd"),
                LastBooking = g.Max(b => b.Slot.StartTime).ToString("yyyy-MM-dd"),
                CustomerType = g.Count() > 1 ? "returning" : "new",
                AverageRating = 4.5 // TODO: Dodać rzeczywiste oceny
            })
            .OrderByDescending(c => c.TotalSpent)
            .Take(10)
            .ToList();

        // Segmentacja klientów
        var customerSegments = customerGroups
            .Select(g => new
            {
                Customer = g.Key,
                Bookings = g.Count(),
                TotalSpent = (double)g.Sum(b => b.Service?.Price ?? 0),
                AvgSpent = (double)g.Sum(b => b.Service?.Price ?? 0) / g.Count()
            })
            .ToList();

        // Tworzenie segmentów klientów
        var segments = new List<CustomerSegmentDto>
        {
            new CustomerSegmentDto
            {
                SegmentName = "Wysoka wartość",
                Description = "Klienci wydający 1000+ zł",
                CustomerCount = customerSegments.Count(c => c.TotalSpent >= 1000),
                TotalRevenue = customerSegments.Where(c => c.TotalSpent >= 1000).Sum(c => c.TotalSpent),
                AverageRating = 4.5, // TODO: Dodać rzeczywiste oceny
                AverageOrderValue = customerSegments.Where(c => c.TotalSpent >= 1000).Any() 
                    ? customerSegments.Where(c => c.TotalSpent >= 1000).Average(c => c.AvgSpent) 
                    : 0,
                Color = "#10B981"
            },
            new CustomerSegmentDto
            {
                SegmentName = "Średnia wartość",
                Description = "Klienci wydający 500-999 zł",
                CustomerCount = customerSegments.Count(c => c.TotalSpent >= 500 && c.TotalSpent < 1000),
                TotalRevenue = customerSegments.Where(c => c.TotalSpent >= 500 && c.TotalSpent < 1000).Sum(c => c.TotalSpent),
                AverageRating = 4.2, // TODO: Dodać rzeczywiste oceny
                AverageOrderValue = customerSegments.Where(c => c.TotalSpent >= 500 && c.TotalSpent < 1000).Any() 
                    ? customerSegments.Where(c => c.TotalSpent >= 500 && c.TotalSpent < 1000).Average(c => c.AvgSpent) 
                    : 0,
                Color = "#F59E0B"
            },
            new CustomerSegmentDto
            {
                SegmentName = "Niska wartość",
                Description = "Klienci wydający poniżej 500 zł",
                CustomerCount = customerSegments.Count(c => c.TotalSpent < 500),
                TotalRevenue = customerSegments.Where(c => c.TotalSpent < 500).Sum(c => c.TotalSpent),
                AverageRating = 4.0, // TODO: Dodać rzeczywiste oceny
                AverageOrderValue = customerSegments.Where(c => c.TotalSpent < 500).Any() 
                    ? customerSegments.Where(c => c.TotalSpent < 500).Average(c => c.AvgSpent) 
                    : 0,
                Color = "#EF4444"
            },
            new CustomerSegmentDto
            {
                SegmentName = "Częste wizyty",
                Description = "Klienci z 5+ rezerwacjami",
                CustomerCount = customerSegments.Count(c => c.Bookings >= 5),
                TotalRevenue = customerSegments.Where(c => c.Bookings >= 5).Sum(c => c.TotalSpent),
                AverageRating = 4.6, // TODO: Dodać rzeczywiste oceny
                AverageOrderValue = customerSegments.Where(c => c.Bookings >= 5).Any() 
                    ? customerSegments.Where(c => c.Bookings >= 5).Average(c => c.AvgSpent) 
                    : 0,
                Color = "#3B82F6"
            },
            new CustomerSegmentDto
            {
                SegmentName = "Okazjonalne wizyty",
                Description = "Klienci z 2-4 rezerwacjami",
                CustomerCount = customerSegments.Count(c => c.Bookings >= 2 && c.Bookings < 5),
                TotalRevenue = customerSegments.Where(c => c.Bookings >= 2 && c.Bookings < 5).Sum(c => c.TotalSpent),
                AverageRating = 4.3, // TODO: Dodać rzeczywiste oceny
                AverageOrderValue = customerSegments.Where(c => c.Bookings >= 2 && c.Bookings < 5).Any() 
                    ? customerSegments.Where(c => c.Bookings >= 2 && c.Bookings < 5).Average(c => c.AvgSpent) 
                    : 0,
                Color = "#8B5CF6"
            },
            new CustomerSegmentDto
            {
                SegmentName = "Jednorazowe wizyty",
                Description = "Klienci z 1 rezerwacją",
                CustomerCount = customerSegments.Count(c => c.Bookings == 1),
                TotalRevenue = customerSegments.Where(c => c.Bookings == 1).Sum(c => c.TotalSpent),
                AverageRating = 4.1, // TODO: Dodać rzeczywiste oceny
                AverageOrderValue = customerSegments.Where(c => c.Bookings == 1).Any() 
                    ? customerSegments.Where(c => c.Bookings == 1).Average(c => c.AvgSpent) 
                    : 0,
                Color = "#6B7280"
            }
        };

        // Wykres kołowy - segmentacja
        var segmentChartData = new[]
        {
            new { label = "Wysoka wartość", value = segments.FirstOrDefault(s => s.SegmentName == "Wysoka wartość")?.CustomerCount ?? 0, color = "#10B981" },
            new { label = "Średnia wartość", value = segments.FirstOrDefault(s => s.SegmentName == "Średnia wartość")?.CustomerCount ?? 0, color = "#F59E0B" },
            new { label = "Niska wartość", value = segments.FirstOrDefault(s => s.SegmentName == "Niska wartość")?.CustomerCount ?? 0, color = "#EF4444" }
        };

        // LTV (Lifetime Value) - średnia wartość klienta
        var averageLTV = customerGroups.Any() 
            ? customerGroups.Average(g => (double)g.Sum(b => b.Service?.Price ?? 0))
            : 0;

        // Retention rate - klienci którzy wrócili w tym okresie
        var previousPeriodStart = request.StartDate.AddDays(-(request.EndDate - request.StartDate).Days);
        var previousPeriodBookings = await _context.Bookings
            .Where(b => b.Slot.WorkshopId == request.WorkshopId && 
                       b.Slot.StartTime >= previousPeriodStart && 
                       b.Slot.StartTime < request.StartDate)
            .Include(b => b.Slot)
            .ToListAsync(cancellationToken);

        var previousCustomers = previousPeriodBookings
            .GroupBy(b => new { b.CustomerEmail, b.CustomerPhone })
            .Select(g => new { g.Key.CustomerEmail, g.Key.CustomerPhone })
            .ToList();

        var retainedCustomers = customerGroups
            .Count(g => previousCustomers.Any(pc => 
                (pc.CustomerEmail == g.Key.CustomerEmail && !string.IsNullOrEmpty(g.Key.CustomerEmail)) ||
                (pc.CustomerPhone == g.Key.CustomerPhone && !string.IsNullOrEmpty(g.Key.CustomerPhone))));

        var retentionRate = previousCustomers.Any() 
            ? (double)retainedCustomers / previousCustomers.Count * 100
            : 0;

        return Result<CustomerAnalyticsDto>.Success(new CustomerAnalyticsDto
        {
            TotalCustomers = customerGroups.Count,
            NewCustomers = newCustomers,
            ReturningCustomers = returningCustomers,
            AverageLTV = averageLTV,
            AverageCustomerValue = averageLTV,
            CustomerLifetimeValue = averageLTV,
            RetentionRate = retentionRate,
            TopCustomers = topCustomers,
            CustomerSegments = segments,
            SegmentChartData = segmentChartData,
            CustomerGrowth = newCustomers > 0 ? ((double)newCustomers / customerGroups.Count) * 100 : 0
        });
    }
} 
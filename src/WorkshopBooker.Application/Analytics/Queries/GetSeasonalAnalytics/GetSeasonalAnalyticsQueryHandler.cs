using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Analytics.Dtos;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Analytics.Queries.GetSeasonalAnalytics;

public class GetSeasonalAnalyticsQueryHandler : IRequestHandler<GetSeasonalAnalyticsQuery, Result<SeasonalAnalyticsDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public GetSeasonalAnalyticsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<Result<SeasonalAnalyticsDto>> Handle(GetSeasonalAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserProvider.UserId;
        if (currentUserId == null)
            return Result<SeasonalAnalyticsDto>.Failure("Użytkownik nie jest zalogowany");

        // Sprawdź czy warsztat należy do użytkownika
        var workshop = await _context.Workshops
            .FirstOrDefaultAsync(w => w.Id == request.WorkshopId && w.UserId == currentUserId, cancellationToken);

        if (workshop == null)
            return Result<SeasonalAnalyticsDto>.Failure("Warsztat nie został znaleziony lub brak uprawnień");

        // Pobierz dane z ostatnich 12 miesięcy dla lepszej analizy sezonowości
        var startDate = request.StartDate.AddYears(-1);
        var endDate = request.EndDate;

        var bookings = await _context.Bookings
            .Where(b => b.Slot.WorkshopId == request.WorkshopId && 
                       b.Slot.StartTime >= startDate && 
                       b.Slot.StartTime <= endDate)
            .Include(b => b.Service)
            .Include(b => b.Slot)
            .ToListAsync(cancellationToken);

        if (!bookings.Any())
            return Result<SeasonalAnalyticsDto>.Success(new SeasonalAnalyticsDto());

        // Analiza dni tygodnia
        var dayOfWeekAnalysis = bookings
            .GroupBy(b => b.Slot.StartTime.DayOfWeek)
            .Select(g => new DayOfWeekAnalysisDto
            {
                DayOfWeek = g.Key.ToString(),
                TotalBookings = g.Count(),
                TotalRevenue = (double)g.Sum(b => b.Service?.Price ?? 0),
                AverageRevenue = g.Average(b => (double)(b.Service?.Price ?? 0)),
                UtilizationRate = CalculateUtilizationRate(g.Key, g.Count(), startDate, endDate)
            })
            .OrderBy(d => d.DayOfWeek)
            .ToList();

        // Analiza godzin
        var hourlyAnalysis = bookings
            .GroupBy(b => b.Slot.StartTime.Hour)
            .Select(g => new HourlyAnalysisDto
            {
                Hour = g.Key,
                TotalBookings = g.Count(),
                TotalRevenue = (double)g.Sum(b => b.Service?.Price ?? 0),
                AverageRevenue = g.Average(b => (double)(b.Service?.Price ?? 0)),
                PeakHour = g.Count() > bookings.Count() / 24 * 1.5 // 50% więcej niż średnia
            })
            .OrderBy(h => h.Hour)
            .ToList();

        // Trendy miesięczne
        var monthlyTrends = bookings
            .GroupBy(b => new { b.Slot.StartTime.Year, b.Slot.StartTime.Month })
            .Select(g => new MonthlyTrendDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                MonthName = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM", new System.Globalization.CultureInfo("pl-PL")),
                TotalBookings = g.Count(),
                TotalRevenue = (double)g.Sum(b => b.Service?.Price ?? 0),
                AverageRevenue = g.Average(b => (double)(b.Service?.Price ?? 0))
            })
            .OrderBy(m => m.Year)
            .ThenBy(m => m.Month)
            .ToList();

        // Porównanie rok do roku
        var yearOverYearComparison = await GetYearOverYearComparison(request.WorkshopId, startDate, endDate, cancellationToken);

        // Analiza godzin szczytu
        var peakHoursAnalysis = AnalyzePeakHours(bookings);

        // Sezonowość kwartalna
        var quarterlyAnalysis = bookings
            .GroupBy(b => GetQuarter(b.Slot.StartTime))
            .Select(g => new QuarterlyAnalysisDto
            {
                Quarter = g.Key,
                TotalBookings = g.Count(),
                TotalRevenue = (double)g.Sum(b => b.Service?.Price ?? 0),
                AverageRevenue = g.Average(b => (double)(b.Service?.Price ?? 0)),
                GrowthRate = 0 // TODO: Obliczyć wzrost względem poprzedniego kwartału
            })
            .OrderBy(q => q.Quarter)
            .ToList();

        return Result<SeasonalAnalyticsDto>.Success(new SeasonalAnalyticsDto
        {
            DayOfWeekAnalysis = dayOfWeekAnalysis,
            HourlyAnalysis = hourlyAnalysis,
            MonthlyTrends = monthlyTrends,
            YearOverYearComparison = yearOverYearComparison,
            PeakHoursAnalysis = peakHoursAnalysis,
            QuarterlyAnalysis = quarterlyAnalysis,
            SeasonalPatterns = IdentifySeasonalPatterns(monthlyTrends, dayOfWeekAnalysis),
            BestPerformingDays = dayOfWeekAnalysis.OrderByDescending(d => d.TotalRevenue).Take(3).ToList(),
            WorstPerformingDays = dayOfWeekAnalysis.OrderBy(d => d.TotalRevenue).Take(3).ToList()
        });
    }

    private double CalculateUtilizationRate(DayOfWeek dayOfWeek, int bookings, DateTime startDate, DateTime endDate)
    {
        var totalDays = (endDate - startDate).Days;
        var dayOfWeekCount = Enumerable.Range(0, totalDays)
            .Select(i => startDate.AddDays(i))
            .Count(d => d.DayOfWeek == dayOfWeek);

        var estimatedSlotsPerDay = 8; // Zakładamy 8 slotów dziennie
        var totalPossibleSlots = dayOfWeekCount * estimatedSlotsPerDay;
        
        return totalPossibleSlots > 0 ? (bookings / (double)totalPossibleSlots) * 100 : 0;
    }

    private async Task<List<YearOverYearDto>> GetYearOverYearComparison(Guid workshopId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var currentYear = DateTime.UtcNow.Year;
        var previousYear = currentYear - 1;

        var currentYearBookings = await _context.Bookings
            .Where(b => b.Slot.WorkshopId == workshopId && 
                       b.Slot.StartTime.Year == currentYear)
            .Include(b => b.Service)
            .Include(b => b.Slot)
            .ToListAsync(cancellationToken);

        var previousYearBookings = await _context.Bookings
            .Where(b => b.Slot.WorkshopId == workshopId && 
                       b.Slot.StartTime.Year == previousYear)
            .Include(b => b.Service)
            .Include(b => b.Slot)
            .ToListAsync(cancellationToken);

        var comparison = new List<YearOverYearDto>();

        for (int month = 1; month <= 12; month++)
        {
            var currentMonthBookings = currentYearBookings.Where(b => b.Slot.StartTime.Month == month).ToList();
            var previousMonthBookings = previousYearBookings.Where(b => b.Slot.StartTime.Month == month).ToList();

            var currentRevenue = (double)currentMonthBookings.Sum(b => b.Service?.Price ?? 0);
            var previousRevenue = (double)previousMonthBookings.Sum(b => b.Service?.Price ?? 0);
            var currentBookings = currentMonthBookings.Count;
            var previousBookings = previousMonthBookings.Count;

            var revenueGrowth = previousRevenue > 0 
                ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
                : 0;

            var bookingsGrowth = previousBookings > 0
                ? ((currentBookings - previousBookings) / (double)previousBookings) * 100
                : 0;

            comparison.Add(new YearOverYearDto
            {
                Month = month,
                MonthName = new DateTime(currentYear, month, 1).ToString("MMMM", new System.Globalization.CultureInfo("pl-PL")),
                CurrentYearRevenue = currentRevenue,
                PreviousYearRevenue = previousRevenue,
                CurrentYearBookings = currentBookings,
                PreviousYearBookings = previousBookings,
                RevenueGrowth = revenueGrowth,
                BookingsGrowth = bookingsGrowth
            });
        }

        return comparison;
    }

    private PeakHoursAnalysisDto AnalyzePeakHours(List<WorkshopBooker.Domain.Entities.Booking> bookings)
    {
        var hourlyData = bookings
            .GroupBy(b => b.Slot.StartTime.Hour)
            .Select(g => new { Hour = g.Key, Count = g.Count() })
            .OrderByDescending(h => h.Count)
            .ToList();

        var averageBookings = hourlyData.Average(h => h.Count);
        var peakHours = hourlyData.Where(h => h.Count > averageBookings * 1.5).ToList();
        var offPeakHours = hourlyData.Where(h => h.Count < averageBookings * 0.5).ToList();

        return new PeakHoursAnalysisDto
        {
            PeakHours = peakHours.Select(h => h.Hour).ToList(),
            OffPeakHours = offPeakHours.Select(h => h.Hour).ToList(),
            AverageBookingsPerHour = averageBookings,
            PeakHourUtilization = peakHours.Any() ? peakHours.Max(h => h.Count) / averageBookings : 0
        };
    }

    private int GetQuarter(DateTime date)
    {
        return (date.Month - 1) / 3 + 1;
    }

    private List<string> IdentifySeasonalPatterns(List<MonthlyTrendDto> monthlyTrends, List<DayOfWeekAnalysisDto> dayOfWeekAnalysis)
    {
        var patterns = new List<string>();

        if (!monthlyTrends.Any()) return patterns;

        // Znajdź najlepszy i najgorszy miesiąc
        var bestMonth = monthlyTrends.OrderByDescending(m => m.TotalRevenue).First();
        var worstMonth = monthlyTrends.OrderBy(m => m.TotalRevenue).First();

        patterns.Add($"Najlepszy miesiąc: {bestMonth.MonthName} (średnio {bestMonth.AverageRevenue:F0} zł/dzień)");
        patterns.Add($"Najgorszy miesiąc: {worstMonth.MonthName} (średnio {worstMonth.AverageRevenue:F0} zł/dzień)");

        // Znajdź najlepszy i najgorszy dzień tygodnia
        if (dayOfWeekAnalysis.Any())
        {
            var bestDay = dayOfWeekAnalysis.OrderByDescending(d => d.TotalRevenue).First();
            var worstDay = dayOfWeekAnalysis.OrderBy(d => d.TotalRevenue).First();

            patterns.Add($"Najlepszy dzień tygodnia: {bestDay.DayOfWeek} (średnio {bestDay.AverageRevenue:F0} zł)");
            patterns.Add($"Najgorszy dzień tygodnia: {worstDay.DayOfWeek} (średnio {worstDay.AverageRevenue:F0} zł)");
        }

        // Analiza weekend vs weekday
        var weekendDays = dayOfWeekAnalysis.Where(d => d.DayOfWeek == "Saturday" || d.DayOfWeek == "Sunday").ToList();
        var weekdays = dayOfWeekAnalysis.Where(d => d.DayOfWeek != "Saturday" && d.DayOfWeek != "Sunday").ToList();

        if (weekendDays.Any() && weekdays.Any())
        {
            var weekendAvg = weekendDays.Average(d => d.AverageRevenue);
            var weekdayAvg = weekdays.Average(d => d.AverageRevenue);

            if (weekendAvg > weekdayAvg * 1.2)
                patterns.Add("Weekendy są znacznie lepsze niż dni robocze");
            else if (weekdayAvg > weekendAvg * 1.2)
                patterns.Add("Dni robocze są znacznie lepsze niż weekendy");
            else
                patterns.Add("Brak znaczącej różnicy między weekendami a dniami roboczymi");
        }

        return patterns;
    }
} 
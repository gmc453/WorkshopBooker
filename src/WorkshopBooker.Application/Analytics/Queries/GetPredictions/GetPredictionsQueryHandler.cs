using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Analytics.Dtos;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Analytics.Queries.GetPredictions;

public class GetPredictionsQueryHandler : IRequestHandler<GetPredictionsQuery, Result<PredictiveAnalyticsDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public GetPredictionsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<Result<PredictiveAnalyticsDto>> Handle(GetPredictionsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserProvider.UserId;
        if (currentUserId == null)
            return Result<PredictiveAnalyticsDto>.Failure("Użytkownik nie jest zalogowany");

        // Sprawdź czy warsztat należy do użytkownika
        var workshop = await _context.Workshops
            .FirstOrDefaultAsync(w => w.Id == request.WorkshopId && w.UserId == currentUserId, cancellationToken);

        if (workshop == null)
            return Result<PredictiveAnalyticsDto>.Failure("Warsztat nie został znaleziony lub brak uprawnień");

        // Pobierz dane historyczne z ostatnich 6 miesięcy
        var historicalData = await _context.Bookings
            .Where(b => b.Slot.WorkshopId == request.WorkshopId && 
                       b.Slot.StartTime >= DateTime.UtcNow.AddMonths(-6))
            .Include(b => b.Service)
            .Include(b => b.Slot)
            .ToListAsync(cancellationToken);

        if (!historicalData.Any())
            return Result<PredictiveAnalyticsDto>.Success(new PredictiveAnalyticsDto());

        // Grupuj dane po dniach
        var dailyData = historicalData
            .GroupBy(b => b.Slot.StartTime.Date)
            .Select(g => new DailyDataPoint
            {
                Date = g.Key,
                Revenue = g.Sum(b => (double)(b.Service?.Price ?? 0)),
                Bookings = g.Count(),
                AverageRating = 0.0 // TODO: Dodać oceny
            })
            .OrderBy(d => d.Date)
            .ToList();

        // Prosta predykcja przychodów (średnia z ostatnich 30 dni)
        var recentRevenue = dailyData
            .Where(d => d.Date >= DateTime.UtcNow.AddDays(-30))
            .Select(d => d.Revenue)
            .ToList();

        var predictedRevenue = recentRevenue.Any() 
            ? recentRevenue.Average() * request.PredictionDays
            : 0;

        // Predykcja rezerwacji
        var recentBookings = dailyData
            .Where(d => d.Date >= DateTime.UtcNow.AddDays(-30))
            .Select(d => d.Bookings)
            .ToList();

        var predictedBookings = recentBookings.Any()
            ? (int)(recentBookings.Average() * request.PredictionDays)
            : 0;

        // Analiza trendów
        var trendAnalysis = AnalyzeTrends(dailyData);

        // Rekomendowane godziny na podstawie popularności
        var hourlyData = historicalData
            .GroupBy(b => b.Slot.StartTime.Hour)
            .Select(g => new HourlyDataPoint
            {
                Hour = g.Key,
                Bookings = g.Count(),
                Revenue = g.Sum(b => (double)(b.Service?.Price ?? 0))
            })
            .OrderByDescending(h => h.Bookings)
            .ToList();

        var recommendedHours = hourlyData
            .Take(5)
            .Select(h => new RecommendedTimeSlotDto
            {
                Hour = h.Hour,
                ExpectedBookings = (int)(h.Bookings / 30.0 * request.PredictionDays),
                ExpectedRevenue = h.Revenue / 30.0 * request.PredictionDays,
                Confidence = CalculateConfidence(h.Bookings, 30)
            })
            .ToList();

        // Rekomendacje AI
        var aiRecommendations = GenerateAIRecommendations(dailyData, hourlyData, trendAnalysis);

        // Predykcja sezonowości
        var seasonalPrediction = PredictSeasonality(dailyData, request.PredictionDays);

        return Result<PredictiveAnalyticsDto>.Success(new PredictiveAnalyticsDto
        {
            PredictedRevenue = predictedRevenue,
            PredictedBookings = predictedBookings,
            RevenueTrend = trendAnalysis.RevenueTrend,
            BookingsTrend = trendAnalysis.BookingsTrend,
            Confidence = CalculateOverallConfidence(dailyData),
            RecommendedTimeSlots = recommendedHours,
            AIRecommendations = aiRecommendations,
            SeasonalPrediction = seasonalPrediction,
            GrowthRate = trendAnalysis.GrowthRate,
            RiskFactors = IdentifyRiskFactors(dailyData)
        });
    }

    private TrendAnalysisDto AnalyzeTrends(List<DailyDataPoint> dailyData)
    {
        if (dailyData.Count < 2)
            return new TrendAnalysisDto();

        var recentData = dailyData.TakeLast(30).ToList();
        var previousData = dailyData.Skip(Math.Max(0, dailyData.Count - 60)).Take(30).ToList();

        if (!recentData.Any() || !previousData.Any())
            return new TrendAnalysisDto();

        var recentAvgRevenue = recentData.Average(d => d.Revenue);
        var previousAvgRevenue = previousData.Average(d => d.Revenue);
        var recentAvgBookings = recentData.Average(d => d.Bookings);
        var previousAvgBookings = previousData.Average(d => d.Bookings);

        var revenueGrowth = previousAvgRevenue > 0 
            ? ((recentAvgRevenue - previousAvgRevenue) / previousAvgRevenue) * 100
            : 0;

        var bookingsGrowth = previousAvgBookings > 0
            ? ((recentAvgBookings - previousAvgBookings) / previousAvgBookings) * 100
            : 0;

        return new TrendAnalysisDto
        {
            RevenueTrend = revenueGrowth > 5 ? "wzrost" : revenueGrowth < -5 ? "spadek" : "stabilny",
            BookingsTrend = bookingsGrowth > 5 ? "wzrost" : bookingsGrowth < -5 ? "spadek" : "stabilny",
            GrowthRate = revenueGrowth
        };
    }

    private double CalculateConfidence(int bookings, int days)
    {
        if (bookings == 0) return 0;
        
        // Prosta formuła pewności na podstawie liczby obserwacji
        var confidence = Math.Min(bookings / (double)days * 10, 100);
        return Math.Round(confidence, 1);
    }

    private double CalculateOverallConfidence(List<DailyDataPoint> dailyData)
    {
        if (!dailyData.Any()) return 0;

        var totalBookings = dailyData.Sum(d => d.Bookings);
        var days = dailyData.Count;
        
        return CalculateConfidence(totalBookings, days);
    }

    private List<string> GenerateAIRecommendations(List<DailyDataPoint> dailyData, List<HourlyDataPoint> hourlyData, TrendAnalysisDto trends)
    {
        var recommendations = new List<string>();

        if (trends.RevenueTrend == "spadek")
        {
            recommendations.Add("Rozważ promocje weekendowe aby zwiększyć ruch");
            recommendations.Add("Sprawdź konkurencję w okolicy");
        }

        if (trends.RevenueTrend == "wzrost")
        {
            recommendations.Add("Dodaj więcej slotów w popularnych godzinach");
            recommendations.Add("Rozważ podniesienie cen popularnych usług");
        }

        var lowTrafficHours = hourlyData.Where(h => h.Bookings < hourlyData.Average(hr => hr.Bookings) * 0.5).ToList();
        if (lowTrafficHours.Any())
        {
            recommendations.Add($"Godziny {string.Join(", ", lowTrafficHours.Select(h => h.Hour))} mają niski ruch - rozważ promocje");
        }

        if (dailyData.Count > 0)
        {
            var avgDailyRevenue = dailyData.Average(d => d.Revenue);
            if (avgDailyRevenue < 500)
            {
                recommendations.Add("Średni dzienny przychód jest niski - rozważ nowe usługi");
            }
        }

        return recommendations;
    }

    private SeasonalPredictionDto PredictSeasonality(List<DailyDataPoint> dailyData, int predictionDays)
    {
        if (!dailyData.Any()) return new SeasonalPredictionDto();

        // Prosta analiza sezonowości - dni tygodnia
        var dayOfWeekData = dailyData
            .GroupBy(d => d.Date.DayOfWeek)
            .Select(g => new
            {
                DayOfWeek = g.Key,
                AvgRevenue = g.Average(d => d.Revenue),
                AvgBookings = g.Average(d => d.Bookings)
            })
            .ToList();

        var bestDay = dayOfWeekData.OrderByDescending(d => d.AvgRevenue).First();
        var worstDay = dayOfWeekData.OrderBy(d => d.AvgRevenue).First();

        return new SeasonalPredictionDto
        {
            BestDayOfWeek = bestDay.DayOfWeek.ToString(),
            WorstDayOfWeek = worstDay.DayOfWeek.ToString(),
            SeasonalFactor = bestDay.AvgRevenue > 0 ? worstDay.AvgRevenue / bestDay.AvgRevenue : 0
        };
    }

    private List<string> IdentifyRiskFactors(List<DailyDataPoint> dailyData)
    {
        var risks = new List<string>();

        if (!dailyData.Any()) return risks;

        var recentData = dailyData.TakeLast(7).ToList();
        if (recentData.Any())
        {
            var avgRecentRevenue = recentData.Average(d => d.Revenue);
            var avgRecentBookings = recentData.Average(d => d.Bookings);

            if (avgRecentRevenue < 100)
                risks.Add("Niskie przychody w ostatnim tygodniu");

            if (avgRecentBookings < 2)
                risks.Add("Mało rezerwacji w ostatnim tygodniu");

            var zeroDays = recentData.Count(d => d.Bookings == 0);
            if (zeroDays > 2)
                risks.Add("Wiele dni bez rezerwacji");
        }

        return risks;
    }
} 
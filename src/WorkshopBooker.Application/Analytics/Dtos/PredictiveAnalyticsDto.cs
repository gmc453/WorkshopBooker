namespace WorkshopBooker.Application.Analytics.Dtos;

public class PredictiveAnalyticsDto
{
    public double PredictedRevenue { get; set; }
    public int PredictedBookings { get; set; }
    public string RevenueTrend { get; set; } = string.Empty;
    public string BookingsTrend { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public List<RecommendedTimeSlotDto> RecommendedTimeSlots { get; set; } = new();
    public List<string> AIRecommendations { get; set; } = new();
    public SeasonalPredictionDto SeasonalPrediction { get; set; } = new();
    public double GrowthRate { get; set; }
    public List<string> RiskFactors { get; set; } = new();
}

public class RecommendedTimeSlotDto
{
    public int Hour { get; set; }
    public int ExpectedBookings { get; set; }
    public double ExpectedRevenue { get; set; }
    public double Confidence { get; set; }
}

public class SeasonalPredictionDto
{
    public string BestDayOfWeek { get; set; } = string.Empty;
    public string WorstDayOfWeek { get; set; } = string.Empty;
    public double SeasonalFactor { get; set; }
}

public class DailyDataPoint
{
    public DateTime Date { get; set; }
    public double Revenue { get; set; }
    public int Bookings { get; set; }
    public double AverageRating { get; set; }
}

public class HourlyDataPoint
{
    public int Hour { get; set; }
    public int Bookings { get; set; }
    public double Revenue { get; set; }
} 
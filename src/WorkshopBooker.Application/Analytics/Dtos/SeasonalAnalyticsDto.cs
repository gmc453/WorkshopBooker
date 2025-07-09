namespace WorkshopBooker.Application.Analytics.Dtos;

public class SeasonalAnalyticsDto
{
    public List<DayOfWeekAnalysisDto> DayOfWeekAnalysis { get; set; } = new();
    public List<HourlyAnalysisDto> HourlyAnalysis { get; set; } = new();
    public List<MonthlyTrendDto> MonthlyTrends { get; set; } = new();
    public List<YearOverYearDto> YearOverYearComparison { get; set; } = new();
    public PeakHoursAnalysisDto PeakHoursAnalysis { get; set; } = new();
    public List<QuarterlyAnalysisDto> QuarterlyAnalysis { get; set; } = new();
    public List<string> SeasonalPatterns { get; set; } = new();
    public List<DayOfWeekAnalysisDto> BestPerformingDays { get; set; } = new();
    public List<DayOfWeekAnalysisDto> WorstPerformingDays { get; set; } = new();
    
    // Właściwości dla frontendu
    public List<DayOfWeekAnalysisDto> DayOfWeekAnalytics => DayOfWeekAnalysis;
    public List<HourlyAnalysisDto> HourlyAnalytics => HourlyAnalysis;
    public List<MonthlyTrendDto> MonthlyAnalytics => MonthlyTrends;
    public PeakHoursAnalysisDto PeakHours => PeakHoursAnalysis;
}

public class DayOfWeekAnalysisDto
{
    public string DayOfWeek { get; set; } = string.Empty;
    public int TotalBookings { get; set; }
    public double TotalRevenue { get; set; }
    public double AverageRevenue { get; set; }
    public double UtilizationRate { get; set; }
    
    // Właściwości dla frontendu
    public double PercentageOfTotal => 0; // TODO: Obliczyć
    public double AverageRating => 0; // TODO: Dodać oceny
    public string Trend => "stable"; // TODO: Obliczyć trend
    public int Rank => 0; // TODO: Obliczyć ranking
}

public class HourlyAnalysisDto
{
    public int Hour { get; set; }
    public int TotalBookings { get; set; }
    public double TotalRevenue { get; set; }
    public double AverageRevenue { get; set; }
    public bool PeakHour { get; set; }
    
    // Właściwości dla frontendu
    public string TimeSlot => $"{Hour:00}:00-{(Hour + 1):00}:00";
    public double PercentageOfTotal => 0; // TODO: Obliczyć
    public double AverageRating => 0; // TODO: Dodać oceny
    public double UtilizationRate => 0; // TODO: Obliczyć
    public string DemandLevel => PeakHour ? "high" : "low";
    public int Rank => 0; // TODO: Obliczyć ranking
}

public class MonthlyTrendDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public int TotalBookings { get; set; }
    public double TotalRevenue { get; set; }
    public double AverageRevenue { get; set; }
    
    // Właściwości dla frontendu
    public double GrowthRate => 0; // TODO: Obliczyć
    public double AverageRating => 0; // TODO: Dodać oceny
    public double UtilizationRate => 0; // TODO: Obliczyć
    public string Season => GetSeason(Month);
    public int Rank => 0; // TODO: Obliczyć ranking
    
    private string GetSeason(int month)
    {
        return month switch
        {
            12 or 1 or 2 => "Zima",
            3 or 4 or 5 => "Wiosna",
            6 or 7 or 8 => "Lato",
            9 or 10 or 11 => "Jesień",
            _ => "Nieznany"
        };
    }
}

public class YearOverYearDto
{
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public double CurrentYearRevenue { get; set; }
    public double PreviousYearRevenue { get; set; }
    public int CurrentYearBookings { get; set; }
    public int PreviousYearBookings { get; set; }
    public double RevenueGrowth { get; set; }
    public double BookingsGrowth { get; set; }
    
    // Właściwości dla frontendu
    public string Period => MonthName;
    public int CurrentYear => DateTime.UtcNow.Year;
    public int PreviousYear => DateTime.UtcNow.Year - 1;
    public double BookingGrowth => BookingsGrowth;
    public string Trend => RevenueGrowth > 5 ? "improving" : RevenueGrowth < -5 ? "declining" : "stable";
}

public class PeakHoursAnalysisDto
{
    public List<int> PeakHours { get; set; } = new();
    public List<int> OffPeakHours { get; set; } = new();
    public double AverageBookingsPerHour { get; set; }
    public double PeakHourUtilization { get; set; }
    
    // Właściwości dla frontendu
    public List<string> PeakHoursStrings => PeakHours.Select(h => h.ToString()).ToList();
    public List<string> OffPeakHoursStrings => OffPeakHours.Select(h => h.ToString()).ToList();
    public List<string> DeadHours => new List<string>(); // TODO: Obliczyć
    public double OffPeakUtilization => 0; // TODO: Obliczyć
    public double DeadHourUtilization => 0; // TODO: Obliczyć
    public string RecommendedAction => "Rozważ dodanie promocji w godzinach szczytu";
}

public class QuarterlyAnalysisDto
{
    public int Quarter { get; set; }
    public int TotalBookings { get; set; }
    public double TotalRevenue { get; set; }
    public double AverageRevenue { get; set; }
    public double GrowthRate { get; set; }
} 
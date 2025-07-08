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
}

public class DayOfWeekAnalysisDto
{
    public string DayOfWeek { get; set; } = string.Empty;
    public int TotalBookings { get; set; }
    public double TotalRevenue { get; set; }
    public double AverageRevenue { get; set; }
    public double UtilizationRate { get; set; }
}

public class HourlyAnalysisDto
{
    public int Hour { get; set; }
    public int TotalBookings { get; set; }
    public double TotalRevenue { get; set; }
    public double AverageRevenue { get; set; }
    public bool PeakHour { get; set; }
}

public class MonthlyTrendDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public int TotalBookings { get; set; }
    public double TotalRevenue { get; set; }
    public double AverageRevenue { get; set; }
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
}

public class PeakHoursAnalysisDto
{
    public List<int> PeakHours { get; set; } = new();
    public List<int> OffPeakHours { get; set; } = new();
    public double AverageBookingsPerHour { get; set; }
    public double PeakHourUtilization { get; set; }
}

public class QuarterlyAnalysisDto
{
    public int Quarter { get; set; }
    public int TotalBookings { get; set; }
    public double TotalRevenue { get; set; }
    public double AverageRevenue { get; set; }
    public double GrowthRate { get; set; }
} 
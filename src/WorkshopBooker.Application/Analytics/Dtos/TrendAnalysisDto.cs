namespace WorkshopBooker.Application.Analytics.Dtos;

public class TrendAnalysisDto
{
    public string RevenueTrend { get; set; } = string.Empty;
    public string BookingsTrend { get; set; } = string.Empty;
    public double GrowthRate { get; set; }
} 
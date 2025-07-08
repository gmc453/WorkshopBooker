namespace WorkshopBooker.Application.Analytics.Dtos;

public record GlobalAnalyticsDto
{
    public int TotalWorkshops { get; init; }
    public decimal TotalRevenue { get; init; }
    public int TotalBookings { get; init; }
    public double AverageRating { get; init; }
    public int TotalReviews { get; init; }
    public decimal RevenueGrowth { get; init; }
    public decimal BookingsGrowth { get; init; }
    
    public List<WorkshopPerformanceDto> TopWorkshops { get; init; } = new();
    public List<ServiceAnalyticsDto> TopServices { get; init; } = new();
    public List<RevenueDataPointDto> RevenueOverTime { get; init; } = new();
    public List<WorkshopComparisonDto> WorkshopComparison { get; init; } = new();
}

public record WorkshopPerformanceDto
{
    public Guid WorkshopId { get; init; }
    public string WorkshopName { get; init; } = string.Empty;
    public decimal Revenue { get; init; }
    public int Bookings { get; init; }
    public double AverageRating { get; init; }
    public decimal RevenuePerBooking { get; init; }
    public double UtilizationRate { get; init; }
}

public record WorkshopComparisonDto
{
    public Guid WorkshopId { get; init; }
    public string WorkshopName { get; init; } = string.Empty;
    public decimal CurrentMonthRevenue { get; init; }
    public decimal PreviousMonthRevenue { get; init; }
    public decimal GrowthPercentage { get; init; }
    public string PerformanceCategory { get; init; } = string.Empty; // "excellent", "good", "needs_attention"
} 
namespace WorkshopBooker.Application.Analytics.Dtos;

public record WorkshopAnalyticsDto
{
    public Guid WorkshopId { get; init; }
    public string WorkshopName { get; init; } = string.Empty;
    
    // Podstawowe KPI
    public decimal MonthlyRevenue { get; init; }
    public int MonthlyBookings { get; init; }
    public double AverageRating { get; init; }
    public int TotalReviews { get; init; }
    public double AverageServiceTime { get; init; } // w godzinach
    
    // Trendy
    public decimal RevenueGrowth { get; init; } // procent wzrostu
    public int BookingsGrowth { get; init; } // procent wzrostu
    
    // Rozkład usług
    public List<ServiceAnalyticsDto> ServiceDistribution { get; init; } = new();
    
    // Popularne godziny
    public List<TimeSlotAnalyticsDto> PopularTimeSlots { get; init; } = new();
    
    // Przychody w czasie
    public List<RevenueDataPointDto> RevenueOverTime { get; init; } = new();
}

public record ServiceAnalyticsDto
{
    public Guid ServiceId { get; init; }
    public string ServiceName { get; init; } = string.Empty;
    public int BookingCount { get; init; }
    public decimal TotalRevenue { get; init; }
    public double Percentage { get; init; }
    public double AverageRating { get; init; }
}

public record TimeSlotAnalyticsDto
{
    public string TimeSlot { get; init; } = string.Empty; // np. "08:00-10:00"
    public int BookingCount { get; init; }
    public double UtilizationRate { get; init; } // procent wykorzystania
}

public record RevenueDataPointDto
{
    public DateTime Date { get; init; }
    public decimal Revenue { get; init; }
    public int Bookings { get; init; }
}

public record AnalyticsRequest
{
    public Guid WorkshopId { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public string GroupBy { get; init; } = "day"; // day, week, month
} 
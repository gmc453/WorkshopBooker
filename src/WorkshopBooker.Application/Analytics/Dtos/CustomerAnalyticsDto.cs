namespace WorkshopBooker.Application.Analytics.Dtos;

public class CustomerAnalyticsDto
{
    public int TotalCustomers { get; set; }
    public int NewCustomers { get; set; }
    public int ReturningCustomers { get; set; }
    public double AverageLTV { get; set; }
    public double AverageCustomerValue { get; set; }
    public double CustomerLifetimeValue { get; set; }
    public double RetentionRate { get; set; }
    public List<TopCustomerDto> TopCustomers { get; set; } = new();
    public List<CustomerSegmentDto> CustomerSegments { get; set; } = new();
    public object[] SegmentChartData { get; set; } = new object[0];
    public double CustomerGrowth { get; set; }
}

public class TopCustomerDto
{
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public int BookingCount { get; set; }
    public int TotalBookings { get; set; }
    public double TotalSpent { get; set; }
    public DateTime LastVisit { get; set; }
    public string FirstBooking { get; set; } = string.Empty;
    public string LastBooking { get; set; } = string.Empty;
    public string CustomerType { get; set; } = string.Empty;
    public double AverageRating { get; set; }
}

public class CustomerSegmentDto
{
    public string SegmentName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CustomerCount { get; set; }
    public double TotalRevenue { get; set; }
    public double AverageRating { get; set; }
    public double AverageOrderValue { get; set; }
    public string Color { get; set; } = string.Empty;
}

public class CustomerSegmentsDto
{
    public int HighValue { get; set; }
    public int MediumValue { get; set; }
    public int LowValue { get; set; }
    public int Frequent { get; set; }
    public int Occasional { get; set; }
    public int OneTime { get; set; }
}

 
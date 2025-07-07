namespace WorkshopBooker.Application.Reviews.Dtos;

public record ReviewDto
{
    public Guid Id { get; init; }
    public Guid BookingId { get; init; }
    public Guid WorkshopId { get; init; }
    public Guid UserId { get; init; }
    public int Rating { get; init; }
    public string? Comment { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public bool IsVerified { get; init; }
    public string UserName { get; init; } = string.Empty;
    public string UserEmail { get; init; } = string.Empty;
}

public record CreateReviewRequest
{
    public Guid BookingId { get; init; }
    public Guid WorkshopId { get; init; }
    public int Rating { get; init; }
    public string? Comment { get; init; }
}

public record UpdateReviewRequest
{
    public Guid ReviewId { get; init; }
    public int Rating { get; init; }
    public string? Comment { get; init; }
}

public record WorkshopReviewsDto
{
    public Guid WorkshopId { get; init; }
    public double AverageRating { get; init; }
    public int TotalReviews { get; init; }
    public List<ReviewDto> Reviews { get; init; } = new();
    public Dictionary<int, int> RatingDistribution { get; init; } = new(); // rating -> count
} 
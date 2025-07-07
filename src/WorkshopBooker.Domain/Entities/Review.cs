namespace WorkshopBooker.Domain.Entities;

public class Review
{
    public Guid Id { get; private set; }
    public Guid BookingId { get; private set; }
    public Guid WorkshopId { get; private set; }
    public Guid UserId { get; private set; }
    public int Rating { get; private set; } // 1-5 stars
    public string? Comment { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public bool IsVerified { get; private set; }

    // Navigation properties
    public Booking Booking { get; private set; } = null!;
    public Workshop Workshop { get; private set; } = null!;
    public User User { get; private set; } = null!;

    private Review() { }

    public Review(Guid bookingId, Guid workshopId, Guid userId, int rating, string? comment = null)
    {
        Id = Guid.NewGuid();
        BookingId = bookingId;
        WorkshopId = workshopId;
        UserId = userId;
        SetRating(rating);
        Comment = comment;
        CreatedAt = DateTime.UtcNow;
        IsVerified = false;
    }

    public void UpdateReview(int rating, string? comment)
    {
        SetRating(rating);
        Comment = comment;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Verify()
    {
        IsVerified = true;
    }

    private void SetRating(int rating)
    {
        if (rating < 1 || rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5");

        Rating = rating;
    }
} 
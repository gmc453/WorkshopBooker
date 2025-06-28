// src/WorkshopBooker.Domain/Entities/Booking.cs
namespace WorkshopBooker.Domain.Entities;

// Enum do określania statusu rezerwacji
public enum BookingStatus
{
    Requested,
    Confirmed,
    Completed,
    Canceled
}

public class Booking
{
    public Guid Id { get; private set; }

    // Data i godzina, na którą umówiono wizytę
    public DateTime BookingDateTime { get; private set; }

    public BookingStatus Status { get; private set; }

    // --- Relacje ---

    // Na razie zakładamy, że rezerwacja jest na jedną, konkretną usługę
    public Guid ServiceId { get; private set; }
    public Service Service { get; private set; } = null!;

    // TODO: W przyszłości dodamy tu relację do Użytkownika
    // public Guid UserId { get; private set; }
    // public User User { get; private set; } = null!;

    // Daty audytowe
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private Booking() {}

    public Booking(Guid id, DateTime bookingDateTime, Guid serviceId)
    {
        Id = id;
        BookingDateTime = bookingDateTime;
        ServiceId = serviceId;
        Status = BookingStatus.Requested;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Confirm()
    {
        Status = BookingStatus.Confirmed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        Status = BookingStatus.Canceled;
        UpdatedAt = DateTime.UtcNow;
    }
}

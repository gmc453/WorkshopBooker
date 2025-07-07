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

    public BookingStatus Status { get; private set; }

    // --- Dane klienta ---
    public string? CustomerName { get; private set; }
    public string? CustomerEmail { get; private set; }
    public string? CustomerPhone { get; private set; }
    public string? CarBrand { get; private set; }
    public string? CarModel { get; private set; }
    public string? Notes { get; private set; }

    // --- Relacje ---

    // Na razie zakładamy, że rezerwacja jest na jedną, konkretną usługę
    public Guid ServiceId { get; private set; }
    public Service Service { get; private set; } = null!;

    // Informacja o tym, który użytkownik dokonał rezerwacji
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;

    // Relacja 1-1 do slotu
    public Guid SlotId { get; private set; }
    public AvailableSlot Slot { get; private set; } = null!;

    // Daty audytowe
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private Booking() { }

    public Booking(Guid id, Guid slotId, Guid serviceId, Guid userId, string? customerName = null, string? customerEmail = null, string? customerPhone = null, string? carBrand = null, string? carModel = null, string? notes = null)
    {
        Id = id;
        SlotId = slotId;
        ServiceId = serviceId;
        UserId = userId;
        CustomerName = customerName;
        CustomerEmail = customerEmail;
        CustomerPhone = customerPhone;
        CarBrand = carBrand;
        CarModel = carModel;
        Notes = notes;
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

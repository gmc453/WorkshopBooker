using WorkshopBooker.Application.Slots.Dtos;

namespace WorkshopBooker.Application.Common.Interfaces;

public interface IConflictResolutionService
{
    Task<List<AlternativeSlot>> SuggestAlternatives(Guid workshopId, DateTime requestedTime, int durationMinutes);
    Task<bool> IsSlotAvailable(Guid slotId);
    Task<List<AvailableSlotDto>> FindAvailableSlots(Guid workshopId, DateTime startDate, DateTime endDate);
}

public record AlternativeSlot
{
    public Guid SlotId { get; init; }
    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }
    public string ServiceName { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public int TimeDifferenceMinutes { get; init; } // Różnica od żądanego terminu
    public string Reason { get; init; } = string.Empty; // Powód sugerowania (np. "Najbliższy dostępny termin")
} 
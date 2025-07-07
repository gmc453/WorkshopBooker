using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Slots.Dtos;

public record AvailableSlotDto
{
    public Guid Id { get; init; }
    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }
    public SlotStatus Status { get; init; }
    public Guid WorkshopId { get; init; }
    public bool IsAvailable { get; init; }
}

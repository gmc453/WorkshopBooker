using WorkshopBooker.Domain.Entities;
using WorkshopBooker.Application.Services.Dtos;

namespace WorkshopBooker.Application.Bookings.Dtos;

public record BookingDto
{
    public Guid Id { get; init; }
    public DateTime SlotStartTime { get; init; }
    public DateTime SlotEndTime { get; init; }
    public BookingStatus Status { get; init; }
    public Guid ServiceId { get; init; }
    public required string ServiceName { get; init; }
    public decimal ServicePrice { get; init; }
    public string? UserName { get; init; }
    public string? WorkshopId { get; init; }
    public string? WorkshopName { get; init; }
}

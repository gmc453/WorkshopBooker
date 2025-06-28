using WorkshopBooker.Domain.Entities;
using WorkshopBooker.Application.Services.Dtos;

namespace WorkshopBooker.Application.Bookings.Dtos;

public record BookingDto
{
    public Guid Id { get; init; }
    public DateTime BookingDateTime { get; init; }
    public BookingStatus Status { get; init; }
    public Guid ServiceId { get; init; }
    public required string ServiceName { get; init; }
    public decimal ServicePrice { get; init; }
}

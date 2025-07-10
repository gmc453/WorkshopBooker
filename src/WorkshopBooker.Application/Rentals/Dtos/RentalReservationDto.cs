using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Rentals.Dtos;

public record RentalReservationDto
{
    public Guid Id { get; init; }
    public Guid VehicleId { get; init; }
    public Guid UserId { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public ReservationStatus Status { get; init; }
}

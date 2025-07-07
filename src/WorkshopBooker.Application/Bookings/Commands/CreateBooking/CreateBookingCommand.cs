using MediatR;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Bookings.Commands.CreateBooking;

/// <summary>
/// Command used to create a new booking for a service.
/// </summary>
/// <param name="ServiceId">Identifier of the service that is being booked.</param>
/// <param name="SlotId">Identifier of the slot being booked.</param>
/// <param name="Notes">Optional notes for the booking.</param>
public record CreateBookingCommand(Guid ServiceId, Guid SlotId, string? Notes = null) : IRequest<Result<Guid>>;

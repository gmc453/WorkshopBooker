using MediatR;

namespace WorkshopBooker.Application.Bookings.Commands.CreateBooking;

/// <summary>
/// Command used to create a new booking for a service.
/// </summary>
/// <param name="ServiceId">Identifier of the service that is being booked.</param>
/// <param name="BookingDateTime">Date and time of the desired booking.</param>
public record CreateBookingCommand(Guid ServiceId, DateTime BookingDateTime) : IRequest<Guid>;

using MediatR;

namespace WorkshopBooker.Application.Bookings.Commands.CancelBooking;

public record CancelBookingCommand(Guid BookingId) : IRequest; 
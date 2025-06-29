using MediatR;

namespace WorkshopBooker.Application.Bookings.Commands.ConfirmBooking;

public record ConfirmBookingCommand(Guid BookingId) : IRequest; 
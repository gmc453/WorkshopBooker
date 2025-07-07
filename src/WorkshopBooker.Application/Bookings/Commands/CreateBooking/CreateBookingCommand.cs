using MediatR;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Bookings.Commands.CreateBooking;

/// <summary>
/// Command used to create a new booking for a service.
/// </summary>
/// <param name="ServiceId">Identifier of the service that is being booked.</param>
/// <param name="SlotId">Identifier of the slot being booked.</param>
/// <param name="Notes">Optional notes for the booking.</param>
/// <param name="CustomerName">Customer name for the booking.</param>
/// <param name="CustomerEmail">Customer email for the booking.</param>
/// <param name="CustomerPhone">Customer phone for the booking.</param>
/// <param name="CarBrand">Customer car brand.</param>
/// <param name="CarModel">Customer car model.</param>
public record CreateBookingCommand(
    Guid ServiceId, 
    Guid SlotId, 
    string? Notes = null,
    string? CustomerName = null,
    string? CustomerEmail = null,
    string? CustomerPhone = null,
    string? CarBrand = null,
    string? CarModel = null
) : IRequest<Result<Guid>>;

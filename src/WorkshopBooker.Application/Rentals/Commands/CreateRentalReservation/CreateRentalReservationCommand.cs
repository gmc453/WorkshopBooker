using MediatR;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Rentals.Commands.CreateRentalReservation;

public record CreateRentalReservationCommand(
    Guid VehicleId,
    DateTime StartDate,
    DateTime EndDate
) : IRequest<Result<Guid>>;

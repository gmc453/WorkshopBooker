using MediatR;

namespace WorkshopBooker.Application.Rentals.Commands.CreateVehicle;

public record CreateVehicleCommand(
    string Make,
    string Model,
    string LicensePlate,
    int Year,
    string? Location = null
) : IRequest<Guid>;

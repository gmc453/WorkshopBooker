using MediatR;

namespace WorkshopBooker.Application.Rentals.Commands.UpdateVehicleLocation;

public record UpdateVehicleLocationCommand(Guid VehicleId, string? Location) : IRequest;

using MediatR;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Rentals.Commands.CreateVehicle;

public class CreateVehicleCommandHandler : IRequestHandler<CreateVehicleCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ILocationService _locationService;

    public CreateVehicleCommandHandler(IApplicationDbContext context, ILocationService locationService)
    {
        _context = context;
        _locationService = locationService;
    }

    public async Task<Guid> Handle(CreateVehicleCommand request, CancellationToken cancellationToken)
    {
        var vehicle = new Vehicle(Guid.NewGuid(), request.Make, request.Model, request.LicensePlate, request.Year, request.Location);

        if (!string.IsNullOrWhiteSpace(request.Location))
        {
            vehicle.UpdateLocation(await _locationService.GetLocationAsync(request.Location, cancellationToken));
        }

        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync(cancellationToken);

        return vehicle.Id;
    }
}

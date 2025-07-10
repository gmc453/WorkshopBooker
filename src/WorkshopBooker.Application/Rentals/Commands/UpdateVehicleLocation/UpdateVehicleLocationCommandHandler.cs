using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Rentals.Commands.UpdateVehicleLocation;

public class UpdateVehicleLocationCommandHandler : IRequestHandler<UpdateVehicleLocationCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ILocationService _locationService;

    public UpdateVehicleLocationCommandHandler(IApplicationDbContext context, ILocationService locationService)
    {
        _context = context;
        _locationService = locationService;
    }

    public async Task Handle(UpdateVehicleLocationCommand request, CancellationToken cancellationToken)
    {
        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == request.VehicleId, cancellationToken);
        if (vehicle == null)
        {
            return;
        }

        var location = request.Location != null ? await _locationService.GetLocationAsync(request.Location, cancellationToken) : null;
        vehicle.UpdateLocation(location);

        await _context.SaveChangesAsync(cancellationToken);
    }
}

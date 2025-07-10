using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Rentals.Dtos;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Rentals.Queries.GetAvailableVehicles;

public class GetAvailableVehiclesQueryHandler : IRequestHandler<GetAvailableVehiclesQuery, List<VehicleDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAvailableVehiclesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<VehicleDto>> Handle(GetAvailableVehiclesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Vehicles
            .Where(v => v.Status == VehicleStatus.Available)
            .Select(v => new VehicleDto
            {
                Id = v.Id,
                Make = v.Make,
                Model = v.Model,
                LicensePlate = v.LicensePlate,
                Year = v.Year,
                IsAvailable = true,
                CurrentLocation = v.CurrentLocation
            })
            .ToListAsync(cancellationToken);
    }
}

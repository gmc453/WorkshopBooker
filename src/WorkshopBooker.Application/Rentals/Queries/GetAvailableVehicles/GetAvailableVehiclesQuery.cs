using MediatR;
using WorkshopBooker.Application.Rentals.Dtos;

namespace WorkshopBooker.Application.Rentals.Queries.GetAvailableVehicles;

public record GetAvailableVehiclesQuery : IRequest<List<VehicleDto>>;

// src/WorkshopBooker.Application/Services/Queries/GetServices/GetServicesQueryHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Services.Dtos;

namespace WorkshopBooker.Application.Services.Queries.GetServices;

public class GetServicesQueryHandler : IRequestHandler<GetServicesQuery, List<ServiceDto>>
{
    private readonly IApplicationDbContext _context;

    public GetServicesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ServiceDto>> Handle(GetServicesQuery request, CancellationToken cancellationToken)
    {
        var services = await _context.Services
            .Where(s => s.WorkshopId == request.WorkshopId && s.IsActive)
            .OrderByDescending(s => s.IsPopular)
            .ThenBy(s => s.Name)
            .Select(s => new ServiceDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Price = s.Price,
                DurationInMinutes = s.DurationInMinutes,
                Category = s.Category,
                IsPopular = s.IsPopular,
                IsActive = s.IsActive,
                RequiredEquipment = s.RequiredEquipment,
                PreparationInstructions = s.PreparationInstructions
            })
            .ToListAsync(cancellationToken);

        return services;
    }
}

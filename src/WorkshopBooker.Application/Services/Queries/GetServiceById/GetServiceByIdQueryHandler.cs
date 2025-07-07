// src/WorkshopBooker.Application/Services/Queries/GetServiceById/GetServiceByIdQueryHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Services.Dtos;

namespace WorkshopBooker.Application.Services.Queries.GetServiceById;

public class GetServiceByIdQueryHandler : IRequestHandler<GetServiceByIdQuery, ServiceDto?>
{
    private readonly IApplicationDbContext _context;

    public GetServiceByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceDto?> Handle(GetServiceByIdQuery request, CancellationToken cancellationToken)
    {
        var service = await _context.Services
            .Where(s => s.Id == request.Id && s.WorkshopId == request.WorkshopId && s.IsActive)
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
            .FirstOrDefaultAsync(cancellationToken);

        return service;
    }
}

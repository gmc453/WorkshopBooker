// src/WorkshopBooker.Application/Workshops/Queries/GetWorkshopById/GetWorkshopByIdQueryHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Workshops.Dtos;

namespace WorkshopBooker.Application.Workshops.Queries.GetWorkshopById;

public class GetWorkshopByIdQueryHandler : IRequestHandler<GetWorkshopByIdQuery, WorkshopDto?>
{
    private readonly IApplicationDbContext _context;

    public GetWorkshopByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WorkshopDto?> Handle(GetWorkshopByIdQuery request, CancellationToken cancellationToken)
    {
        var workshop = await _context.Workshops
            .Where(w => w.Id == request.Id) // Filtrujemy po ID z zapytania
            .Select(w => new WorkshopDto // Mapujemy na DTO
            {
                Id = w.Id,
                Name = w.Name,
                Description = w.Description,
                Address = w.Address
            })
            .FirstOrDefaultAsync(cancellationToken); // Pobieramy pierwszy pasujący element lub null

        return workshop;
    }
}
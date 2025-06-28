// src/WorkshopBooker.Application/Workshops/Queries/GetWorkshops/GetWorkshopsQueryHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Workshops.Dtos;

namespace WorkshopBooker.Application.Workshops.Queries.GetWorkshops;

public class GetWorkshopsQueryHandler : IRequestHandler<GetWorkshopsQuery, List<WorkshopDto>>
{
    private readonly IApplicationDbContext _context;

    public GetWorkshopsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<WorkshopDto>> Handle(GetWorkshopsQuery request, CancellationToken cancellationToken)
    {
        // Używamy LINQ do pobrania danych z bazy.
        var workshops = await _context.Workshops
            // Metoda .Select() jest bardzo wydajna. Tłumaczy wyrażenie lambda na zapytanie SQL,
            // dzięki czemu z bazy danych pobierane są tylko te kolumny, których potrzebujemy w DTO.
            .Select(w => new WorkshopDto
            {
                Id = w.Id,
                Name = w.Name,
                Description = w.Description,
                Address = w.Address
            })
            .ToListAsync(cancellationToken);

        return workshops;
    }
}
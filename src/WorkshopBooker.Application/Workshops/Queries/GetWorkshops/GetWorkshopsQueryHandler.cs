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
        var query = _context.Workshops.AsQueryable();
        
        // Filtrujemy po SearchTerm, jeśli został podany
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            // ✅ POPRAWKA: Używamy Contains dla case-insensitive search (EF Core automatycznie tłumaczy na ILIKE w PostgreSQL)
            var searchTerm = request.SearchTerm.ToLowerInvariant();
            query = query.Where(w => 
                w.Name.ToLower().Contains(searchTerm) || 
                w.Description.ToLower().Contains(searchTerm) ||
                (w.Address != null && w.Address.ToLower().Contains(searchTerm))
            );
        }
        
        var workshops = await query
            // Metoda .Select() jest bardzo wydajna. Tłumaczy wyrażenie lambda na zapytanie SQL,
            // dzięki czemu z bazy danych pobierane są tylko te kolumny, których potrzebujemy w DTO.
            .Select(w => new WorkshopDto
            {
                Id = w.Id,
                Name = w.Name,
                Description = w.Description,
                Address = w.Address,
                PhoneNumber = w.PhoneNumber,
                Email = w.Email,
                IsActive = w.IsActive
            })
            .ToListAsync(cancellationToken);

        return workshops;
    }
}
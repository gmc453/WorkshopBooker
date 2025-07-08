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
            // ✅ POPRAWKA: Używamy EF.Functions.ILike dla case-insensitive search w bazie danych
            var searchTerm = request.SearchTerm;
            query = query.Where(w => 
                EF.Functions.ILike(w.Name, $"%{searchTerm}%") || 
                EF.Functions.ILike(w.Description, $"%{searchTerm}%") ||
                (w.Address != null && EF.Functions.ILike(w.Address, $"%{searchTerm}%"))
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
                Address = w.Address
            })
            .ToListAsync(cancellationToken);

        return workshops;
    }
}
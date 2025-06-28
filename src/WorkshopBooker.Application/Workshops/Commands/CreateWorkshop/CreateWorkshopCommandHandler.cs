// src/WorkshopBooker.Application/Workshops/Commands/CreateWorkshop/CreateWorkshopCommandHandler.cs
using MediatR;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Workshops.Commands.CreateWorkshop;

public class CreateWorkshopCommandHandler : IRequestHandler<CreateWorkshopCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    // Wstrzykujemy interfejs, a nie konkretną implementację. Czysta Architektura w praktyce!
    public CreateWorkshopCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateWorkshopCommand request, CancellationToken cancellationToken)
    {
        // 1. Stwórz nową encję na podstawie danych z komendy
        var workshop = new Workshop(
            Guid.NewGuid(), // Generujemy nowe ID
            request.Name,
            request.Description);

        // Możemy tu dodać logikę aktualizacji opcjonalnych pól, np. przez osobną metodę
        // workshop.UpdateDetails(request.PhoneNumber, ...);

        // 2. Dodaj encję do kontekstu bazy danych
        _context.Workshops.Add(workshop);

        // 3. Zapisz zmiany w bazie danych
        await _context.SaveChangesAsync(cancellationToken);

        // 4. Zwróć ID nowo utworzonego warsztatu
        return workshop.Id;
    }
}
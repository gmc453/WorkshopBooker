using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;

namespace WorkshopBooker.Application.Workshops.Commands.DeleteWorkshop;

public class DeleteWorkshopCommandHandler : IRequestHandler<DeleteWorkshopCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public DeleteWorkshopCommandHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task Handle(DeleteWorkshopCommand request, CancellationToken cancellationToken)
    {
        // Sprawdź czy użytkownik jest zalogowany
        if (_currentUserProvider.UserId is null)
        {
            throw new UnauthenticatedUserException();
        }

        var workshop = await _context.Workshops
            .FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken);

        // ✅ POPRAWKA: DELETE jest idempotentny - jeśli nie istnieje, kończymy bez błędu
        if (workshop is null)
        {
            return; // Idempotent - nie rzucamy wyjątku
        }

        // Sprawdź autoryzację - tylko właściciel może usunąć warsztat
        if (workshop.UserId != _currentUserProvider.UserId)
        {
            throw new WorkshopBooker.Application.Common.Exceptions.UnauthorizedAccessException("Brak uprawnień do usunięcia tego warsztatu");
        }

        _context.Workshops.Remove(workshop);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
// src/WorkshopBooker.Application/Services/Commands/DeleteService/DeleteServiceCommandHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;

namespace WorkshopBooker.Application.Services.Commands.DeleteService;

public class DeleteServiceCommandHandler : IRequestHandler<DeleteServiceCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public DeleteServiceCommandHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task Handle(DeleteServiceCommand request, CancellationToken cancellationToken)
    {
        // Sprawdź czy użytkownik jest zalogowany
        if (_currentUserProvider.UserId is null)
        {
            throw new UnauthenticatedUserException();
        }

        var service = await _context.Services
            .Include(s => s.Workshop)
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.WorkshopId == request.WorkshopId, cancellationToken);

        // ✅ POPRAWKA: DELETE jest idempotentny - jeśli nie istnieje, kończymy bez błędu
        if (service is null)
        {
            return; // Idempotent - nie rzucamy wyjątku
        }

        // Sprawdź autoryzację - tylko właściciel warsztatu może usunąć usługi
        if (service.Workshop.UserId != _currentUserProvider.UserId)
        {
            throw new WorkshopBooker.Application.Common.Exceptions.UnauthorizedAccessException("Brak uprawnień do usunięcia tej usługi");
        }

        _context.Services.Remove(service);
        await _context.SaveChangesAsync(cancellationToken);
    }
}

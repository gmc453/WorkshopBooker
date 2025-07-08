// src/WorkshopBooker.Application/Workshops/Commands/UpdateWorkshop/UpdateWorkshopCommandHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;

namespace WorkshopBooker.Application.Workshops.Commands.UpdateWorkshop;

public class UpdateWorkshopCommandHandler : IRequestHandler<UpdateWorkshopCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public UpdateWorkshopCommandHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task Handle(UpdateWorkshopCommand request, CancellationToken cancellationToken)
    {
        // Sprawdź czy użytkownik jest zalogowany
        if (_currentUserProvider.UserId is null)
        {
            throw new UnauthenticatedUserException();
        }

        // 1. Znajdź istniejącą encję w bazie danych
        var workshop = await _context.Workshops
            .FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken);

        // 2. Jeśli nie istnieje, rzuć wyjątek (kontroler zamieni go na 404)
        if (workshop is null)
        {
            throw new WorkshopNotFoundException();
        }

        // 3. Sprawdź autoryzację - tylko właściciel może edytować warsztat
        if (workshop.UserId != _currentUserProvider.UserId)
        {
            throw new WorkshopBooker.Application.Common.Exceptions.UnauthorizedAccessException("Brak uprawnień do edycji tego warsztatu");
        }

        // 4. Wywołaj metodę na encji, aby zaktualizować jej stan
        workshop.Update(
            request.Name,
            request.Description,
            request.PhoneNumber,
            request.Email,
            request.Address);

        // 5. Zapisz zmiany w bazie
        await _context.SaveChangesAsync(cancellationToken);
    }
}
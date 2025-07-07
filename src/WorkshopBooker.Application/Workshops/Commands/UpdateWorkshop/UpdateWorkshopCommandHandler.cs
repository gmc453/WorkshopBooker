// src/WorkshopBooker.Application/Workshops/Commands/UpdateWorkshop/UpdateWorkshopCommandHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;

namespace WorkshopBooker.Application.Workshops.Commands.UpdateWorkshop;

public class UpdateWorkshopCommandHandler : IRequestHandler<UpdateWorkshopCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateWorkshopCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateWorkshopCommand request, CancellationToken cancellationToken)
    {
        // 1. Znajdź istniejącą encję w bazie danych
        var workshop = await _context.Workshops
            .FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken);

        // 2. Jeśli nie istnieje, rzuć wyjątek (kontroler zamieni go na 404)
        if (workshop is null)
        {
            throw new WorkshopNotFoundException();
        }

        // 3. Wywołaj metodę na encji, aby zaktualizować jej stan
        workshop.Update(
            request.Name,
            request.Description,
            request.PhoneNumber,
            request.Email,
            request.Address);

        // 4. Zapisz zmiany w bazie
        await _context.SaveChangesAsync(cancellationToken);
    }
}
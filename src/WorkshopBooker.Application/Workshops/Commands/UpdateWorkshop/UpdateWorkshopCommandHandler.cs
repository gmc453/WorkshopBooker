// src/WorkshopBooker.Application/Workshops/Commands/UpdateWorkshop/UpdateWorkshopCommandHandler.cs
using MediatR;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Workshops.Commands.UpdateWorkshop;

public class UpdateWorkshopCommandHandler : BaseCommandHandler, IRequestHandler<UpdateWorkshopCommand>
{
    public UpdateWorkshopCommandHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
        : base(context, currentUserProvider)
    {
    }

    public async Task Handle(UpdateWorkshopCommand request, CancellationToken cancellationToken)
    {
        // Sprawdź czy użytkownik jest właścicielem warsztatu
        var workshop = await EnsureUserOwnsWorkshopAsync(request.Id, cancellationToken);

        // Wywołaj metodę na encji, aby zaktualizować jej stan
        workshop.Update(
            request.Name,
            request.Description,
            request.PhoneNumber,
            request.Email,
            request.Address);

        // Zapisz zmiany w bazie
        await _context.SaveChangesAsync(cancellationToken);
    }
}
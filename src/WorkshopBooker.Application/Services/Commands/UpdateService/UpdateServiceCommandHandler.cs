// src/WorkshopBooker.Application/Services/Commands/UpdateService/UpdateServiceCommandHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Services.Commands.UpdateService;

public class UpdateServiceCommandHandler : IRequestHandler<UpdateServiceCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public UpdateServiceCommandHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task Handle(UpdateServiceCommand request, CancellationToken cancellationToken)
    {
        // Sprawdź czy użytkownik jest zalogowany
        if (_currentUserProvider.UserId is null)
        {
            throw new UnauthenticatedUserException();
        }

        var service = await _context.Services
            .Include(s => s.Workshop)
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.WorkshopId == request.WorkshopId, cancellationToken);

        if (service is null)
        {
            throw new ServiceNotFoundException();
        }

        // Sprawdź autoryzację - tylko właściciel warsztatu może edytować usługi
        if (service.Workshop.UserId != _currentUserProvider.UserId)
        {
            throw new WorkshopBooker.Application.Common.Exceptions.UnauthorizedAccessException("Brak uprawnień do edycji tej usługi");
        }

        service.Update(request.Name, request.Description, request.Price, request.DurationInMinutes, ServiceCategory.Other);
        await _context.SaveChangesAsync(cancellationToken);
    }
}

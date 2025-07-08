// src/WorkshopBooker.Application/Services/Commands/CreateService/CreateServiceCommandHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Services.Commands.CreateService;

public class CreateServiceCommandHandler : IRequestHandler<CreateServiceCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public CreateServiceCommandHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<Guid> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
    {
        // Sprawdź czy użytkownik jest zalogowany
        if (_currentUserProvider.UserId is null)
        {
            throw new UnauthenticatedUserException();
        }

        // Sprawdź czy warsztat istnieje i czy użytkownik jest jego właścicielem
        var workshop = await _context.Workshops
            .FirstOrDefaultAsync(w => w.Id == request.WorkshopId, cancellationToken);

        if (workshop is null)
        {
            throw new WorkshopNotFoundException();
        }

        if (workshop.UserId != _currentUserProvider.UserId)
        {
            throw new WorkshopBooker.Application.Common.Exceptions.UnauthorizedAccessException("Brak uprawnień do dodawania usług do tego warsztatu");
        }

        var service = new Service(Guid.NewGuid(), request.Name, request.Price, request.DurationInMinutes, request.WorkshopId, ServiceCategory.Other, request.Description);

        _context.Services.Add(service);
        await _context.SaveChangesAsync(cancellationToken);

        return service.Id;
    }
}

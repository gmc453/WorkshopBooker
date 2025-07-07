// src/WorkshopBooker.Application/Services/Commands/CreateService/CreateServiceCommandHandler.cs
using MediatR;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Services.Commands.CreateService;

public class CreateServiceCommandHandler : IRequestHandler<CreateServiceCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateServiceCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
    {
        var service = new Service(Guid.NewGuid(), request.Name, request.Price, request.DurationInMinutes, request.WorkshopId, ServiceCategory.Other, request.Description);

        _context.Services.Add(service);
        await _context.SaveChangesAsync(cancellationToken);

        return service.Id;
    }
}

// src/WorkshopBooker.Application/Services/Commands/UpdateService/UpdateServiceCommandHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Application.Services.Commands.UpdateService;

public class UpdateServiceCommandHandler : IRequestHandler<UpdateServiceCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateServiceCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.WorkshopId == request.WorkshopId, cancellationToken);

        if (service is null)
        {
            throw new Exception("Service not found");
        }

        service.Update(request.Name, request.Description, request.Price, request.DurationInMinutes);
        await _context.SaveChangesAsync(cancellationToken);
    }
}

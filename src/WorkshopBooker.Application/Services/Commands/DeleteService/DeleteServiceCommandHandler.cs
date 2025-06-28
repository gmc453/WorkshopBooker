// src/WorkshopBooker.Application/Services/Commands/DeleteService/DeleteServiceCommandHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Application.Services.Commands.DeleteService;

public class DeleteServiceCommandHandler : IRequestHandler<DeleteServiceCommand>
{
    private readonly IApplicationDbContext _context;
    public DeleteServiceCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task Handle(DeleteServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.WorkshopId == request.WorkshopId, cancellationToken);

        if (service is not null)
        {
            _context.Services.Remove(service);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

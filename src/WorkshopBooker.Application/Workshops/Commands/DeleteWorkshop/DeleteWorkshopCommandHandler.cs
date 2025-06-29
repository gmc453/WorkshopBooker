using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Application.Workshops.Commands.DeleteWorkshop;

public class DeleteWorkshopCommandHandler : IRequestHandler<DeleteWorkshopCommand>
{
    private readonly IApplicationDbContext _context;
    public DeleteWorkshopCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task Handle(DeleteWorkshopCommand request, CancellationToken cancellationToken)
    {
        var workshop = await _context.Workshops
            .FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken);

        if (workshop is not null)
        {
            _context.Workshops.Remove(workshop);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
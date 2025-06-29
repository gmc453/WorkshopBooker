using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Application.Slots.Commands.DeleteSlot;

public class DeleteSlotCommandHandler : IRequestHandler<DeleteSlotCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public DeleteSlotCommandHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task Handle(DeleteSlotCommand request, CancellationToken cancellationToken)
    {
        var slot = await _context.AvailableSlots
            .Include(s => s.Workshop)
            .FirstOrDefaultAsync(s => s.Id == request.SlotId, cancellationToken);
        if (slot is null)
        {
            throw new Exception("Slot not found");
        }

        if (slot.Status == Domain.Entities.SlotStatus.Booked)
        {
            throw new Exception("Cannot delete booked slot");
        }

        var currentUser = _currentUserProvider.UserId;
        if (currentUser == null || slot.Workshop.UserId != currentUser)
        {
            throw new UnauthorizedAccessException();
        }

        _context.AvailableSlots.Remove(slot);
        await _context.SaveChangesAsync(cancellationToken);
    }
}

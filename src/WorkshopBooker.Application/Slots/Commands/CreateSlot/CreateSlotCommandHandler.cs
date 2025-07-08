using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Slots.Commands.CreateSlot;

public class CreateSlotCommandHandler : IRequestHandler<CreateSlotCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public CreateSlotCommandHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<Guid> Handle(CreateSlotCommand request, CancellationToken cancellationToken)
    {
        var workshop = await _context.Workshops.FirstOrDefaultAsync(w => w.Id == request.WorkshopId, cancellationToken);
        if (workshop is null)
        {
            throw new WorkshopNotFoundException();
        }

        var currentUser = _currentUserProvider.UserId;
        if (currentUser == null || workshop.UserId != currentUser)
        {
            throw new WorkshopBooker.Application.Common.Exceptions.UnauthorizedAccessException();
        }

        bool overlaps = await _context.AvailableSlots.AnyAsync(s => s.WorkshopId == request.WorkshopId &&
            request.StartTime < s.EndTime && request.EndTime > s.StartTime, cancellationToken);
        if (overlaps)
        {
            throw new SlotOverlapException();
        }

        var slot = new AvailableSlot(Guid.NewGuid(), request.StartTime, request.EndTime, request.WorkshopId);
        _context.AvailableSlots.Add(slot);
        await _context.SaveChangesAsync(cancellationToken);
        return slot.Id;
    }
}

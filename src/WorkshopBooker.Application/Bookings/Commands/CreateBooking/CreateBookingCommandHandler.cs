using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Bookings.Commands.CreateBooking;

public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;
    public CreateBookingCommandHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<Guid> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var service = await _context.Services
            .Include(s => s.Workshop)
            .FirstOrDefaultAsync(s => s.Id == request.ServiceId, cancellationToken);
        if (service is null)
        {
            throw new Exception("Service not found");
        }

        var slot = await _context.AvailableSlots
            .FirstOrDefaultAsync(s => s.Id == request.SlotId, cancellationToken);
        if (slot is null || slot.Status != SlotStatus.Available)
        {
            throw new Exception("Slot not available");
        }

        if (slot.WorkshopId != service.WorkshopId)
        {
            throw new Exception("Slot does not belong to service's workshop");
        }

        var userId = _currentUserProvider.UserId;
        if (userId is null)
        {
            throw new Exception("User must be authenticated");
        }

        var booking = new Booking(Guid.NewGuid(), request.SlotId, request.ServiceId, userId.Value);
        slot.Book();
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync(cancellationToken);
        return booking.Id;
    }
}

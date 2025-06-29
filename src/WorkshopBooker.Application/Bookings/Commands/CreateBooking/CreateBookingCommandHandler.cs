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
        // Check if the service exists
        var serviceExists = await _context.Services
            .AnyAsync(s => s.Id == request.ServiceId, cancellationToken);
        if (!serviceExists)
        {
            throw new Exception("Service not found");
        }

        // Booking date cannot be in the past
        if (request.BookingDateTime < DateTime.UtcNow)
        {
            throw new Exception("Booking date cannot be in the past");
        }

        var userId = _currentUserProvider.UserId;
        if (userId is null)
        {
            throw new Exception("User must be authenticated");
        }

        var booking = new Booking(Guid.NewGuid(), request.BookingDateTime, request.ServiceId, userId.Value);
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync(cancellationToken);
        return booking.Id;
    }
}

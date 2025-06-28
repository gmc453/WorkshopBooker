using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Bookings.Commands.CreateBooking;

public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateBookingCommandHandler(IApplicationDbContext context)
    {
        _context = context;
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

        var booking = new Booking(Guid.NewGuid(), request.BookingDateTime, request.ServiceId);
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync(cancellationToken);
        return booking.Id;
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;

namespace WorkshopBooker.Application.Bookings.Commands.ConfirmBooking;

public class ConfirmBookingCommandHandler : IRequestHandler<ConfirmBookingCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public ConfirmBookingCommandHandler(
        IApplicationDbContext context,
        ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task Handle(ConfirmBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await _context.Bookings
            .Include(b => b.Service)
            .ThenInclude(s => s!.Workshop)
            .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken);

        if (booking == null)
        {
            throw new ArgumentException($"Rezerwacja o ID {request.BookingId} nie została znaleziona.");
        }

        // Autoryzacja na poziomie zasobu
        var currentUserId = _currentUserProvider.UserId;
        if (currentUserId == null || booking.Service.Workshop.UserId != currentUserId)
        {
            throw new WorkshopBooker.Application.Common.Exceptions.UnauthorizedAccessException("Nie masz uprawnień do potwierdzenia tej rezerwacji.");
        }

        // Wykonanie logiki biznesowej
        booking.Confirm();

        // Zapisanie zmian
        await _context.SaveChangesAsync(cancellationToken);
    }
} 
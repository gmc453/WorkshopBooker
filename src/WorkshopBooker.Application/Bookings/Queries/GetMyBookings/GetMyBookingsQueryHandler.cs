using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Bookings.Dtos;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;

namespace WorkshopBooker.Application.Bookings.Queries.GetMyBookings;

public class GetMyBookingsQueryHandler : IRequestHandler<GetMyBookingsQuery, List<BookingDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public GetMyBookingsQueryHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<List<BookingDto>> Handle(GetMyBookingsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserProvider.UserId;
        if (userId is null)
        {
            throw new UnauthenticatedUserException();
        }

        var bookings = await _context.Bookings
            .Where(b => b.UserId == userId.Value)
            .Include(b => b.Service)
            .Include(b => b.Slot)
            .Include(b => b.Service.Workshop) // Dołączamy warsztat żeby wyświetlić jego nazwę
            .ToListAsync(cancellationToken);

        var bookingDtos = bookings.Select(b => new BookingDto
        {
            Id = b.Id,
            SlotStartTime = b.Slot.StartTime,
            SlotEndTime = b.Slot.EndTime,
            Status = b.Status,
            ServiceId = b.ServiceId,
            ServiceName = b.Service?.Name ?? "Nieznana usługa",
            ServicePrice = b.Service?.Price ?? 0,
            WorkshopId = b.Service?.WorkshopId.ToString(),
            WorkshopName = b.Service?.Workshop?.Name ?? "Nieznany warsztat"
        }).ToList();

        return bookingDtos;
    }
}

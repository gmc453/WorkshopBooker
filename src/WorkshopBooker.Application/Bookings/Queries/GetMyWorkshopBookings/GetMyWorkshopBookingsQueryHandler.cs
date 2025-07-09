using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Bookings.Dtos;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;

namespace WorkshopBooker.Application.Bookings.Queries.GetMyWorkshopBookings;

public class GetMyWorkshopBookingsQueryHandler : IRequestHandler<GetMyWorkshopBookingsQuery, List<BookingDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public GetMyWorkshopBookingsQueryHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<List<BookingDto>> Handle(GetMyWorkshopBookingsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserProvider.UserId;
        if (userId is null)
        {
            throw new UnauthenticatedUserException();
        }

        // Pobierz wszystkie warsztaty użytkownika
        var userWorkshopIds = await _context.Workshops
            .Where(w => w.UserId == userId.Value)
            .Select(w => w.Id)
            .ToListAsync(cancellationToken);

        if (!userWorkshopIds.Any())
        {
            return new List<BookingDto>();
        }

        // Pobierz wszystkie rezerwacje dla warsztatów użytkownika
        var bookings = await _context.Bookings
            .Where(b => userWorkshopIds.Contains(b.Service.WorkshopId))
            .Include(b => b.Service)
            .Include(b => b.Service.Workshop)
            .Include(b => b.Slot)
            .Include(b => b.User) // Dołączamy użytkownika żeby wyświetlić jego dane
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
            UserName = string.IsNullOrWhiteSpace($"{b.User?.FirstName ?? ""} {b.User?.LastName ?? ""}".Trim()) 
                ? (b.User?.Email ?? "Nieznany użytkownik") 
                : $"{b.User?.FirstName ?? ""} {b.User?.LastName ?? ""}".Trim(),
            WorkshopId = b.Service?.WorkshopId.ToString(),
            WorkshopName = b.Service?.Workshop?.Name ?? "Nieznany warsztat"
        }).ToList();

        return bookingDtos;
    }
} 
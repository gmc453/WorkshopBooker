using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Bookings.Dtos;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;

namespace WorkshopBooker.Application.Bookings.Queries.GetBookingsForWorkshop;

public class GetBookingsForWorkshopQueryHandler : IRequestHandler<GetBookingsForWorkshopQuery, List<BookingDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public GetBookingsForWorkshopQueryHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<List<BookingDto>> Handle(GetBookingsForWorkshopQuery request, CancellationToken cancellationToken)
    {
        // Sprawdź czy użytkownik jest zalogowany
        if (_currentUserProvider.UserId is null)
        {
            throw new UnauthenticatedUserException();
        }

        // Sprawdź czy warsztat istnieje i czy użytkownik jest jego właścicielem
        var workshop = await _context.Workshops
            .FirstOrDefaultAsync(w => w.Id == request.WorkshopId, cancellationToken);

        if (workshop is null)
        {
            throw new WorkshopNotFoundException();
        }

        if (workshop.UserId != _currentUserProvider.UserId)
        {
            throw new WorkshopBooker.Application.Common.Exceptions.UnauthorizedAccessException("Brak uprawnień do przeglądania rezerwacji tego warsztatu");
        }

        var bookings = await _context.Bookings
            .Where(b => b.Service.WorkshopId == request.WorkshopId)
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

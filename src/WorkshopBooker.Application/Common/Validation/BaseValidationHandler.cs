using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace WorkshopBooker.Application.Common.Validation;

/// <summary>
/// Bazowa klasa dla handlerów z walidacją uprawnień użytkownika
/// Eliminuje duplikację kodu walidacji w różnych handlerach
/// </summary>
public abstract class BaseValidationHandler
{
    protected readonly IApplicationDbContext _context;
    protected readonly ICurrentUserProvider _currentUserProvider;

    protected BaseValidationHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    /// <summary>
    /// Sprawdza czy użytkownik jest uwierzytelniony
    /// </summary>
    /// <exception cref="UnauthenticatedUserException">Gdy użytkownik nie jest uwierzytelniony</exception>
    protected void EnsureUserIsAuthenticated()
    {
        var currentUserId = _currentUserProvider.UserId;
        if (currentUserId == null)
        {
            throw new UnauthenticatedUserException("Użytkownik musi być uwierzytelniony");
        }
    }

    /// <summary>
    /// Sprawdza czy użytkownik jest właścicielem warsztatu
    /// </summary>
    /// <param name="workshopId">ID warsztatu</param>
    /// <param name="errorMessage">Komunikat błędu</param>
    /// <exception cref="UnauthorizedAccessException">Gdy użytkownik nie ma uprawnień</exception>
    protected async Task EnsureUserOwnsWorkshopAsync(Guid workshopId, string errorMessage = "Brak uprawnień do tego warsztatu")
    {
        EnsureUserIsAuthenticated();
        
        var currentUserId = _currentUserProvider.UserId!.Value;
        var workshop = await _context.Workshops
            .FirstOrDefaultAsync(w => w.Id == workshopId);

        if (workshop == null)
        {
            throw new WorkshopNotFoundException($"Warsztat o ID {workshopId} nie został znaleziony");
        }

        if (workshop.UserId != currentUserId)
        {
            throw new WorkshopBooker.Application.Common.Exceptions.UnauthorizedAccessException(errorMessage);
        }
    }

    /// <summary>
    /// Sprawdza czy użytkownik ma uprawnienia do rezerwacji
    /// </summary>
    /// <param name="bookingId">ID rezerwacji</param>
    /// <param name="errorMessage">Komunikat błędu</param>
    /// <exception cref="UnauthorizedAccessException">Gdy użytkownik nie ma uprawnień</exception>
    protected async Task EnsureUserOwnsBookingAsync(Guid bookingId, string errorMessage = "Nie masz uprawnień do tej rezerwacji")
    {
        EnsureUserIsAuthenticated();
        
        var currentUserId = _currentUserProvider.UserId!.Value;
        var booking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
        {
            throw new BookingNotFoundException($"Rezerwacja o ID {bookingId} nie została znaleziona");
        }

        if (booking.UserId != currentUserId)
        {
            throw new WorkshopBooker.Application.Common.Exceptions.UnauthorizedAccessException(errorMessage);
        }
    }

    /// <summary>
    /// Sprawdza czy użytkownik ma uprawnienia do usługi (poprzez warsztat)
    /// </summary>
    /// <param name="serviceId">ID usługi</param>
    /// <param name="errorMessage">Komunikat błędu</param>
    /// <exception cref="UnauthorizedAccessException">Gdy użytkownik nie ma uprawnień</exception>
    protected async Task EnsureUserOwnsServiceAsync(Guid serviceId, string errorMessage = "Brak uprawnień do tej usługi")
    {
        EnsureUserIsAuthenticated();
        
        var currentUserId = _currentUserProvider.UserId!.Value;
        var service = await _context.Services
            .Include(s => s.Workshop)
            .FirstOrDefaultAsync(s => s.Id == serviceId);

        if (service == null)
        {
            throw new ServiceNotFoundException($"Usługa o ID {serviceId} nie została znaleziona");
        }

        if (service.Workshop.UserId != currentUserId)
        {
            throw new WorkshopBooker.Application.Common.Exceptions.UnauthorizedAccessException(errorMessage);
        }
    }
} 
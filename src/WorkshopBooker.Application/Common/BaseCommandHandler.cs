using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Common;

/// <summary>
/// Bazowa klasa dla wszystkich command handlerów, zawierająca wspólną logikę walidacji
/// </summary>
public abstract class BaseCommandHandler
{
    protected readonly IApplicationDbContext _context;
    protected readonly ICurrentUserProvider _currentUserProvider;
    
    protected BaseCommandHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }
    
    /// <summary>
    /// Pobiera ID zalogowanego użytkownika lub rzuca wyjątek jeśli użytkownik nie jest zalogowany
    /// </summary>
    /// <returns>ID zalogowanego użytkownika</returns>
    /// <exception cref="UnauthenticatedUserException">Gdy użytkownik nie jest zalogowany</exception>
    protected string GetAuthenticatedUserId()
    {
        var userId = _currentUserProvider.UserId;
        if (string.IsNullOrEmpty(userId))
            throw new UnauthenticatedUserException();
        return userId;
    }
    
    /// <summary>
    /// Sprawdza czy zalogowany użytkownik jest właścicielem warsztatu
    /// </summary>
    /// <param name="workshopId">ID warsztatu do sprawdzenia</param>
    /// <param name="cancellationToken">Token anulowania</param>
    /// <returns>Warsztat jeśli użytkownik jest właścicielem</returns>
    /// <exception cref="WorkshopNotFoundException">Gdy warsztat nie istnieje</exception>
    /// <exception cref="UnauthorizedAccessException">Gdy użytkownik nie jest właścicielem</exception>
    protected async Task<Workshop> EnsureUserOwnsWorkshopAsync(Guid workshopId, CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();
        var workshop = await _context.Workshops
            .FirstOrDefaultAsync(w => w.Id == workshopId, cancellationToken);
            
        if (workshop == null)
            throw new WorkshopNotFoundException();
            
        if (workshop.UserId != userId)
            throw new UnauthorizedAccessException("Brak uprawnień do edycji tego warsztatu");
            
        return workshop;
    }
    
    /// <summary>
    /// Sprawdza czy zalogowany użytkownik jest właścicielem usługi (poprzez warsztat)
    /// </summary>
    /// <param name="serviceId">ID usługi do sprawdzenia</param>
    /// <param name="cancellationToken">Token anulowania</param>
    /// <returns>Usługa jeśli użytkownik jest właścicielem</returns>
    /// <exception cref="ServiceNotFoundException">Gdy usługa nie istnieje</exception>
    /// <exception cref="UnauthorizedAccessException">Gdy użytkownik nie jest właścicielem</exception>
    protected async Task<Service> EnsureUserOwnsServiceAsync(Guid serviceId, CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();
        var service = await _context.Services
            .Include(s => s.Workshop)
            .FirstOrDefaultAsync(s => s.Id == serviceId, cancellationToken);
            
        if (service == null)
            throw new ServiceNotFoundException();
            
        if (service.Workshop.UserId != userId)
            throw new UnauthorizedAccessException("Brak uprawnień do edycji tej usługi");
            
        return service;
    }
} 
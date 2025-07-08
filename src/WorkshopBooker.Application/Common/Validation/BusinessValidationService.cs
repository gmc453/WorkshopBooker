using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace WorkshopBooker.Application.Common.Validation;

/// <summary>
/// Scentralizowany serwis walidacji biznesowej
/// Eliminuje rozproszoną logikę walidacji w różnych miejscach
/// </summary>
public class BusinessValidationService
{
    private readonly IApplicationDbContext _context;
    private readonly IWorkingHoursValidator _workingHoursValidator;

    public BusinessValidationService(IApplicationDbContext context, IWorkingHoursValidator workingHoursValidator)
    {
        _context = context;
        _workingHoursValidator = workingHoursValidator;
    }

    /// <summary>
    /// Waliduje czas rozpoczęcia slotu
    /// </summary>
    /// <param name="startTime">Czas rozpoczęcia</param>
    /// <param name="workshopId">ID warsztatu</param>
    /// <returns>True jeśli walidacja przechodzi</returns>
    public async Task<bool> ValidateSlotStartTimeAsync(DateTime startTime, Guid workshopId)
    {
        // Sprawdź czy slot jest w przyszłości
        if (startTime <= DateTime.UtcNow)
        {
            throw new ValidationException("Czas rozpoczęcia musi być w przyszłości");
        }

        // Sprawdź czy slot jest w godzinach pracy
        if (!await _workingHoursValidator.IsWithinWorkingHours(startTime, workshopId))
        {
            throw new ValidationException("Slot musi być w godzinach pracy warsztatu");
        }

        return true;
    }

    /// <summary>
    /// Waliduje czas trwania slotu
    /// </summary>
    /// <param name="startTime">Czas rozpoczęcia</param>
    /// <param name="endTime">Czas zakończenia</param>
    /// <param name="serviceDurationMinutes">Czas trwania usługi w minutach</param>
    /// <returns>True jeśli walidacja przechodzi</returns>
    public bool ValidateSlotDuration(DateTime startTime, DateTime endTime, int serviceDurationMinutes)
    {
        var slotDuration = endTime - startTime;
        var requiredDuration = TimeSpan.FromMinutes(serviceDurationMinutes);

        if (slotDuration < requiredDuration)
        {
            throw new ValidationException($"Slot musi trwać co najmniej {serviceDurationMinutes} minut");
        }

        return true;
    }

    /// <summary>
    /// Sprawdza czy slot nie nakłada się z innymi slotami
    /// </summary>
    /// <param name="workshopId">ID warsztatu</param>
    /// <param name="startTime">Czas rozpoczęcia</param>
    /// <param name="endTime">Czas zakończenia</param>
    /// <param name="excludeSlotId">ID slotu do wykluczenia (dla aktualizacji)</param>
    /// <returns>True jeśli nie ma nakładania</returns>
    public async Task<bool> ValidateSlotOverlapAsync(Guid workshopId, DateTime startTime, DateTime endTime, Guid? excludeSlotId = null)
    {
        var overlappingSlots = await _context.AvailableSlots
            .Where(s => s.WorkshopId == workshopId &&
                       s.Id != excludeSlotId &&
                       s.StartTime < endTime &&
                       s.EndTime > startTime)
            .AnyAsync();

        if (overlappingSlots)
        {
            throw new SlotOverlapException("Slot nakłada się z istniejącymi slotami");
        }

        return true;
    }

    /// <summary>
    /// Waliduje rezerwację
    /// </summary>
    /// <param name="slotId">ID slotu</param>
    /// <param name="serviceId">ID usługi</param>
    /// <returns>True jeśli walidacja przechodzi</returns>
    public async Task<bool> ValidateBookingAsync(Guid slotId, Guid serviceId)
    {
        // Sprawdź czy slot istnieje i jest dostępny
        var slot = await _context.AvailableSlots
            .FirstOrDefaultAsync(s => s.Id == slotId);

        if (slot == null)
        {
            throw new SlotNotFoundException($"Slot o ID {slotId} nie został znaleziony");
        }

        if (slot.Status != Domain.Entities.SlotStatus.Available)
        {
            throw new ValidationException("Slot nie jest dostępny");
        }

        // Sprawdź czy usługa istnieje i jest aktywna
        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == serviceId);

        if (service == null)
        {
            throw new ServiceNotFoundException($"Usługa o ID {serviceId} nie została znaleziona");
        }

        if (!service.IsActive)
        {
            throw new ValidationException("Usługa nie jest aktywna");
        }

        // Sprawdź czy slot jest wystarczająco długi dla usługi
        var slotDuration = slot.EndTime - slot.StartTime;
        var requiredDuration = TimeSpan.FromMinutes(service.DurationInMinutes);

        if (slotDuration < requiredDuration)
        {
            throw new ValidationException($"Slot jest za krótki dla tej usługi (wymagane: {service.DurationInMinutes} min)");
        }

        return true;
    }
}

/// <summary>
/// Wyjątek walidacji biznesowej
/// </summary>
public class ValidationException : Exception
{
    public ValidationException() : base("Błąd walidacji")
    {
    }

    public ValidationException(string message) : base(message)
    {
    }

    public ValidationException(string message, Exception innerException) : base(message, innerException)
    {
    }
} 
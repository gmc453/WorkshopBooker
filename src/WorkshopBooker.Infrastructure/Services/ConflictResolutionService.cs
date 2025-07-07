using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Slots.Dtos;
using WorkshopBooker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace WorkshopBooker.Infrastructure.Services;

public class ConflictResolutionService : IConflictResolutionService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<ConflictResolutionService> _logger;

    public ConflictResolutionService(IApplicationDbContext context, ILogger<ConflictResolutionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<AlternativeSlot>> SuggestAlternatives(Guid workshopId, DateTime requestedTime, int durationMinutes)
    {
        var alternatives = new List<AlternativeSlot>();
        
        try
        {
            // Znajdź wszystkie dostępne sloty w warsztacie
            var availableSlots = await _context.AvailableSlots
                .Where(s => s.WorkshopId == workshopId && 
                           s.StartTime >= requestedTime.AddDays(-7) && // Szukaj w zakresie ±7 dni
                           s.StartTime <= requestedTime.AddDays(7) &&
                           s.Status == SlotStatus.Available)
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            // Pobierz usługi warsztatu
            var services = await _context.Services
                .Where(s => s.WorkshopId == workshopId && s.IsActive)
                .ToListAsync();

            foreach (var slot in availableSlots)
            {
                var timeDifference = Math.Abs((slot.StartTime - requestedTime).TotalMinutes);
                
                // Sprawdź czy slot ma wystarczający czas
                var slotDuration = (slot.EndTime - slot.StartTime).TotalMinutes;
                if (slotDuration < durationMinutes) continue;

                // Użyj pierwszej dostępnej usługi jako przykładu
                var service = services.FirstOrDefault();
                if (service == null) continue;

                var alternative = new AlternativeSlot
                {
                    SlotId = slot.Id,
                    StartTime = slot.StartTime,
                    EndTime = slot.EndTime,
                    ServiceName = service.Name,
                    Price = service.Price,
                    TimeDifferenceMinutes = (int)timeDifference,
                    Reason = GetAlternativeReason(timeDifference, slot.StartTime, requestedTime)
                };

                alternatives.Add(alternative);
            }

            // Sortuj według różnicy czasowej (najbliższe pierwsze)
            return alternatives.OrderBy(a => a.TimeDifferenceMinutes).Take(5).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error suggesting alternatives for workshop {WorkshopId} at {RequestedTime}", 
                workshopId, requestedTime);
            return new List<AlternativeSlot>();
        }
    }

    public async Task<bool> IsSlotAvailable(Guid slotId)
    {
        try
        {
            var slot = await _context.AvailableSlots
                .FirstOrDefaultAsync(s => s.Id == slotId);

            return slot?.Status == SlotStatus.Available;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking slot availability for {SlotId}", slotId);
            return false;
        }
    }

    public async Task<List<AvailableSlotDto>> FindAvailableSlots(Guid workshopId, DateTime startDate, DateTime endDate)
    {
        try
        {
            var slots = await _context.AvailableSlots
                .Where(s => s.WorkshopId == workshopId && 
                           s.StartTime >= startDate && 
                           s.StartTime <= endDate &&
                           s.Status == SlotStatus.Available)
                .OrderBy(s => s.StartTime)
                .Select(s => new AvailableSlotDto
                {
                    Id = s.Id,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Status = s.Status,
                    WorkshopId = s.WorkshopId,
                    IsAvailable = s.Status == SlotStatus.Available
                })
                .ToListAsync();

            return slots;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finding available slots for workshop {WorkshopId} between {StartDate} and {EndDate}", 
                workshopId, startDate, endDate);
            return new List<AvailableSlotDto>();
        }
    }

    private string GetAlternativeReason(double timeDifferenceMinutes, DateTime slotTime, DateTime requestedTime)
    {
        if (timeDifferenceMinutes < 60) // Mniej niż 1 godzina
        {
            return slotTime > requestedTime ? "Najbliższy dostępny termin" : "Ostatni dostępny termin";
        }
        else if (timeDifferenceMinutes < 1440) // Mniej niż 1 dzień
        {
            return slotTime > requestedTime ? "Dostępny za kilka godzin" : "Dostępny wcześniej";
        }
        else if (timeDifferenceMinutes < 10080) // Mniej niż 1 tydzień
        {
            var days = (int)(timeDifferenceMinutes / 1440);
            return slotTime > requestedTime ? $"Dostępny za {days} dni" : $"Dostępny {days} dni wcześniej";
        }
        else
        {
            return "Alternatywny termin";
        }
    }
} 
using WorkshopBooker.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace WorkshopBooker.Infrastructure.Services;

public class WorkingHoursValidator : IWorkingHoursValidator
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<WorkingHoursValidator> _logger;

    // Domyślne godziny pracy (można przenieść do bazy danych)
    private readonly Dictionary<DayOfWeek, (TimeSpan Open, TimeSpan Close)> _defaultWorkingHours = new()
    {
        { DayOfWeek.Monday, (new TimeSpan(8, 0, 0), new TimeSpan(18, 0, 0)) },
        { DayOfWeek.Tuesday, (new TimeSpan(8, 0, 0), new TimeSpan(18, 0, 0)) },
        { DayOfWeek.Wednesday, (new TimeSpan(8, 0, 0), new TimeSpan(18, 0, 0)) },
        { DayOfWeek.Thursday, (new TimeSpan(8, 0, 0), new TimeSpan(18, 0, 0)) },
        { DayOfWeek.Friday, (new TimeSpan(8, 0, 0), new TimeSpan(18, 0, 0)) },
        { DayOfWeek.Saturday, (new TimeSpan(9, 0, 0), new TimeSpan(15, 0, 0)) },
        { DayOfWeek.Sunday, (new TimeSpan(0, 0, 0), new TimeSpan(0, 0, 0)) } // Zamknięte
    };

    public WorkingHoursValidator(IApplicationDbContext context, ILogger<WorkingHoursValidator> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> IsWithinWorkingHours(DateTime slotTime, Guid workshopId)
    {
        try
        {
            // Sprawdź czy warsztat jest otwarty w danym dniu
            if (!await IsWorkshopOpen(slotTime, workshopId))
            {
                return false;
            }

            // Pobierz godziny pracy dla danego dnia
            var workingHours = await GetWorkingHoursForDay(workshopId, slotTime.DayOfWeek);
            
            if (!workingHours.IsOpen)
            {
                return false;
            }

            var slotTimeOfDay = slotTime.TimeOfDay;
            
            // Sprawdź czy slot mieści się w godzinach otwarcia
            return slotTimeOfDay >= workingHours.OpenTime && slotTimeOfDay <= workingHours.CloseTime;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking working hours for workshop {WorkshopId} at {SlotTime}", 
                workshopId, slotTime);
            return false;
        }
    }

    public async Task<WorkingHours> GetWorkingHours(Guid workshopId)
    {
        // Domyślnie zwracamy godziny dla poniedziałku
        return await GetWorkingHoursForDay(workshopId, DayOfWeek.Monday);
    }

    public async Task<bool> IsWorkshopOpen(DateTime dateTime, Guid workshopId)
    {
        try
        {
            // Sprawdź czy to nie jest święto
            if (IsHoliday(dateTime))
            {
                return false;
            }

            // Pobierz godziny pracy dla danego dnia
            var workingHours = await GetWorkingHoursForDay(workshopId, dateTime.DayOfWeek);
            
            return workingHours.IsOpen;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if workshop {WorkshopId} is open at {DateTime}", 
                workshopId, dateTime);
            return false;
        }
    }

    private Task<WorkingHours> GetWorkingHoursForDay(Guid workshopId, DayOfWeek dayOfWeek)
    {
        // TODO: W przyszłości można dodać tabelę WorkingHours w bazie danych
        // Na razie używamy domyślnych godzin
        
        var defaultHours = _defaultWorkingHours[dayOfWeek];
        
        var workingHours = new WorkingHours
        {
            WorkshopId = workshopId,
            DayOfWeek = dayOfWeek,
            OpenTime = defaultHours.Open,
            CloseTime = defaultHours.Close,
            IsOpen = defaultHours.Open != TimeSpan.Zero && defaultHours.Close != TimeSpan.Zero
        };
        
        return Task.FromResult(workingHours);
    }

    private bool IsHoliday(DateTime date)
    {
        // Lista polskich świąt (można przenieść do bazy danych)
        var holidays = new List<DateTime>
        {
            new DateTime(date.Year, 1, 1),   // Nowy Rok
            new DateTime(date.Year, 1, 6),   // Trzech Króli
            new DateTime(date.Year, 5, 1),   // Święto Pracy
            new DateTime(date.Year, 5, 3),   // Święto Konstytucji
            new DateTime(date.Year, 8, 15),  // Wniebowzięcie NMP
            new DateTime(date.Year, 11, 1),  // Wszystkich Świętych
            new DateTime(date.Year, 11, 11), // Święto Niepodległości
            new DateTime(date.Year, 12, 25), // Boże Narodzenie
            new DateTime(date.Year, 12, 26)  // Drugi dzień Bożego Narodzenia
        };

        return holidays.Any(h => h.Date == date.Date);
    }
} 
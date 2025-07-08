namespace WorkshopBooker.Application.Common.Constants;

/// <summary>
/// Stałe czasowe używane w całej aplikacji
/// </summary>
public static class TimeConstants
{
    /// <summary>
    /// Minimalny czas (w godzinach) przed rozpoczęciem slotu, aby można było dokonać rezerwacji
    /// </summary>
    public const int MinimumBookingAdvanceHours = 2;
    
    /// <summary>
    /// Czas (w godzinach) przed rozpoczęciem slotu, w którym wysyłane jest przypomnienie
    /// </summary>
    public const int ReminderHoursBeforeSlot = 24;
    
    /// <summary>
    /// Czas (w godzinach) przed rozpoczęciem slotu, w którym wysyłane jest krótkie przypomnienie
    /// </summary>
    public const int ShortReminderHoursBeforeSlot = 2;
    
    /// <summary>
    /// Domyślny okres (w dniach) dla analityki
    /// </summary>
    public const int DefaultAnalyticsPeriodDays = 30;
    
    /// <summary>
    /// Maksymalny okres (w dniach) dla analityki
    /// </summary>
    public const int MaxAnalyticsPeriodDays = 365;
    
    /// <summary>
    /// Czas (w sekundach) timeout dla operacji wysyłania powiadomień
    /// </summary>
    public const int NotificationTimeoutSeconds = 30;
    
    /// <summary>
    /// Zakres dni do przeszukiwania przy sugerowaniu alternatywnych slotów
    /// </summary>
    public const int AlternativeSlotsSearchRangeDays = 7;
} 
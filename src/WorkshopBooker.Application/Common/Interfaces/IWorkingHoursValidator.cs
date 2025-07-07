namespace WorkshopBooker.Application.Common.Interfaces;

public interface IWorkingHoursValidator
{
    Task<bool> IsWithinWorkingHours(DateTime slotTime, Guid workshopId);
    Task<WorkingHours> GetWorkingHours(Guid workshopId);
    Task<bool> IsWorkshopOpen(DateTime dateTime, Guid workshopId);
}

public record WorkingHours
{
    public Guid WorkshopId { get; init; }
    public DayOfWeek DayOfWeek { get; init; }
    public TimeSpan OpenTime { get; init; }
    public TimeSpan CloseTime { get; init; }
    public bool IsOpen { get; init; }
}

public record WorkshopSchedule
{
    public Guid WorkshopId { get; init; }
    public string WorkshopName { get; init; } = string.Empty;
    public List<WorkingHours> WorkingHours { get; init; } = new();
    public List<DateTime> Holidays { get; init; } = new(); // Daty świąt/dni wolnych
    public List<DateTime> SpecialHours { get; init; } = new(); // Specjalne godziny otwarcia
} 
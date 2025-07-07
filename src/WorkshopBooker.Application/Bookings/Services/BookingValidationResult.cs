namespace WorkshopBooker.Application.Bookings.Services;

public class BookingValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; } = new();

    public void AddError(string error) => Errors.Add(error);
}

using WorkshopBooker.Application.Bookings.Dtos;

namespace WorkshopBooker.Application.Common.Interfaces;

public interface INotificationService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendSmsAsync(string phoneNumber, string message);
    Task SendBookingConfirmationAsync(string email, string phoneNumber, BookingDto booking);
    Task SendBookingReminderAsync(string email, string phoneNumber, BookingDto booking, int hoursBefore);
    Task SendBookingCancellationAsync(string email, string phoneNumber, BookingDto booking);
}

public record NotificationSettings
{
    public bool EmailNotifications { get; init; } = true;
    public bool SmsNotifications { get; init; } = true;
    public bool PushNotifications { get; init; } = true;
    public int ReminderHoursBefore { get; init; } = 24;
} 
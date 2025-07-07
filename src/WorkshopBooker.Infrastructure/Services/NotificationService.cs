using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Bookings.Dtos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace WorkshopBooker.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly ILogger<NotificationService> _logger;
    private readonly IConfiguration _configuration;
    private readonly IBackgroundJobService _backgroundJobService;

    public NotificationService(
        ILogger<NotificationService> logger,
        IConfiguration configuration,
        IBackgroundJobService backgroundJobService)
    {
        _logger = logger;
        _configuration = configuration;
        _backgroundJobService = backgroundJobService;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        // TODO: Implement actual email service (SendGrid, MailKit, etc.)
        _logger.LogInformation("Sending email to {Email}: {Subject}", to, subject);
        await Task.Delay(100);
    }

    public async Task SendSmsAsync(string phoneNumber, string message)
    {
        // TODO: Implement actual SMS service (Twilio, etc.)
        _logger.LogInformation("Sending SMS to {Phone}: {Message}", phoneNumber, message);
        await Task.Delay(100);
    }

    public async Task SendBookingConfirmationAsync(string email, string phoneNumber, BookingDto booking)
    {
        var subject = "Potwierdzenie rezerwacji";
        var emailBody = GenerateBookingConfirmationEmail(booking);
        var smsMessage = GenerateBookingConfirmationSms(booking);

        var tasks = new List<Task>();
        if (!string.IsNullOrEmpty(email))
            tasks.Add(SendEmailAsync(email, subject, emailBody));
        if (!string.IsNullOrEmpty(phoneNumber))
            tasks.Add(SendSmsAsync(phoneNumber, smsMessage));

        await Task.WhenAll(tasks);
        await ScheduleReminders(email, phoneNumber, booking);
    }

    public async Task SendBookingReminderAsync(string email, string phoneNumber, BookingDto booking, int hoursBefore)
    {
        var subject = $"Przypomnienie o wizycie za {hoursBefore} godzin";
        var emailBody = GenerateBookingReminderEmail(booking, hoursBefore);
        var smsMessage = GenerateBookingReminderSms(booking, hoursBefore);

        var tasks = new List<Task>();
        if (!string.IsNullOrEmpty(email))
            tasks.Add(SendEmailAsync(email, subject, emailBody));
        if (!string.IsNullOrEmpty(phoneNumber))
            tasks.Add(SendSmsAsync(phoneNumber, smsMessage));

        await Task.WhenAll(tasks);
    }

    public async Task SendBookingCancellationAsync(string email, string phoneNumber, BookingDto booking)
    {
        var subject = "Anulowanie rezerwacji";
        var emailBody = GenerateBookingCancellationEmail(booking);
        var smsMessage = GenerateBookingCancellationSms(booking);

        var tasks = new List<Task>();
        if (!string.IsNullOrEmpty(email))
            tasks.Add(SendEmailAsync(email, subject, emailBody));
        if (!string.IsNullOrEmpty(phoneNumber))
            tasks.Add(SendSmsAsync(phoneNumber, smsMessage));

        await Task.WhenAll(tasks);
    }

    private async Task ScheduleReminders(string email, string phoneNumber, BookingDto booking)
    {
        await _backgroundJobService.ScheduleAsync(
            _ => SendBookingReminderAsync(email, phoneNumber, booking, 24),
            booking.SlotStartTime.AddHours(-24));

        await _backgroundJobService.ScheduleAsync(
            _ => SendBookingReminderAsync(email, phoneNumber, booking, 2),
            booking.SlotStartTime.AddHours(-2));
    }

    private string GenerateBookingConfirmationEmail(BookingDto booking) =>
        $@"<h2>Potwierdzenie rezerwacji</h2>
            <p>Dziękujemy za rezerwację w naszym warsztacie!</p>
            <p><strong>Data:</strong> {booking.SlotStartTime:dd.MM.yyyy}</p>
            <p><strong>Godzina:</strong> {booking.SlotStartTime:HH:mm}</p>
            <p><strong>Usługa:</strong> {booking.ServiceName}</p>
            <p><strong>Cena:</strong> {booking.ServicePrice} zł</p>
            <p>Prosimy o punktualne przybycie. W razie pytań prosimy o kontakt.</p>";

    private string GenerateBookingConfirmationSms(BookingDto booking) =>
        $"Potwierdzenie rezerwacji: {booking.SlotStartTime:dd.MM.yyyy HH:mm}, {booking.ServiceName}, {booking.ServicePrice} zł. Dziękujemy!";

    private string GenerateBookingReminderEmail(BookingDto booking, int hoursBefore) =>
        $@"<h2>Przypomnienie o wizycie</h2>
            <p>Przypominamy o wizycie za {hoursBefore} godzin!</p>
            <p><strong>Data:</strong> {booking.SlotStartTime:dd.MM.yyyy}</p>
            <p><strong>Godzina:</strong> {booking.SlotStartTime:HH:mm}</p>
            <p><strong>Usługa:</strong> {booking.ServiceName}</p>
            <p>Prosimy o punktualne przybycie.</p>";

    private string GenerateBookingReminderSms(BookingDto booking, int hoursBefore) =>
        $"Przypomnienie: wizyta za {hoursBefore}h - {booking.SlotStartTime:dd.MM.yyyy HH:mm}, {booking.ServiceName}";

    private string GenerateBookingCancellationEmail(BookingDto booking) =>
        $@"<h2>Anulowanie rezerwacji</h2>
            <p>Twoja rezerwacja została anulowana.</p>
            <p><strong>Data:</strong> {booking.SlotStartTime:dd.MM.yyyy}</p>
            <p><strong>Godzina:</strong> {booking.SlotStartTime:HH:mm}</p>
            <p><strong>Usługa:</strong> {booking.ServiceName}</p>
            <p>Dziękujemy za zrozumienie.</p>";

    private string GenerateBookingCancellationSms(BookingDto booking) =>
        $"Rezerwacja anulowana: {booking.SlotStartTime:dd.MM.yyyy HH:mm}, {booking.ServiceName}";
}

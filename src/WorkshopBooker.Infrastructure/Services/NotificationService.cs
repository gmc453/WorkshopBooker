using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Bookings.Dtos;
using WorkshopBooker.Application.Common.Constants;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Threading;

namespace WorkshopBooker.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly ILogger<NotificationService> _logger;
    private readonly IConfiguration _configuration;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;

    public NotificationService(
        ILogger<NotificationService> logger,
        IConfiguration configuration,
        IBackgroundJobService backgroundJobService,
        IEmailService emailService,
        ISmsService smsService)
    {
        _logger = logger;
        _configuration = configuration;
        _backgroundJobService = backgroundJobService;
        _emailService = emailService;
        _smsService = smsService;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        await _emailService.SendEmailAsync(to, subject, body);
    }

    public async Task SendSmsAsync(string phoneNumber, string message)
    {
        await _smsService.SendSmsAsync(phoneNumber, message);
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

        if (tasks.Count > 0)
        {
            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(TimeConstants.NotificationTimeoutSeconds));
                await Task.WhenAll(tasks).WaitAsync(cts.Token);
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Timeout podczas wysyłania powiadomień o rezerwacji");
                throw new InvalidOperationException("Timeout podczas wysyłania powiadomień o rezerwacji");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas wysyłania powiadomień o rezerwacji");
                throw;
            }
        }
        
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

        if (tasks.Count > 0)
        {
            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(TimeConstants.NotificationTimeoutSeconds));
                await Task.WhenAll(tasks).WaitAsync(cts.Token);
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Timeout podczas wysyłania przypomnień o rezerwacji");
                throw new InvalidOperationException("Timeout podczas wysyłania przypomnień o rezerwacji");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas wysyłania przypomnień o rezerwacji");
                throw;
            }
        }
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

        if (tasks.Count > 0)
        {
            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(TimeConstants.NotificationTimeoutSeconds));
                await Task.WhenAll(tasks).WaitAsync(cts.Token);
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Timeout podczas wysyłania powiadomień o anulowaniu");
                throw new InvalidOperationException("Timeout podczas wysyłania powiadomień o anulowaniu");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas wysyłania powiadomień o anulowaniu");
                throw;
            }
        }
    }

    private async Task ScheduleReminders(string email, string phoneNumber, BookingDto booking)
    {
        // ✅ POPRAWKA: Spójne używanie UTC dla wszystkich operacji czasowych
        DateTime slotStartUtc;
        
        if (booking.SlotStartTime.Kind == DateTimeKind.Utc)
        {
            slotStartUtc = booking.SlotStartTime;
        }
        else if (booking.SlotStartTime.Kind == DateTimeKind.Local)
        {
            slotStartUtc = booking.SlotStartTime.ToUniversalTime();
        }
        else // DateTimeKind.Unspecified
        {
            // ✅ POPRAWKA: Traktuję Unspecified jako UTC dla spójności
            slotStartUtc = DateTime.SpecifyKind(booking.SlotStartTime, DateTimeKind.Utc);
        }

        var reminder24 = slotStartUtc.AddHours(-TimeConstants.ReminderHoursBeforeSlot);
        if (reminder24 > DateTime.UtcNow)
        {
            try
            {
                await _backgroundJobService.ScheduleAsync(
                    serviceProvider => SendBookingReminderViaServiceProvider(serviceProvider, email, phoneNumber, booking, TimeConstants.ReminderHoursBeforeSlot),
                    new DateTimeOffset(reminder24, TimeSpan.Zero));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas planowania przypomnienia {Hours}h dla rezerwacji {BookingId}", TimeConstants.ReminderHoursBeforeSlot, booking.Id);
            }
        }

        var reminder2 = slotStartUtc.AddHours(-TimeConstants.ShortReminderHoursBeforeSlot);
        if (reminder2 > DateTime.UtcNow)
        {
            try
            {
                await _backgroundJobService.ScheduleAsync(
                    serviceProvider => SendBookingReminderViaServiceProvider(serviceProvider, email, phoneNumber, booking, TimeConstants.ShortReminderHoursBeforeSlot),
                    new DateTimeOffset(reminder2, TimeSpan.Zero));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas planowania przypomnienia {Hours}h dla rezerwacji {BookingId}", TimeConstants.ShortReminderHoursBeforeSlot, booking.Id);
            }
        }
    }

    private static async Task SendBookingReminderViaServiceProvider(IServiceProvider serviceProvider, string email, string phoneNumber, BookingDto booking, int hoursBefore)
    {
        var notificationService = serviceProvider.GetRequiredService<INotificationService>();
        await notificationService.SendBookingReminderAsync(email, phoneNumber, booking, hoursBefore);
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

using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common;
using WorkshopBooker.Application.Bookings.Dtos;
using WorkshopBooker.Application.Slots.Dtos;
using WorkshopBooker.Domain.Entities;
using Microsoft.Extensions.Logging;
using WorkshopBooker.Application.Bookings.Services;

namespace WorkshopBooker.Application.Bookings.Commands.CreateBooking;

public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;
    private readonly ILogger<CreateBookingCommandHandler> _logger;
    private readonly INotificationService _notificationService;
    private readonly BookingValidator _validator;

    public CreateBookingCommandHandler(
        IApplicationDbContext context, 
        ICurrentUserProvider currentUserProvider,
        ILogger<CreateBookingCommandHandler> logger,
        INotificationService notificationService,
        BookingValidator validator)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
        _logger = logger;
        _notificationService = notificationService;
        _validator = validator;
    }

    public async Task<Result<Guid>> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Tworzenie rezerwacji dla slotu: {SlotId}", request.SlotId);

        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            _logger.LogWarning("Walidacja rezerwacji nie powiodła się: {Errors}", string.Join(";", validation.Errors));
            return Result<Guid>.ValidationFailure(validation.Errors);
        }

        var userId = _currentUserProvider.UserId;
        if (userId is null)
        {
            return Result<Guid>.Failure("Użytkownik musi być uwierzytelniony");
        }

        Guid bookingId;
        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var slot = await _context.AvailableSlots
                .FirstOrDefaultAsync(s => s.Id == request.SlotId, cancellationToken);

            if (slot == null)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result<Guid>.Failure("Wybrany termin nie został znaleziony");
            }

            if (slot.Status != SlotStatus.Available)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result<Guid>.Failure("Wybrany termin jest już niedostępny");
            }

            slot.Book();
            _context.AvailableSlots.Update(slot);

            var booking = new Booking(
                Guid.NewGuid(),
                request.SlotId,
                request.ServiceId,
                userId.Value,
                request.CustomerName,
                request.CustomerEmail,
                request.CustomerPhone,
                request.CarBrand,
                request.CarModel,
                request.Notes
            );

            _context.Bookings.Add(booking);
            
            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            
            bookingId = booking.Id;
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result<Guid>.Failure("Wybrany termin jest już niedostępny");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.LogError(ex, "Błąd podczas tworzenia rezerwacji dla slotu: {SlotId}", request.SlotId);
            return Result<Guid>.Failure("Wystąpił błąd podczas tworzenia rezerwacji");
        }

        try
        {
            // Zoptymalizowane zapytanie - pobierz wszystkie potrzebne dane w jednym zapytaniu
            var notificationData = await _context.Users
                .Where(u => u.Id == userId.Value)
                .Select(u => new
                {
                    User = u,
                    Service = _context.Services
                        .Where(s => s.Id == request.ServiceId)
                        .Select(s => new { s.Name, s.Price })
                        .FirstOrDefault(),
                    Slot = _context.AvailableSlots
                        .Where(s => s.Id == request.SlotId)
                        .Select(s => new { s.StartTime, s.EndTime })
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (notificationData?.User != null && 
                notificationData.Service != null && 
                notificationData.Slot != null)
            {
                var bookingDto = new BookingDto
                {
                    Id = bookingId,
                    SlotStartTime = notificationData.Slot.StartTime,
                    SlotEndTime = notificationData.Slot.EndTime,
                    ServiceName = notificationData.Service.Name,
                    ServicePrice = notificationData.Service.Price,
                    ServiceId = request.ServiceId,
                    Status = Domain.Entities.BookingStatus.Requested
                };

                await _notificationService.SendBookingConfirmationAsync(
                    notificationData.User.Email,
                    notificationData.User.FirstName,
                    bookingDto);
            }
        }
        catch (Exception notificationEx)
        {
            _logger.LogWarning(notificationEx, "Błąd podczas wysyłania powiadomienia o rezerwacji - rezerwacja została utworzona");
        }

        _logger.LogInformation("Pomyślnie utworzono rezerwację: {BookingId}", bookingId);
        return Result<Guid>.Success(bookingId);
    }
}

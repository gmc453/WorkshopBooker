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
        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            _logger.LogInformation("Tworzenie rezerwacji dla slotu: {SlotId}", request.SlotId);

            var validation = await _validator.ValidateAsync(request, cancellationToken);
            if (!validation.IsValid)
            {
                _logger.LogWarning("Walidacja rezerwacji nie powiodła się: {Errors}", string.Join(";", validation.Errors));
                await transaction.RollbackAsync(cancellationToken);
                return Result<Guid>.ValidationFailure(validation.Errors);
            }

            var userId = _currentUserProvider.UserId;
            if (userId is null)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result<Guid>.Failure("Użytkownik musi być uwierzytelniony");
            }

            var slot = await _context.AvailableSlots
                .Where(s => s.Id == request.SlotId && s.Status == SlotStatus.Available)
                .FirstOrDefaultAsync(cancellationToken);

            if (slot == null)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result<Guid>.Failure("Wybrany termin jest już niedostępny");
            }

            slot.Book();

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

            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
                if (user != null)
                {
                    var service = await _context.Services
                        .AsNoTracking()
                        .FirstOrDefaultAsync(s => s.Id == request.ServiceId, cancellationToken);

                    if (service != null)
                    {
                        var bookingDto = new BookingDto
                        {
                            Id = booking.Id,
                            SlotStartTime = slot.StartTime,
                            SlotEndTime = slot.EndTime,
                            ServiceName = service.Name,
                            ServicePrice = service.Price,
                            ServiceId = request.ServiceId,
                            Status = booking.Status
                        };

                        await _notificationService.SendBookingConfirmationAsync(
                            user.Email,
                            user.FirstName,
                            bookingDto);
                    }
                }
            }
            catch (Exception notificationEx)
            {
                _logger.LogWarning(notificationEx, "Błąd podczas wysyłania powiadomienia o rezerwacji");
            }

            _logger.LogInformation("Pomyślnie utworzono rezerwację: {BookingId}", booking.Id);
            return Result<Guid>.Success(booking.Id);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.LogError(ex, "Błąd podczas tworzenia rezerwacji dla slotu: {SlotId}", request.SlotId);
            return Result<Guid>.Failure("Wystąpił błąd podczas tworzenia rezerwacji");
        }
    }
}

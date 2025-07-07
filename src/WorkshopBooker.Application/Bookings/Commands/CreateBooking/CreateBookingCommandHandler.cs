using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common;
using WorkshopBooker.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace WorkshopBooker.Application.Bookings.Commands.CreateBooking;

public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;
    private readonly ILogger<CreateBookingCommandHandler> _logger;

    public CreateBookingCommandHandler(
        IApplicationDbContext context, 
        ICurrentUserProvider currentUserProvider,
        ILogger<CreateBookingCommandHandler> logger)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Tworzenie rezerwacji dla slotu: {SlotId}", request.SlotId);

            var service = await _context.Services
                .Include(s => s.Workshop)
                .FirstOrDefaultAsync(s => s.Id == request.ServiceId, cancellationToken);
            
            if (service is null)
            {
                _logger.LogWarning("Usługa nie została znaleziona: {ServiceId}", request.ServiceId);
                return Result<Guid>.Failure("Usługa nie została znaleziona");
            }

            var slot = await _context.AvailableSlots
                .FirstOrDefaultAsync(s => s.Id == request.SlotId, cancellationToken);
            
            if (slot is null)
            {
                _logger.LogWarning("Slot nie został znaleziony: {SlotId}", request.SlotId);
                return Result<Guid>.Failure("Slot nie został znaleziony");
            }

            if (slot.Status != SlotStatus.Available)
            {
                _logger.LogWarning("Slot nie jest dostępny: {SlotId}, Status: {Status}", request.SlotId, slot.Status);
                return Result<Guid>.Failure("Slot nie jest dostępny");
            }

            if (slot.WorkshopId != service.WorkshopId)
            {
                _logger.LogWarning("Slot nie należy do warsztatu usługi: SlotWorkshopId: {SlotWorkshopId}, ServiceWorkshopId: {ServiceWorkshopId}", 
                    slot.WorkshopId, service.WorkshopId);
                return Result<Guid>.Failure("Slot nie należy do warsztatu usługi");
            }

            var userId = _currentUserProvider.UserId;
            if (userId is null)
            {
                _logger.LogWarning("Użytkownik nie jest uwierzytelniony");
                return Result<Guid>.Failure("Użytkownik musi być uwierzytelniony");
            }

            var booking = new Booking(Guid.NewGuid(), request.SlotId, request.ServiceId, userId.Value);
            slot.Book();
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Pomyślnie utworzono rezerwację: {BookingId}", booking.Id);
            return Result<Guid>.Success(booking.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Błąd podczas tworzenia rezerwacji dla slotu: {SlotId}", request.SlotId);
            return Result<Guid>.Failure("Wystąpił błąd podczas tworzenia rezerwacji");
        }
    }
}

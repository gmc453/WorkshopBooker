using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Bookings.Commands.CreateBooking;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Bookings.Services;

public class BookingValidator
{
    private readonly IApplicationDbContext _context;

    public BookingValidator(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BookingValidationResult> ValidateAsync(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var result = new BookingValidationResult();

        var slot = await _context.AvailableSlots
            .Include(s => s.Workshop)
            .FirstOrDefaultAsync(s => s.Id == request.SlotId && s.Status == SlotStatus.Available, cancellationToken);

        if (slot == null)
        {
            result.AddError("Wybrany termin jest już niedostępny");
            return result;
        }

        if (slot.Workshop == null || !slot.Workshop.IsActive)
        {
            result.AddError("Warsztat jest obecnie niedostępny");
            return result;
        }

        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == request.ServiceId && s.IsActive, cancellationToken);

        if (service == null)
        {
            result.AddError("Wybrana usługa jest niedostępna");
            return result;
        }

        if (service.WorkshopId != slot.WorkshopId)
        {
            result.AddError("Wybrana usługa nie należy do tego samego warsztatu co termin");
            return result;
        }

        var slotDuration = (slot.EndTime - slot.StartTime).TotalMinutes;
        if (slotDuration < service.DurationInMinutes)
        {
            result.AddError("Wybrany termin jest za krótki dla tej usługi");
            return result;
        }

        result.IsValid = true;
        return result;
    }
}

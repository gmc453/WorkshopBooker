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

        var slotWithRelations = await _context.AvailableSlots
            .Include(s => s.Workshop)
            .Where(s => s.Id == request.SlotId && s.Status == SlotStatus.Available)
            .Select(s => new {
                Slot = s,
                Workshop = s.Workshop,
                Service = _context.Services.FirstOrDefault(srv => srv.Id == request.ServiceId && srv.IsActive)
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (slotWithRelations?.Slot == null)
        {
            result.AddError("Wybrany termin jest już niedostępny");
            return result;
        }

        if (slotWithRelations.Workshop == null || !slotWithRelations.Workshop.IsActive)
        {
            result.AddError("Warsztat jest obecnie niedostępny");
            return result;
        }

        if (slotWithRelations.Service == null)
        {
            result.AddError("Wybrana usługa jest niedostępna");
            return result;
        }

        if (slotWithRelations.Service.WorkshopId != slotWithRelations.Slot.WorkshopId)
        {
            result.AddError("Wybrana usługa nie należy do tego samego warsztatu co termin");
            return result;
        }

        var slotDuration = (slotWithRelations.Slot.EndTime - slotWithRelations.Slot.StartTime).TotalMinutes;
        if (slotDuration < slotWithRelations.Service.DurationInMinutes)
        {
            result.AddError("Wybrany termin jest za krótki dla tej usługi");
            return result;
        }

        result.IsValid = true;
        return result;
    }
}

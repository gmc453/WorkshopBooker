using MediatR;
using WorkshopBooker.Application.Slots.Dtos;

namespace WorkshopBooker.Application.Slots.Queries.GetAvailableSlots;

public record GetAvailableSlotsQuery(
    Guid WorkshopId,
    Guid ServiceId,
    DateTime? DateFrom = null,
    DateTime? DateTo = null
) : IRequest<List<AvailableSlotDto>>;

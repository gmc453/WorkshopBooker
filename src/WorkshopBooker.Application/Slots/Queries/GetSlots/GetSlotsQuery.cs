using MediatR;
using WorkshopBooker.Application.Slots.Dtos;

namespace WorkshopBooker.Application.Slots.Queries.GetSlots;

public record GetSlotsQuery(Guid WorkshopId, DateTime? DateFrom, DateTime? DateTo) : IRequest<List<AvailableSlotDto>>;

using MediatR;

namespace WorkshopBooker.Application.Slots.Commands.CreateSlot;

public record CreateSlotCommand(Guid WorkshopId, DateTime StartTime, DateTime EndTime) : IRequest<Guid>;

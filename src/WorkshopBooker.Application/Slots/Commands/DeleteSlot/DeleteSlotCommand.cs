using MediatR;

namespace WorkshopBooker.Application.Slots.Commands.DeleteSlot;

public record DeleteSlotCommand(Guid SlotId) : IRequest;

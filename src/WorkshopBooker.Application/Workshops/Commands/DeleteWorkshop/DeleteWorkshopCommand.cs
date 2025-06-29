using MediatR;

namespace WorkshopBooker.Application.Workshops.Commands.DeleteWorkshop;

public record DeleteWorkshopCommand(Guid Id) : IRequest;
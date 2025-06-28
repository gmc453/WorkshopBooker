using MediatR;
public record DeleteWorkshopCommand(Guid Id) : IRequest;
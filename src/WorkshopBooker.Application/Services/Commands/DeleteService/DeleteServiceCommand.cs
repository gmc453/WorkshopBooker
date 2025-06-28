// src/WorkshopBooker.Application/Services/Commands/DeleteService/DeleteServiceCommand.cs
using MediatR;

namespace WorkshopBooker.Application.Services.Commands.DeleteService;

public record DeleteServiceCommand(Guid WorkshopId, Guid Id) : IRequest;

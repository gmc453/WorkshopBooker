// src/WorkshopBooker.Application/Services/Commands/UpdateService/UpdateServiceCommand.cs
using MediatR;

namespace WorkshopBooker.Application.Services.Commands.UpdateService;

// Komenda do aktualizacji istniejącej usługi
public record UpdateServiceCommand(
    Guid Id,
    Guid WorkshopId,
    string Name,
    string? Description,
    decimal Price,
    int DurationInMinutes) : IRequest;

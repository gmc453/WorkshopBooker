// src/WorkshopBooker.Application/Services/Commands/CreateService/CreateServiceCommand.cs
using MediatR;

namespace WorkshopBooker.Application.Services.Commands.CreateService;

// Komenda do utworzenia nowej usługi w warsztacie
public record CreateServiceCommand(
    Guid WorkshopId,
    string Name,
    string? Description,
    decimal Price,
    int DurationInMinutes) : IRequest<Guid>;

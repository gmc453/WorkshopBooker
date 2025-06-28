// src/WorkshopBooker.Application/Workshops/Commands/CreateWorkshop/CreateWorkshopCommand.cs
using MediatR;

namespace WorkshopBooker.Application.Workshops.Commands.CreateWorkshop;

// Używamy 'record' dla zwięzłości.
// Komenda implementuje IRequest<Guid>, co oznacza:
// "Jestem poleceniem, a po moim wykonaniu oczekuję w odpowiedzi wartości typu Guid" (ID nowego warsztatu).
public record CreateWorkshopCommand(
    string Name,
    string Description,
    string? PhoneNumber,
    string? Email,
    string? Address) : IRequest<Guid>;
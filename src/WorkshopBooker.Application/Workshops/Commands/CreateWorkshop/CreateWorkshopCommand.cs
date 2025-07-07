// src/WorkshopBooker.Application/Workshops/Commands/CreateWorkshop/CreateWorkshopCommand.cs
using MediatR;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Workshops.Commands.CreateWorkshop;

// Używamy 'record' dla zwięzłości.
// Komenda implementuje IRequest<Result<Guid>>, co oznacza:
// "Jestem poleceniem, a po moim wykonaniu oczekuję w odpowiedzi Result<Guid>" (ID nowego warsztatu lub błąd).
public record CreateWorkshopCommand(
    string Name,
    string Description,
    string? PhoneNumber,
    string? Email,
    string? Address) : IRequest<Result<Guid>>;
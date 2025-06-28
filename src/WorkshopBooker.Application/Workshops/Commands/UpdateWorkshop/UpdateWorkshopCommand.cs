// src/WorkshopBooker.Application/Workshops/Commands/UpdateWorkshop/UpdateWorkshopCommand.cs
using MediatR;

namespace WorkshopBooker.Application.Workshops.Commands.UpdateWorkshop;

// Komenda do aktualizacji. Przesyła ID warsztatu do zaktualizowania
// oraz komplet nowych danych.
// Nie zwraca żadnej wartości (IRequest). Po prostu wykonuje akcję.
public record UpdateWorkshopCommand(
    Guid Id,
    string Name,
    string Description,
    string? PhoneNumber,
    string? Email,
    string? Address) : IRequest;
// src/WorkshopBooker.Application/Workshops/Queries/GetWorkshopById/GetWorkshopByIdQuery.cs
using MediatR;
using WorkshopBooker.Application.Workshops.Dtos;

namespace WorkshopBooker.Application.Workshops.Queries.GetWorkshopById;

// To zapytanie przyjmuje jeden parametr - Id warsztatu.
// Oczekuje w odpowiedzi jednego obiektu WorkshopDto.
// Zwracamy WorkshopDto?, ponieważ warsztat o danym ID może nie istnieć.
public record GetWorkshopByIdQuery(Guid Id) : IRequest<WorkshopDto?>;
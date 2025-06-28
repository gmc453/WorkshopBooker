// src/WorkshopBooker.Application/Workshops/Queries/GetWorkshops/GetWorkshopsQuery.cs
using MediatR;
using WorkshopBooker.Application.Workshops.Dtos;

namespace WorkshopBooker.Application.Workshops.Queries.GetWorkshops;

// To zapytanie nie potrzebuje żadnych parametrów.
// Implementuje IRequest<List<WorkshopDto>>, co oznacza:
// "Jestem zapytaniem, a w odpowiedzi oczekuję listy obiektów WorkshopDto".
public record GetWorkshopsQuery() : IRequest<List<WorkshopDto>>;
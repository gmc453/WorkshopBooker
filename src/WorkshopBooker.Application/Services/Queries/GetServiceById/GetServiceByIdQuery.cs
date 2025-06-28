// src/WorkshopBooker.Application/Services/Queries/GetServiceById/GetServiceByIdQuery.cs
using MediatR;
using WorkshopBooker.Application.Services.Dtos;

namespace WorkshopBooker.Application.Services.Queries.GetServiceById;

public record GetServiceByIdQuery(Guid WorkshopId, Guid Id) : IRequest<ServiceDto?>;

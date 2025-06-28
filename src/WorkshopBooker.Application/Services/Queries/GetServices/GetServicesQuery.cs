// src/WorkshopBooker.Application/Services/Queries/GetServices/GetServicesQuery.cs
using MediatR;
using WorkshopBooker.Application.Services.Dtos;

namespace WorkshopBooker.Application.Services.Queries.GetServices;

public record GetServicesQuery(Guid WorkshopId) : IRequest<List<ServiceDto>>;

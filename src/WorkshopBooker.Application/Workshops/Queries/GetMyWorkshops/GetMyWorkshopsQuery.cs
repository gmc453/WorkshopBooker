using MediatR;
using WorkshopBooker.Application.Workshops.Dtos;

namespace WorkshopBooker.Application.Workshops.Queries.GetMyWorkshops;

public record GetMyWorkshopsQuery() : IRequest<List<WorkshopDto>>; 
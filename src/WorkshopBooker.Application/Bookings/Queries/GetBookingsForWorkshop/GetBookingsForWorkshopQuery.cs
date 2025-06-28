using MediatR;
using WorkshopBooker.Application.Bookings.Dtos;

namespace WorkshopBooker.Application.Bookings.Queries.GetBookingsForWorkshop;

public record GetBookingsForWorkshopQuery(Guid WorkshopId) : IRequest<List<BookingDto>>;

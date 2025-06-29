using MediatR;
using WorkshopBooker.Application.Bookings.Dtos;

namespace WorkshopBooker.Application.Bookings.Queries.GetMyBookings;

public record GetMyBookingsQuery() : IRequest<List<BookingDto>>;

using MediatR;
using WorkshopBooker.Application.Bookings.Dtos;

namespace WorkshopBooker.Application.Bookings.Queries.GetMyWorkshopBookings;

public record GetMyWorkshopBookingsQuery() : IRequest<List<BookingDto>>; 
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Bookings.Dtos;
using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Application.Bookings.Queries.GetBookingsForWorkshop;

public class GetBookingsForWorkshopQueryHandler : IRequestHandler<GetBookingsForWorkshopQuery, List<BookingDto>>
{
    private readonly IApplicationDbContext _context;

    public GetBookingsForWorkshopQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BookingDto>> Handle(GetBookingsForWorkshopQuery request, CancellationToken cancellationToken)
    {
        var bookings = await _context.Bookings
            .Include(b => b.Service)
            .Where(b => b.Service.WorkshopId == request.WorkshopId)
            .Select(b => new BookingDto
            {
                Id = b.Id,
                BookingDateTime = b.BookingDateTime,
                Status = b.Status,
                ServiceId = b.ServiceId,
                ServiceName = b.Service.Name,
                ServicePrice = b.Service.Price
            })
            .ToListAsync(cancellationToken);

        return bookings;
    }
}

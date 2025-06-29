using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Slots.Dtos;

namespace WorkshopBooker.Application.Slots.Queries.GetSlots;

public class GetSlotsQueryHandler : IRequestHandler<GetSlotsQuery, List<AvailableSlotDto>>
{
    private readonly IApplicationDbContext _context;

    public GetSlotsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AvailableSlotDto>> Handle(GetSlotsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AvailableSlots
            .Where(s => s.WorkshopId == request.WorkshopId);

        if (request.DateFrom.HasValue)
            query = query.Where(s => s.StartTime >= request.DateFrom.Value);
        if (request.DateTo.HasValue)
            query = query.Where(s => s.EndTime <= request.DateTo.Value);

        return await query
            .Select(s => new AvailableSlotDto
            {
                Id = s.Id,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Status = s.Status
            })
            .ToListAsync(cancellationToken);
    }
}

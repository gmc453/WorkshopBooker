using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Slots.Dtos;
using WorkshopBooker.Application.Common.Constants;

namespace WorkshopBooker.Application.Slots.Queries.GetAvailableSlots;

public class GetAvailableSlotsQueryHandler : IRequestHandler<GetAvailableSlotsQuery, List<AvailableSlotDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAvailableSlotsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AvailableSlotDto>> Handle(GetAvailableSlotsQuery request, CancellationToken cancellationToken)
    {
        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == request.ServiceId && s.WorkshopId == request.WorkshopId && s.IsActive, cancellationToken);
        if (service == null)
        {
            return new List<AvailableSlotDto>();
        }

        var minimumStartTime = DateTime.UtcNow.AddHours(TimeConstants.MinimumBookingAdvanceHours);

        var query = _context.AvailableSlots
            .Where(s => s.WorkshopId == request.WorkshopId &&
                        s.Status == Domain.Entities.SlotStatus.Available &&
                        s.StartTime >= minimumStartTime);

        if (request.DateFrom.HasValue)
            query = query.Where(s => s.StartTime >= request.DateFrom.Value);
        if (request.DateTo.HasValue)
            query = query.Where(s => s.StartTime <= request.DateTo.Value);

        var slots = await query
            .Where(s => s.StartTime.AddMinutes(service.DurationInMinutes) <= s.EndTime)
            .OrderBy(s => s.StartTime)
            .ToListAsync(cancellationToken);

        return slots.Select(s => new AvailableSlotDto
        {
            Id = s.Id,
            StartTime = s.StartTime,
            EndTime = s.StartTime.AddMinutes(service.DurationInMinutes),
            Status = s.Status,
            WorkshopId = s.WorkshopId,
            IsAvailable = s.Status == Domain.Entities.SlotStatus.Available
        }).ToList();
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;
using WorkshopBooker.Application.Slots.Dtos;

namespace WorkshopBooker.Application.Slots.Queries.GetSlots;

public class GetSlotsQueryHandler : IRequestHandler<GetSlotsQuery, List<AvailableSlotDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public GetSlotsQueryHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<List<AvailableSlotDto>> Handle(GetSlotsQuery request, CancellationToken cancellationToken)
    {
        // Sprawdź czy użytkownik jest zalogowany
        if (_currentUserProvider.UserId is null)
        {
            throw new UnauthenticatedUserException();
        }

        // Sprawdź czy warsztat istnieje i czy użytkownik jest jego właścicielem
        var workshop = await _context.Workshops
            .FirstOrDefaultAsync(w => w.Id == request.WorkshopId, cancellationToken);

        if (workshop is null)
        {
            throw new WorkshopNotFoundException();
        }

        if (workshop.UserId != _currentUserProvider.UserId)
        {
            throw new WorkshopBooker.Application.Common.Exceptions.UnauthorizedAccessException("Brak uprawnień do przeglądania slotów tego warsztatu");
        }

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
                Status = s.Status,
                WorkshopId = s.WorkshopId,
                IsAvailable = s.Status == Domain.Entities.SlotStatus.Available
            })
            .ToListAsync(cancellationToken);
    }
}

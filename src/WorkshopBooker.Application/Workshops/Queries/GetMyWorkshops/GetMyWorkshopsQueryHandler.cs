using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;
using WorkshopBooker.Application.Workshops.Dtos;

namespace WorkshopBooker.Application.Workshops.Queries.GetMyWorkshops;

public class GetMyWorkshopsQueryHandler : IRequestHandler<GetMyWorkshopsQuery, List<WorkshopDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public GetMyWorkshopsQueryHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<List<WorkshopDto>> Handle(GetMyWorkshopsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserProvider.UserId;
        if (userId is null)
        {
            throw new UnauthenticatedUserException();
        }

        var workshops = await _context.Workshops
            .Where(w => w.UserId == userId.Value)
            .Select(w => new WorkshopDto
            {
                Id = w.Id,
                Name = w.Name,
                Description = w.Description,
                Address = w.Address
            })
            .ToListAsync(cancellationToken);

        return workshops;
    }
} 
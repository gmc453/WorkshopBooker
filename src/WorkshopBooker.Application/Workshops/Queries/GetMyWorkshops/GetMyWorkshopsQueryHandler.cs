using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common.Exceptions;
using WorkshopBooker.Application.Workshops.Dtos;
using WorkshopBooker.Application.Services.Dtos;

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

        // ✅ POPRAWKA: Dodano Include dla Services
        var workshops = await _context.Workshops
            .Include(w => w.Services) // ✅ Dołączamy usługi do zapytania
            .Where(w => w.UserId == userId.Value)
            .Select(w => new WorkshopDto
            {
                Id = w.Id,
                Name = w.Name,
                Description = w.Description,
                Address = w.Address,
                PhoneNumber = w.PhoneNumber,
                Email = w.Email,
                IsActive = w.IsActive,
                // ✅ POPRAWKA: Dodano mapowanie Services
                Services = w.Services.Where(s => s.IsActive).Select(s => new ServiceDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    Price = s.Price,
                    DurationInMinutes = s.DurationInMinutes,
                    Category = s.Category,
                    IsPopular = s.IsPopular,
                    IsActive = s.IsActive,
                    RequiredEquipment = s.RequiredEquipment,
                    PreparationInstructions = s.PreparationInstructions
                }).ToList()
            })
            .ToListAsync(cancellationToken);

        return workshops;
    }
}
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Rentals.Commands.CreateRentalReservation;

public class CreateRentalReservationCommandHandler : IRequestHandler<CreateRentalReservationCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public CreateRentalReservationCommandHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<Result<Guid>> Handle(CreateRentalReservationCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserProvider.UserId;
        if (userId is null)
        {
            return Result<Guid>.Failure("User must be authenticated");
        }

        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == request.VehicleId, cancellationToken);
        if (vehicle == null || vehicle.Status != VehicleStatus.Available)
        {
            return Result<Guid>.Failure("Vehicle not available");
        }

        vehicle.SetStatus(VehicleStatus.Rented);

        var reservation = new RentalReservation(Guid.NewGuid(), request.VehicleId, userId.Value, request.StartDate, request.EndDate);
        _context.RentalReservations.Add(reservation);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(reservation.Id);
    }
}

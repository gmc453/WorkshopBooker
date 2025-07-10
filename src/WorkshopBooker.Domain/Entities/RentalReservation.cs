using System;

namespace WorkshopBooker.Domain.Entities;

public enum ReservationStatus
{
    Reserved,
    Cancelled,
    Completed
}

public class RentalReservation
{
    public Guid Id { get; private set; }
    public Guid VehicleId { get; private set; }
    public Vehicle Vehicle { get; private set; } = null!;
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public ReservationStatus Status { get; private set; }

    private RentalReservation() { }

    public RentalReservation(Guid id, Guid vehicleId, Guid userId, DateTime startDate, DateTime endDate)
    {
        Id = id;
        VehicleId = vehicleId;
        UserId = userId;
        StartDate = startDate;
        EndDate = endDate;
        Status = ReservationStatus.Reserved;
    }

    public void Cancel()
    {
        Status = ReservationStatus.Cancelled;
    }

    public void Complete()
    {
        Status = ReservationStatus.Completed;
    }
}

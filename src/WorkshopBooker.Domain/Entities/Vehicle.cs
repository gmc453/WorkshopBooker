using System;

namespace WorkshopBooker.Domain.Entities;

public enum VehicleStatus
{
    Available,
    Rented,
    Maintenance
}

public class Vehicle
{
    public Guid Id { get; private set; }
    public string Make { get; private set; } = null!;
    public string Model { get; private set; } = null!;
    public string LicensePlate { get; private set; } = null!;
    public int Year { get; private set; }
    public VehicleStatus Status { get; private set; }
    public string? CurrentLocation { get; private set; }

    public Guid? WorkshopId { get; private set; }
    public Workshop? Workshop { get; private set; }

    private Vehicle() { }

    public Vehicle(Guid id, string make, string model, string licensePlate, int year, string? currentLocation = null, Guid? workshopId = null)
    {
        Id = id;
        Make = make;
        Model = model;
        LicensePlate = licensePlate;
        Year = year;
        Status = VehicleStatus.Available;
        CurrentLocation = currentLocation;
        WorkshopId = workshopId;
    }

    public void UpdateLocation(string? location)
    {
        CurrentLocation = location;
    }

    public void SetStatus(VehicleStatus status)
    {
        Status = status;
    }
}

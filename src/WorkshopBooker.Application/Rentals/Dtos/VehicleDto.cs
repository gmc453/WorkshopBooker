using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Rentals.Dtos;

public record VehicleDto
{
    public Guid Id { get; init; }
    public required string Make { get; init; }
    public required string Model { get; init; }
    public required string LicensePlate { get; init; }
    public int Year { get; init; }
    public bool IsAvailable { get; init; }
    public string? CurrentLocation { get; init; }
}

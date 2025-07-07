// src/WorkshopBooker.Application/Services/Dtos/ServiceDto.cs

using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Services.Dtos;

// Publiczny kontrakt na dane usługi
public record ServiceDto
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public decimal Price { get; init; }
    public int DurationInMinutes { get; init; }
    public ServiceCategory Category { get; init; }
    public bool IsPopular { get; init; }
    public bool IsActive { get; init; }
    public List<string> RequiredEquipment { get; init; } = new();
    public string? PreparationInstructions { get; init; }
}

// src/WorkshopBooker.Application/Services/Dtos/ServiceDto.cs

namespace WorkshopBooker.Application.Services.Dtos;

// Publiczny kontrakt na dane usługi
public record ServiceDto
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public decimal Price { get; init; }
    public int DurationInMinutes { get; init; }
}

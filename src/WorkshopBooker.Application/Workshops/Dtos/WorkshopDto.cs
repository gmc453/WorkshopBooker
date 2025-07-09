// src/WorkshopBooker.Application/Workshops/Dtos/WorkshopDto.cs

using WorkshopBooker.Application.Services.Dtos;

namespace WorkshopBooker.Application.Workshops.Dtos;

// To jest publiczny kontrakt naszej aplikacji.
// Zwracamy tylko te dane, które są potrzebne na liście warsztatów.
public record WorkshopDto
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public string? Address { get; init; }
    public string? PhoneNumber { get; init; }
    public string? Email { get; init; }
    public bool IsActive { get; init; }
    public List<ServiceDto> Services { get; init; } = new();
}
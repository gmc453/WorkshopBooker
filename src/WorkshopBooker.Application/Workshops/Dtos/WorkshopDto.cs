// src/WorkshopBooker.Application/Workshops/Dtos/WorkshopDto.cs

namespace WorkshopBooker.Application.Workshops.Dtos;

// To jest publiczny kontrakt naszej aplikacji.
// Zwracamy tylko te dane, które są potrzebne na liście warsztatów.
public record WorkshopDto
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public string? Address { get; init; }
}
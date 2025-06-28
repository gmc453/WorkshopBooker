// src/WorkshopBooker.Domain/Entities/Service.cs
namespace WorkshopBooker.Domain.Entities;

public class Service
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }

    // W przyszłości można to rozbudować o bardziej złożony model ceny
    public decimal Price { get; private set; }

    // Czas trwania usługi w minutach
    public int DurationInMinutes { get; private set; }

    // --- Kluczowa część: Relacja do Warsztatu ---

    // To jest klucz obcy (foreign key), który będzie w bazie danych.
    public Guid WorkshopId { get; private set; }

    // To jest właściwość nawigacyjna, która pozwala EF Core "załadować"
    // cały obiekt warsztatu, do którego należy ta usługa.
    public Workshop Workshop { get; private set; } = null!;

    // Prywatny konstruktor dla EF Core
    private Service() { }

    // Publiczny konstruktor do tworzenia nowej usługi
    public Service(Guid id, string name, decimal price, int durationInMinutes, Guid workshopId)
    {
        Id = id;
        Name = name;
        Price = price;
        DurationInMinutes = durationInMinutes;
        WorkshopId = workshopId;
    }

    // Metoda do aktualizacji
    public void Update(string name, string? description, decimal price, int durationInMinutes)
    {
        Name = name;
        Description = description;
        Price = price;
        DurationInMinutes = durationInMinutes;
    }
}
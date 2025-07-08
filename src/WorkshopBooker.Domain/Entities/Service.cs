// src/WorkshopBooker.Domain/Entities/Service.cs
namespace WorkshopBooker.Domain.Entities;

public enum ServiceCategory
{
    Maintenance,     // Konserwacja
    Repair,          // Naprawa
    Diagnostic,      // Diagnostyka
    TireService,     // Usługi opon
    Electrical,      // Elektryka
    Bodywork,        // Blacharka
    Other            // Inne
}

public class Service
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public decimal Price { get; private set; }
    public int DurationInMinutes { get; private set; }
    public Guid WorkshopId { get; private set; }
    public bool IsActive { get; private set; } = true;
    
    // Nowe pola
    public string? ImageUrl { get; private set; }
    public List<string> RequiredEquipment { get; private set; } = new();
    public ServiceCategory Category { get; private set; }
    public bool IsPopular { get; private set; }
    public string? PreparationInstructions { get; private set; }
    public double AverageRating { get; private set; }
    public int ReviewCount { get; private set; }

    // Navigation properties
    public Workshop Workshop { get; private set; } = null!;

    private Service() { }

    public Service(Guid id, string name, decimal price, int durationInMinutes, Guid workshopId, 
                   ServiceCategory category = ServiceCategory.Other, string? description = null)
    {
        Id = id;
        Name = name;
        Price = price;
        DurationInMinutes = durationInMinutes;
        WorkshopId = workshopId;
        Category = category;
        Description = description;
    }

    public void Update(string name, string? description, decimal price, int durationInMinutes, 
                      ServiceCategory category, string? imageUrl = null, string? preparationInstructions = null)
    {
        Name = name;
        Description = description;
        Price = price;
        DurationInMinutes = durationInMinutes;
        Category = category;
        ImageUrl = imageUrl;
        PreparationInstructions = preparationInstructions;
    }

    public void SetPopular(bool isPopular)
    {
        IsPopular = isPopular;
    }

    public void AddRequiredEquipment(string equipment)
    {
        if (!RequiredEquipment.Contains(equipment))
            RequiredEquipment.Add(equipment);
    }

    public void RemoveRequiredEquipment(string equipment)
    {
        RequiredEquipment.Remove(equipment);
    }

    public void UpdateRating(double averageRating, int reviewCount)
    {
        AverageRating = averageRating;
        ReviewCount = reviewCount;
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}
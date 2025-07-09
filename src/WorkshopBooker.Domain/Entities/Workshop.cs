// src/WorkshopBooker.Domain/Entities/Workshop.cs

namespace WorkshopBooker.Domain.Entities;

public class Workshop
{
    // Klucz główny. Używamy Guid, ponieważ jest globalnie unikalny, 
    // co jest świetne dla systemów rozproszonych i API.
    public Guid Id { get; private set; }

    // Nazwa warsztatu - wymagana.
    public string Name { get; private set; } = null!;

    // Opis warsztatu - może być dłuższy.
    public string Description { get; private set; } = null!;

    // Dane kontaktowe i adresowe - na razie jako proste stringi,
    // w przyszłości można rozbić na osobne obiekty (Value Objects).
    public string? PhoneNumber { get; private set; }
    public string? Email { get; private set; }
    public string? Address { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Daty audytowe - dobra praktyka, by wiedzieć kiedy rekord powstał i był modyfikowany.
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    // Relacja do użytkownika (właściciela warsztatu)
    public Guid? UserId { get; private set; }
    public User? User { get; private set; }
    
    // Kolekcja usług oferowanych przez warsztat
    public ICollection<Service> Services { get; private set; } = new List<Service>();

    // Prywatny konstruktor dla Entity Framework Core
    private Workshop() { }

    // Publiczny konstruktor do tworzenia nowych warsztatów w kodzie.
    // Gwarantuje, że warsztat zawsze będzie miał ID i nazwę.
    public Workshop(Guid id, string name, string description)
    {
        Id = id;
        Name = name;
        Description = description;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    // Metoda do aktualizacji danych warsztatu
    public void Update(string name, string description, string? phoneNumber, string? email, string? address)
    {
        Name = name;
        Description = description;
        PhoneNumber = phoneNumber;
        Email = email;
        Address = address;
        UpdatedAt = DateTime.UtcNow;
    }

    // Metoda do przypisania właściciela warsztatu
    public void AssignOwner(Guid userId)
    {
        UserId = userId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    // Publiczna metoda do ustawiania danych kontaktowych
    public void SetContactData(string? phoneNumber, string? email, string? address)
    {
        PhoneNumber = phoneNumber;
        Email = email;
        Address = address;
        UpdatedAt = DateTime.UtcNow;
    }
}
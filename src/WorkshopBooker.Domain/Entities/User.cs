// src/WorkshopBooker.Domain/Entities/User.cs
namespace WorkshopBooker.Domain.Entities;

public class User
{
    public Guid Id { get; private set; }
    public string Email { get; private set; } = null!;
    public string HashedPassword { get; private set; } = null!;
    public string FirstName { get; private set; } = null!;
    public string LastName { get; private set; } = null!;
    public string Role { get; private set; } = null!;
    public DateTime CreatedAt { get; private set; }

    // Relacja do warsztatów, które należą do tego użytkownika
    public virtual ICollection<Workshop> Workshops { get; private set; } = new List<Workshop>();

    private User() { }

    public User(Guid id, string email, string hashedPassword, string firstName, string lastName)
    {
        Id = id;
        Email = email;
        HashedPassword = hashedPassword;
        FirstName = firstName;
        LastName = lastName;
        Role = "Client"; // Domyślna rola
        CreatedAt = DateTime.UtcNow;
    }
}

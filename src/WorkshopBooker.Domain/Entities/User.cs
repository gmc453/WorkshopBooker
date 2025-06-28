// src/WorkshopBooker.Domain/Entities/User.cs
namespace WorkshopBooker.Domain.Entities;

public class User
{
    public Guid Id { get; private set; }
    public string Email { get; private set; } = null!;
    public string HashedPassword { get; private set; } = null!;
    public string Role { get; private set; } = null!;

    private User() { }

    public User(Guid id, string email, string hashedPassword, string role)
    {
        Id = id;
        Email = email;
        HashedPassword = hashedPassword;
        Role = role;
    }
}

using System;
using AutoFixture;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Tests.Common.TestDataBuilders;

/// <summary>
/// Builder pattern dla tworzenia danych testowych użytkowników
/// </summary>
public class UserBuilder
{
    private readonly Fixture _fixture;
    private Guid _id = Guid.NewGuid();
    private string _email = "test@example.com";
    private string _hashedPassword = "hashedPassword123";
    private string _firstName = "Test";
    private string _lastName = "User";
    private DateTime _createdAt = DateTime.UtcNow;
    private DateTime _updatedAt = DateTime.UtcNow;

    public UserBuilder(Fixture fixture)
    {
        _fixture = fixture;
    }

    public UserBuilder WithId(Guid id)
    {
        _id = id;
        return this;
    }

    public UserBuilder WithEmail(string email)
    {
        _email = email;
        return this;
    }

    public UserBuilder WithHashedPassword(string hashedPassword)
    {
        _hashedPassword = hashedPassword;
        return this;
    }

    public UserBuilder WithFirstName(string firstName)
    {
        _firstName = firstName;
        return this;
    }

    public UserBuilder WithLastName(string lastName)
    {
        _lastName = lastName;
        return this;
    }

    public UserBuilder WithCreatedAt(DateTime createdAt)
    {
        _createdAt = createdAt;
        return this;
    }

    public UserBuilder WithUpdatedAt(DateTime updatedAt)
    {
        _updatedAt = updatedAt;
        return this;
    }

    public UserBuilder WithInvalidEmail()
    {
        _email = "invalid-email";
        return this;
    }

    public UserBuilder WithEmptyName()
    {
        _firstName = "";
        _lastName = "";
        return this;
    }

    public UserBuilder WithShortPassword()
    {
        _hashedPassword = "123";
        return this;
    }

    public User Build()
    {
        return new User(
            _id,
            _email,
            _hashedPassword,
            _firstName,
            _lastName
        );
    }

    public UserBuilder WithValidData()
    {
        return this
            .WithEmail("jan.kowalski@example.com")
            .WithFirstName("Jan")
            .WithLastName("Kowalski");
    }

    public UserBuilder WithInvalidData()
    {
        return this
            .WithInvalidEmail()
            .WithEmptyName()
            .WithShortPassword();
    }
} 
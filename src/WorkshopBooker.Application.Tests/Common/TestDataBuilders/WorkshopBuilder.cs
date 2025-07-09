using System;
using AutoFixture;
using WorkshopBooker.Application.Workshops.Commands.CreateWorkshop;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Tests.Common.TestDataBuilders;

/// <summary>
/// Builder pattern dla tworzenia danych testowych warsztatów
/// </summary>
public class WorkshopBuilder
{
    private readonly Fixture _fixture;
    private string _name = "Test Warsztat";
    private string _description = "Opis testowego warsztatu o długości co najmniej 10 znaków";
    private string _phoneNumber = "+48123456789";
    private string _email = "test@workshop.com";
    private string _address = "ul. Testowa 1, Warszawa";
    private Guid? _userId = Guid.NewGuid();
    private bool _isActive = true;
    private DateTime _createdAt = DateTime.UtcNow;
    private DateTime _updatedAt = DateTime.UtcNow;

    public WorkshopBuilder(Fixture fixture)
    {
        _fixture = fixture;
    }

    public WorkshopBuilder WithName(string name)
    {
        _name = name;
        return this;
    }

    public WorkshopBuilder WithDescription(string description)
    {
        _description = description;
        return this;
    }

    public WorkshopBuilder WithPhoneNumber(string phoneNumber)
    {
        _phoneNumber = phoneNumber;
        return this;
    }

    public WorkshopBuilder WithEmail(string email)
    {
        _email = email;
        return this;
    }

    public WorkshopBuilder WithAddress(string address)
    {
        _address = address;
        return this;
    }

    public WorkshopBuilder WithUserId(Guid? userId)
    {
        _userId = userId;
        return this;
    }

    public WorkshopBuilder WithIsActive(bool isActive)
    {
        _isActive = isActive;
        return this;
    }

    public WorkshopBuilder WithCreatedAt(DateTime createdAt)
    {
        _createdAt = createdAt;
        return this;
    }

    public WorkshopBuilder WithUpdatedAt(DateTime updatedAt)
    {
        _updatedAt = updatedAt;
        return this;
    }

    public WorkshopBuilder AsInactive()
    {
        _isActive = false;
        return this;
    }

    public WorkshopBuilder WithShortDescription()
    {
        _description = "Krótki";
        return this;
    }

    public WorkshopBuilder WithInvalidEmail()
    {
        _email = "invalid-email";
        return this;
    }

    public WorkshopBuilder WithInvalidPhoneNumber()
    {
        _phoneNumber = "invalid-phone";
        return this;
    }

    public WorkshopBuilder WithoutUser()
    {
        _userId = null;
        return this;
    }

    public CreateWorkshopCommand BuildCommand()
    {
        return new CreateWorkshopCommand(
            _name,
            _description,
            _phoneNumber,
            _email,
            _address
        );
    }

    public Workshop BuildEntity()
    {
        return new Workshop(
            Guid.NewGuid(),
            _name,
            _description,
            _phoneNumber,
            _email,
            _address,
            _userId,
            _isActive,
            _createdAt,
            _updatedAt
        );
    }

    public WorkshopBuilder WithValidData()
    {
        return this
            .WithName("Warsztat Mechaniczny Premium")
            .WithDescription("Profesjonalny warsztat mechaniczny oferujący kompleksowe usługi naprawcze")
            .WithPhoneNumber("+48123456789")
            .WithEmail("kontakt@warsztat-premium.pl")
            .WithAddress("ul. Przemysłowa 15, Warszawa");
    }

    public WorkshopBuilder WithInvalidData()
    {
        return this
            .WithName("")
            .WithDescription("Krótki")
            .WithPhoneNumber("invalid")
            .WithEmail("invalid-email")
            .WithAddress("");
    }
} 
using System;
using AutoFixture;
using WorkshopBooker.Application.Bookings.Commands.CreateBooking;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Tests.Common.TestDataBuilders;

/// <summary>
/// Builder pattern dla tworzenia danych testowych rezerwacji
/// </summary>
public class BookingBuilder
{
    private readonly Fixture _fixture;
    private Guid _id = Guid.NewGuid();
    private Guid _slotId = Guid.NewGuid();
    private Guid _serviceId = Guid.NewGuid();
    private Guid _workshopId = Guid.NewGuid();
    private Guid? _userId = Guid.NewGuid();
    private string _customerName = "Jan Kowalski";
    private string _customerEmail = "jan.kowalski@example.com";
    private string _customerPhone = "+48123456789";
    private string _notes = "Testowa rezerwacja";
    private BookingStatus _status = BookingStatus.Pending;
    private DateTime _createdAt = DateTime.UtcNow;
    private DateTime _updatedAt = DateTime.UtcNow;

    public BookingBuilder(Fixture fixture)
    {
        _fixture = fixture;
    }

    public BookingBuilder WithId(Guid id)
    {
        _id = id;
        return this;
    }

    public BookingBuilder WithSlotId(Guid slotId)
    {
        _slotId = slotId;
        return this;
    }

    public BookingBuilder WithServiceId(Guid serviceId)
    {
        _serviceId = serviceId;
        return this;
    }

    public BookingBuilder WithWorkshopId(Guid workshopId)
    {
        _workshopId = workshopId;
        return this;
    }

    public BookingBuilder WithUserId(Guid? userId)
    {
        _userId = userId;
        return this;
    }

    public BookingBuilder WithCustomerName(string customerName)
    {
        _customerName = customerName;
        return this;
    }

    public BookingBuilder WithCustomerEmail(string customerEmail)
    {
        _customerEmail = customerEmail;
        return this;
    }

    public BookingBuilder WithCustomerPhone(string customerPhone)
    {
        _customerPhone = customerPhone;
        return this;
    }

    public BookingBuilder WithNotes(string notes)
    {
        _notes = notes;
        return this;
    }

    public BookingBuilder WithStatus(BookingStatus status)
    {
        _status = status;
        return this;
    }

    public BookingBuilder WithCreatedAt(DateTime createdAt)
    {
        _createdAt = createdAt;
        return this;
    }

    public BookingBuilder WithUpdatedAt(DateTime updatedAt)
    {
        _updatedAt = updatedAt;
        return this;
    }

    public BookingBuilder AsConfirmed()
    {
        _status = BookingStatus.Confirmed;
        return this;
    }

    public BookingBuilder AsCancelled()
    {
        _status = BookingStatus.Cancelled;
        return this;
    }

    public BookingBuilder WithInvalidCustomerName()
    {
        _customerName = "";
        return this;
    }

    public BookingBuilder WithInvalidCustomerEmail()
    {
        _customerEmail = "invalid-email";
        return this;
    }

    public BookingBuilder WithInvalidCustomerPhone()
    {
        _customerPhone = "invalid-phone";
        return this;
    }

    public BookingBuilder WithoutUser()
    {
        _userId = null;
        return this;
    }

    public CreateBookingCommand BuildCommand()
    {
        return new CreateBookingCommand(
            _slotId,
            _serviceId,
            _customerName,
            _customerEmail,
            _customerPhone,
            _notes
        );
    }

    public Booking BuildEntity()
    {
        return new Booking(
            _id,
            _slotId,
            _serviceId,
            _workshopId,
            _userId,
            _customerName,
            _customerEmail,
            _customerPhone,
            _notes,
            _status,
            _createdAt,
            _updatedAt
        );
    }

    public BookingBuilder WithValidData()
    {
        return this
            .WithCustomerName("Anna Nowak")
            .WithCustomerEmail("anna.nowak@example.com")
            .WithCustomerPhone("+48987654321")
            .WithNotes("Rezerwacja na wymianę oleju");
    }

    public BookingBuilder WithInvalidData()
    {
        return this
            .WithInvalidCustomerName()
            .WithInvalidCustomerEmail()
            .WithInvalidCustomerPhone();
    }
} 
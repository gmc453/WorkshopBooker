using System;
using AutoFixture;
using WorkshopBooker.Application.Slots.Commands.CreateSlot;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Tests.Common.TestDataBuilders;

/// <summary>
/// Builder pattern dla tworzenia danych testowych slotów
/// </summary>
public class SlotBuilder
{
    private readonly Fixture _fixture;
    private Guid _id = Guid.NewGuid();
    private Guid _workshopId = Guid.NewGuid();
    private DateTime _startTime = DateTime.UtcNow.AddHours(2);
    private DateTime _endTime = DateTime.UtcNow.AddHours(3);
    private SlotStatus _status = SlotStatus.Available;
    private DateTime _createdAt = DateTime.UtcNow;
    private DateTime _updatedAt = DateTime.UtcNow;

    public SlotBuilder(Fixture fixture)
    {
        _fixture = fixture;
    }

    public SlotBuilder WithId(Guid id)
    {
        _id = id;
        return this;
    }

    public SlotBuilder WithWorkshopId(Guid workshopId)
    {
        _workshopId = workshopId;
        return this;
    }

    public SlotBuilder WithStartTime(DateTime startTime)
    {
        _startTime = startTime;
        return this;
    }

    public SlotBuilder WithEndTime(DateTime endTime)
    {
        _endTime = endTime;
        return this;
    }

    public SlotBuilder WithStatus(SlotStatus status)
    {
        _status = status;
        return this;
    }

    public SlotBuilder WithCreatedAt(DateTime createdAt)
    {
        _createdAt = createdAt;
        return this;
    }

    public SlotBuilder WithUpdatedAt(DateTime updatedAt)
    {
        _updatedAt = updatedAt;
        return this;
    }

    public SlotBuilder AsBooked()
    {
        _status = SlotStatus.Booked;
        return this;
    }

    public SlotBuilder AsCancelled()
    {
        _status = SlotStatus.Cancelled;
        return this;
    }

    public SlotBuilder WithPastTime()
    {
        _startTime = DateTime.UtcNow.AddHours(-2);
        _endTime = DateTime.UtcNow.AddHours(-1);
        return this;
    }

    public SlotBuilder WithOverlappingTime()
    {
        _startTime = DateTime.UtcNow.AddHours(1);
        _endTime = DateTime.UtcNow.AddHours(4);
        return this;
    }

    public SlotBuilder WithShortDuration()
    {
        _endTime = _startTime.AddMinutes(15);
        return this;
    }

    public SlotBuilder WithLongDuration()
    {
        _endTime = _startTime.AddHours(4);
        return this;
    }

    public CreateSlotCommand BuildCommand()
    {
        return new CreateSlotCommand(
            _workshopId,
            _startTime,
            _endTime
        );
    }

    public AvailableSlot BuildEntity()
    {
        return new AvailableSlot(
            _id,
            _workshopId,
            _startTime,
            _endTime,
            _status,
            _createdAt,
            _updatedAt
        );
    }

    public SlotBuilder WithValidData()
    {
        return this
            .WithStartTime(DateTime.UtcNow.AddHours(2))
            .WithEndTime(DateTime.UtcNow.AddHours(3));
    }

    public SlotBuilder WithInvalidData()
    {
        return this
            .WithPastTime()
            .WithShortDuration();
    }
} 
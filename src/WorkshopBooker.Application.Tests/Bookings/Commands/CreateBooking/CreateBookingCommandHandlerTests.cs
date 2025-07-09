using System;
using System.Threading;
using System.Threading.Tasks;
using AutoFixture;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using WorkshopBooker.Application.Bookings.Commands.CreateBooking;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Domain.Entities;
using WorkshopBooker.Application.Tests.Common.TestDataBuilders;
using Xunit;

namespace WorkshopBooker.Application.Tests.Bookings.Commands.CreateBooking;

public class CreateBookingCommandHandlerTests
{
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<ICurrentUserProvider> _mockCurrentUserProvider;
    private readonly Mock<ILogger<CreateBookingCommandHandler>> _mockLogger;
    private readonly CreateBookingCommandHandler _handler;
    private readonly Fixture _fixture;
    private readonly BookingBuilder _bookingBuilder;
    private readonly SlotBuilder _slotBuilder;
    private readonly WorkshopBuilder _workshopBuilder;

    public CreateBookingCommandHandlerTests()
    {
        _mockContext = new Mock<IApplicationDbContext>();
        _mockCurrentUserProvider = new Mock<ICurrentUserProvider>();
        _mockLogger = new Mock<ILogger<CreateBookingCommandHandler>>();
        _handler = new CreateBookingCommandHandler(_mockContext.Object, _mockCurrentUserProvider.Object, _mockLogger.Object);
        _fixture = new Fixture();
        _bookingBuilder = new BookingBuilder(_fixture);
        _slotBuilder = new SlotBuilder(_fixture);
        _workshopBuilder = new WorkshopBuilder(_fixture);
    }

    [Fact]
    public async Task Should_CreateBooking_When_ValidCommand()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _bookingBuilder.WithValidData().BuildCommand();
        var slot = _slotBuilder.WithValidData().BuildEntity();
        var workshop = _workshopBuilder.WithValidData().BuildEntity();

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.AvailableSlots).Returns(MockDbSet(slot));
        _mockContext.Setup(x => x.Workshops).Returns(MockDbSet(workshop));
        _mockContext.Setup(x => x.Bookings).Returns(MockDbSet<Booking>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
        
        _mockContext.Verify(x => x.Bookings.Add(It.Is<Booking>(b => 
            b.SlotId == command.SlotId && 
            b.ServiceId == command.ServiceId &&
            b.CustomerName == command.CustomerName &&
            b.CustomerEmail == command.CustomerEmail &&
            b.CustomerPhone == command.CustomerPhone &&
            b.Notes == command.Notes &&
            b.Status == BookingStatus.Pending)), Times.Once);
        _mockContext.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Should_ThrowValidationException_When_CustomerNameIsEmpty()
    {
        // Arrange
        var command = _bookingBuilder.WithInvalidCustomerName().BuildCommand();

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Imię i nazwisko klienta jest wymagane");
    }

    [Fact]
    public async Task Should_ThrowValidationException_When_CustomerEmailIsInvalid()
    {
        // Arrange
        var command = _bookingBuilder.WithInvalidCustomerEmail().BuildCommand();

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Nieprawidłowy format adresu email");
    }

    [Fact]
    public async Task Should_ThrowValidationException_When_CustomerPhoneIsInvalid()
    {
        // Arrange
        var command = _bookingBuilder.WithInvalidCustomerPhone().BuildCommand();

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Nieprawidłowy format numeru telefonu");
    }

    [Fact]
    public async Task Should_ThrowUnauthorizedException_When_UserNotAuthenticated()
    {
        // Arrange
        var command = _bookingBuilder.WithValidData().BuildCommand();
        _mockCurrentUserProvider.Setup(x => x.UserId).Returns((Guid?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Użytkownik musi być zalogowany");
    }

    [Fact]
    public async Task Should_ThrowBusinessException_When_SlotNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _bookingBuilder.WithValidData().BuildCommand();

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.AvailableSlots).Returns(MockDbSet<AvailableSlot>());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Slot nie został znaleziony");
    }

    [Fact]
    public async Task Should_ThrowBusinessException_When_SlotIsNotAvailable()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _bookingBuilder.WithValidData().BuildCommand();
        var slot = _slotBuilder.AsBooked().BuildEntity();

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.AvailableSlots).Returns(MockDbSet(slot));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Slot nie jest dostępny");
    }

    [Fact]
    public async Task Should_ThrowBusinessException_When_SlotIsInPast()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _bookingBuilder.WithValidData().BuildCommand();
        var slot = _slotBuilder.WithPastTime().BuildEntity();

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.AvailableSlots).Returns(MockDbSet(slot));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Nie można rezerwować slotów w przeszłości");
    }

    [Fact]
    public async Task Should_ThrowBusinessException_When_ServiceNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _bookingBuilder.WithValidData().BuildCommand();
        var slot = _slotBuilder.WithValidData().BuildEntity();

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.AvailableSlots).Returns(MockDbSet(slot));
        _mockContext.Setup(x => x.Services).Returns(MockDbSet<Service>());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Usługa nie została znaleziona");
    }

    [Fact]
    public async Task Should_ThrowBusinessException_When_ServiceIsInactive()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _bookingBuilder.WithValidData().BuildCommand();
        var slot = _slotBuilder.WithValidData().BuildEntity();
        var service = new Service(Guid.NewGuid(), "Test Service", "Test Description", 60, 100.0m, false);

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.AvailableSlots).Returns(MockDbSet(slot));
        _mockContext.Setup(x => x.Services).Returns(MockDbSet(service));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Usługa nie jest aktywna");
    }

    [Fact]
    public async Task Should_ThrowBusinessException_When_SlotDurationTooShort()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _bookingBuilder.WithValidData().BuildCommand();
        var slot = _slotBuilder.WithShortDuration().BuildEntity();
        var service = new Service(Guid.NewGuid(), "Test Service", "Test Description", 120, 100.0m, true);

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.AvailableSlots).Returns(MockDbSet(slot));
        _mockContext.Setup(x => x.Services).Returns(MockDbSet(service));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Slot jest za krótki dla tej usługi");
    }

    [Fact]
    public async Task Should_SetCorrectCreationDate_When_CreatingBooking()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _bookingBuilder.WithValidData().BuildCommand();
        var slot = _slotBuilder.WithValidData().BuildEntity();
        var service = new Service(Guid.NewGuid(), "Test Service", "Test Description", 60, 100.0m, true);
        var beforeCreation = DateTime.UtcNow;

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.AvailableSlots).Returns(MockDbSet(slot));
        _mockContext.Setup(x => x.Services).Returns(MockDbSet(service));
        _mockContext.Setup(x => x.Bookings).Returns(MockDbSet<Booking>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        
        _mockContext.Verify(x => x.Bookings.Add(It.Is<Booking>(b => 
            b.CreatedAt >= beforeCreation &&
            b.CreatedAt <= DateTime.UtcNow)), Times.Once);
    }

    [Fact]
    public async Task Should_SetBookingStatusAsPending_When_CreatingBooking()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _bookingBuilder.WithValidData().BuildCommand();
        var slot = _slotBuilder.WithValidData().BuildEntity();
        var service = new Service(Guid.NewGuid(), "Test Service", "Test Description", 60, 100.0m, true);

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.AvailableSlots).Returns(MockDbSet(slot));
        _mockContext.Setup(x => x.Services).Returns(MockDbSet(service));
        _mockContext.Setup(x => x.Bookings).Returns(MockDbSet<Booking>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        
        _mockContext.Verify(x => x.Bookings.Add(It.Is<Booking>(b => 
            b.Status == BookingStatus.Pending)), Times.Once);
    }

    [Fact]
    public async Task Should_UpdateSlotStatusToBooked_When_CreatingBooking()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _bookingBuilder.WithValidData().BuildCommand();
        var slot = _slotBuilder.WithValidData().BuildEntity();
        var service = new Service(Guid.NewGuid(), "Test Service", "Test Description", 60, 100.0m, true);

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.AvailableSlots).Returns(MockDbSet(slot));
        _mockContext.Setup(x => x.Services).Returns(MockDbSet(service));
        _mockContext.Setup(x => x.Bookings).Returns(MockDbSet<Booking>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        
        _mockContext.Verify(x => x.AvailableSlots.Update(It.Is<AvailableSlot>(s => 
            s.Status == SlotStatus.Booked)), Times.Once);
    }

    [Fact]
    public async Task Should_HandleException_When_DatabaseErrorOccurs()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _bookingBuilder.WithValidData().BuildCommand();
        var slot = _slotBuilder.WithValidData().BuildEntity();
        var service = new Service(Guid.NewGuid(), "Test Service", "Test Description", 60, 100.0m, true);

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.AvailableSlots).Returns(MockDbSet(slot));
        _mockContext.Setup(x => x.Services).Returns(MockDbSet(service));
        _mockContext.Setup(x => x.Bookings).Returns(MockDbSet<Booking>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Wystąpił błąd podczas tworzenia rezerwacji");
    }

    [Fact]
    public async Task Should_LogInformation_When_BookingCreatedSuccessfully()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _bookingBuilder.WithValidData().BuildCommand();
        var slot = _slotBuilder.WithValidData().BuildEntity();
        var service = new Service(Guid.NewGuid(), "Test Service", "Test Description", 60, 100.0m, true);

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.AvailableSlots).Returns(MockDbSet(slot));
        _mockContext.Setup(x => x.Services).Returns(MockDbSet(service));
        _mockContext.Setup(x => x.Bookings).Returns(MockDbSet<Booking>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Tworzenie nowej rezerwacji")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Should_LogError_When_DatabaseErrorOccurs()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _bookingBuilder.WithValidData().BuildCommand();
        var slot = _slotBuilder.WithValidData().BuildEntity();
        var service = new Service(Guid.NewGuid(), "Test Service", "Test Description", 60, 100.0m, true);

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.AvailableSlots).Returns(MockDbSet(slot));
        _mockContext.Setup(x => x.Services).Returns(MockDbSet(service));
        _mockContext.Setup(x => x.Bookings).Returns(MockDbSet<Booking>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Błąd podczas tworzenia rezerwacji")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Should_HandleCancellationToken_When_OperationCancelled()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _bookingBuilder.WithValidData().BuildCommand();
        var cancellationToken = new CancellationToken(true); // Cancelled

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);

        // Act & Assert
        await Assert.ThrowsAsync<OperationCanceledException>(() => 
            _handler.Handle(command, cancellationToken));
    }

    [Fact]
    public async Task Should_ValidateAllFields_When_CommandIsValid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _bookingBuilder.WithValidData().BuildCommand();
        var slot = _slotBuilder.WithValidData().BuildEntity();
        var service = new Service(Guid.NewGuid(), "Test Service", "Test Description", 60, 100.0m, true);

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.AvailableSlots).Returns(MockDbSet(slot));
        _mockContext.Setup(x => x.Services).Returns(MockDbSet(service));
        _mockContext.Setup(x => x.Bookings).Returns(MockDbSet<Booking>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        
        _mockContext.Verify(x => x.Bookings.Add(It.Is<Booking>(b => 
            b.SlotId == command.SlotId &&
            b.ServiceId == command.ServiceId &&
            b.CustomerName == command.CustomerName &&
            b.CustomerEmail == command.CustomerEmail &&
            b.CustomerPhone == command.CustomerPhone &&
            b.Notes == command.Notes &&
            b.UserId == userId &&
            b.Status == BookingStatus.Pending)), Times.Once);
    }

    private static Microsoft.EntityFrameworkCore.DbSet<T> MockDbSet<T>(params T[] entities) where T : class
    {
        var mockSet = new Mock<Microsoft.EntityFrameworkCore.DbSet<T>>();
        var queryable = entities.AsQueryable();
        
        mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());
        
        return mockSet.Object;
    }
} 
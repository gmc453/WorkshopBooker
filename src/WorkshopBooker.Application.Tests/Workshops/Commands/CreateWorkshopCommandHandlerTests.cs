using System;
using System.Threading;
using System.Threading.Tasks;
using AutoFixture;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Workshops.Commands.CreateWorkshop;
using WorkshopBooker.Domain.Entities;
using WorkshopBooker.Application.Tests.Common.TestDataBuilders;
using Xunit;

namespace WorkshopBooker.Application.Tests.Workshops.Commands.CreateWorkshop;

public class CreateWorkshopCommandHandlerTests
{
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<ICurrentUserProvider> _mockCurrentUserProvider;
    private readonly Mock<ILogger<CreateWorkshopCommandHandler>> _mockLogger;
    private readonly CreateWorkshopCommandHandler _handler;
    private readonly Fixture _fixture;
    private readonly WorkshopBuilder _workshopBuilder;
    private readonly UserBuilder _userBuilder;

    public CreateWorkshopCommandHandlerTests()
    {
        _mockContext = new Mock<IApplicationDbContext>();
        _mockCurrentUserProvider = new Mock<ICurrentUserProvider>();
        _mockLogger = new Mock<ILogger<CreateWorkshopCommandHandler>>();
        _handler = new CreateWorkshopCommandHandler(_mockContext.Object, _mockCurrentUserProvider.Object, _mockLogger.Object);
        _fixture = new Fixture();
        _workshopBuilder = new WorkshopBuilder(_fixture);
        _userBuilder = new UserBuilder(_fixture);
    }

    [Fact]
    public async Task Should_CreateWorkshop_When_ValidCommand()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _workshopBuilder.WithValidData().BuildCommand();
        
        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.Workshops).Returns(MockDbSet<Workshop>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
        
        _mockContext.Verify(x => x.Workshops.Add(It.Is<Workshop>(w => 
            w.Name == command.Name && 
            w.Description == command.Description &&
            w.UserId == userId)), Times.Once);
        _mockContext.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Should_ThrowValidationException_When_NameIsEmpty()
    {
        // Arrange
        var command = _workshopBuilder.WithName("").BuildCommand();

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Nazwa warsztatu jest wymagana");
    }

    [Fact]
    public async Task Should_ThrowValidationException_When_NameIsWhitespace()
    {
        // Arrange
        var command = _workshopBuilder.WithName("   ").BuildCommand();

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Nazwa warsztatu jest wymagana");
    }

    [Fact]
    public async Task Should_ThrowValidationException_When_DescriptionIsTooShort()
    {
        // Arrange
        var command = _workshopBuilder.WithShortDescription().BuildCommand();

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Opis warsztatu musi mieć co najmniej 10 znaków");
    }

    [Fact]
    public async Task Should_ThrowValidationException_When_EmailIsInvalid()
    {
        // Arrange
        var command = _workshopBuilder.WithInvalidEmail().BuildCommand();

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Nieprawidłowy format adresu email");
    }

    [Fact]
    public async Task Should_ThrowValidationException_When_PhoneNumberIsInvalid()
    {
        // Arrange
        var command = _workshopBuilder.WithInvalidPhoneNumber().BuildCommand();

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
        var command = _workshopBuilder.WithValidData().BuildCommand();
        _mockCurrentUserProvider.Setup(x => x.UserId).Returns((Guid?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Użytkownik musi być zalogowany");
    }

    [Fact]
    public async Task Should_ThrowBusinessException_When_WorkshopNameAlreadyExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _workshopBuilder.WithValidData().BuildCommand();
        var existingWorkshop = _workshopBuilder.WithValidData().BuildEntity();

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.Workshops).Returns(MockDbSet(existingWorkshop));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Warsztat o takiej nazwie już istnieje");
    }

    [Fact]
    public async Task Should_ThrowBusinessException_When_WorkshopNameExistsCaseInsensitive()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _workshopBuilder.WithName("Test Warsztat").BuildCommand();
        var existingWorkshop = _workshopBuilder.WithName("test warsztat").BuildEntity();

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.Workshops).Returns(MockDbSet(existingWorkshop));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Warsztat o takiej nazwie już istnieje");
    }

    [Fact]
    public async Task Should_SetCorrectCreationDate_When_CreatingWorkshop()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _workshopBuilder.WithValidData().BuildCommand();
        var beforeCreation = DateTime.UtcNow;

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.Workshops).Returns(MockDbSet<Workshop>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        
        _mockContext.Verify(x => x.Workshops.Add(It.Is<Workshop>(w => 
            w.CreatedAt >= beforeCreation &&
            w.CreatedAt <= DateTime.UtcNow)), Times.Once);
    }

    [Fact]
    public async Task Should_SetCorrectUpdatedDate_When_CreatingWorkshop()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _workshopBuilder.WithValidData().BuildCommand();
        var beforeCreation = DateTime.UtcNow;

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.Workshops).Returns(MockDbSet<Workshop>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        
        _mockContext.Verify(x => x.Workshops.Add(It.Is<Workshop>(w => 
            w.UpdatedAt >= beforeCreation &&
            w.UpdatedAt <= DateTime.UtcNow)), Times.Once);
    }

    [Fact]
    public async Task Should_SetWorkshopAsActive_When_CreatingWorkshop()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _workshopBuilder.WithValidData().BuildCommand();

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.Workshops).Returns(MockDbSet<Workshop>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        
        _mockContext.Verify(x => x.Workshops.Add(It.Is<Workshop>(w => 
            w.IsActive == true)), Times.Once);
    }

    [Fact]
    public async Task Should_HandleException_When_DatabaseErrorOccurs()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _workshopBuilder.WithValidData().BuildCommand();

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.Workshops).Returns(MockDbSet<Workshop>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Wystąpił błąd podczas tworzenia warsztatu");
    }

    [Fact]
    public async Task Should_HandleException_When_DatabaseConnectionFails()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _workshopBuilder.WithValidData().BuildCommand();

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.Workshops).Returns(MockDbSet<Workshop>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new System.Data.SqlClient.SqlException("Connection failed"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Wystąpił błąd podczas tworzenia warsztatu");
    }

    [Fact]
    public async Task Should_LogInformation_When_WorkshopCreatedSuccessfully()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _workshopBuilder.WithValidData().BuildCommand();

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.Workshops).Returns(MockDbSet<Workshop>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Tworzenie nowego warsztatu")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Should_LogWarning_When_DuplicateWorkshopName()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _workshopBuilder.WithValidData().BuildCommand();
        var existingWorkshop = _workshopBuilder.WithValidData().BuildEntity();

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.Workshops).Returns(MockDbSet(existingWorkshop));

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Próba utworzenia warsztatu o nazwie, która już istnieje")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Should_LogError_When_DatabaseErrorOccurs()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _workshopBuilder.WithValidData().BuildCommand();

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.Workshops).Returns(MockDbSet<Workshop>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Błąd podczas tworzenia warsztatu")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Should_HandleCancellationToken_When_OperationCancelled()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _workshopBuilder.WithValidData().BuildCommand();
        var cancellationToken = new CancellationToken(true); // Cancelled

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.Workshops).Returns(MockDbSet<Workshop>());

        // Act & Assert
        await Assert.ThrowsAsync<OperationCanceledException>(() => 
            _handler.Handle(command, cancellationToken));
    }

    [Fact]
    public async Task Should_ValidateAllFields_When_CommandIsValid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = _workshopBuilder.WithValidData().BuildCommand();

        _mockCurrentUserProvider.Setup(x => x.UserId).Returns(userId);
        _mockContext.Setup(x => x.Workshops).Returns(MockDbSet<Workshop>());
        _mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        
        _mockContext.Verify(x => x.Workshops.Add(It.Is<Workshop>(w => 
            w.Name == command.Name &&
            w.Description == command.Description &&
            w.PhoneNumber == command.PhoneNumber &&
            w.Email == command.Email &&
            w.Address == command.Address &&
            w.UserId == userId &&
            w.IsActive == true)), Times.Once);
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
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoFixture;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using WorkshopBooker.Application.Common;
using WorkshopBooker.Application.Workshops.Commands.CreateWorkshop;
using WorkshopBooker.Application.Workshops.Commands.DeleteWorkshop;
using WorkshopBooker.Application.Workshops.Commands.UpdateWorkshop;
using WorkshopBooker.Application.Workshops.Queries.GetMyWorkshops;
using WorkshopBooker.Application.Workshops.Queries.GetWorkshopById;
using WorkshopBooker.Application.Workshops.Queries.GetWorkshops;
using WorkshopBooker.Api.Controllers;
using WorkshopBooker.Application.Workshops.Dtos;
using Xunit;

namespace WorkshopBooker.Api.Tests.Controllers;

public class WorkshopsControllerTests
{
    private readonly Mock<ISender> _mockSender;
    private readonly WorkshopsController _controller;
    private readonly Fixture _fixture;

    public WorkshopsControllerTests()
    {
        _mockSender = new Mock<ISender>();
        _controller = new WorkshopsController(_mockSender.Object);
        _fixture = new Fixture();
    }

    [Fact]
    public async Task GetAll_Should_Return200_With_WorkshopsList()
    {
        // Arrange
        var workshops = _fixture.CreateMany<WorkshopDto>(3);
        _mockSender.Setup(x => x.Send(It.IsAny<GetWorkshopsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(workshops);

        // Act
        var result = await _controller.GetAll("test");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedWorkshops = okResult.Value.Should().BeOfType<IEnumerable<WorkshopDto>>().Subject;
        returnedWorkshops.Should().HaveCount(3);
    }

    [Fact]
    public async Task Create_Should_Return201_When_ValidCommand()
    {
        // Arrange
        var command = _fixture.Create<CreateWorkshopCommand>();
        var workshopId = Guid.NewGuid();
        var successResult = Result<Guid>.Success(workshopId);

        _mockSender.Setup(x => x.Send(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(successResult);

        // Act
        var result = await _controller.Create(command);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.Value.Should().Be(workshopId);
        createdResult.ActionName.Should().Be(nameof(WorkshopsController.GetById));
    }

    [Fact]
    public async Task Create_Should_Return400_When_ValidationFails()
    {
        // Arrange
        var command = _fixture.Create<CreateWorkshopCommand>();
        var validationErrors = new List<string> { "Nazwa jest wymagana" };
        var failureResult = Result<Guid>.ValidationFailure(validationErrors);

        _mockSender.Setup(x => x.Send(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(failureResult);

        // Act
        var result = await _controller.Create(command);

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        var errorResponse = badRequestResult.Value.Should().BeOfType<dynamic>().Subject;
        ((string)errorResponse.error).Should().Contain("Nazwa jest wymagana");
    }

    [Fact]
    public async Task Create_Should_Return400_When_NoIdReturned()
    {
        // Arrange
        var command = _fixture.Create<CreateWorkshopCommand>();
        var successResult = Result<Guid>.Success(Guid.Empty);

        _mockSender.Setup(x => x.Send(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(successResult);

        // Act
        var result = await _controller.Create(command);

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        var errorResponse = badRequestResult.Value.Should().BeOfType<dynamic>().Subject;
        ((string)errorResponse.error).Should().Contain("Workshop creation failed");
    }

    [Fact]
    public async Task GetById_Should_Return404_When_WorkshopNotFound()
    {
        // Arrange
        var workshopId = Guid.NewGuid();
        _mockSender.Setup(x => x.Send(It.IsAny<GetWorkshopByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((WorkshopDto)null);

        // Act
        var result = await _controller.GetById(workshopId);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetById_Should_Return200_When_WorkshopFound()
    {
        // Arrange
        var workshopId = Guid.NewGuid();
        var workshop = _fixture.Create<WorkshopDto>();
        workshop.Id = workshopId;

        _mockSender.Setup(x => x.Send(It.IsAny<GetWorkshopByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(workshop);

        // Act
        var result = await _controller.GetById(workshopId);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedWorkshop = okResult.Value.Should().BeOfType<WorkshopDto>().Subject;
        returnedWorkshop.Id.Should().Be(workshopId);
    }

    [Fact]
    public async Task GetMyWorkshops_Should_Return200_With_UserWorkshops()
    {
        // Arrange
        var workshops = _fixture.CreateMany<WorkshopDto>(2);
        _mockSender.Setup(x => x.Send(It.IsAny<GetMyWorkshopsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(workshops);

        // Act
        var result = await _controller.GetMyWorkshops();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedWorkshops = okResult.Value.Should().BeOfType<IEnumerable<WorkshopDto>>().Subject;
        returnedWorkshops.Should().HaveCount(2);
    }

    [Fact]
    public async Task Update_Should_Return400_When_IdMismatch()
    {
        // Arrange
        var workshopId = Guid.NewGuid();
        var command = _fixture.Build<UpdateWorkshopCommand>()
            .With(x => x.Id, Guid.NewGuid())
            .Create();

        // Act
        var result = await _controller.Update(workshopId, command);

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        var errorMessage = badRequestResult.Value.Should().BeOfType<string>().Subject;
        errorMessage.Should().Contain("ID in URL does not match ID in request body");
    }

    [Fact]
    public async Task Update_Should_Return204_When_Successful()
    {
        // Arrange
        var workshopId = Guid.NewGuid();
        var command = _fixture.Build<UpdateWorkshopCommand>()
            .With(x => x.Id, workshopId)
            .Create();

        _mockSender.Setup(x => x.Send(command, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.Update(workshopId, command);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task Delete_Should_Return204_When_Successful()
    {
        // Arrange
        var workshopId = Guid.NewGuid();
        _mockSender.Setup(x => x.Send(It.IsAny<DeleteWorkshopCommand>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.Delete(workshopId);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task GetAll_Should_Return500_When_ExceptionOccurs()
    {
        // Arrange
        _mockSender.Setup(x => x.Send(It.IsAny<GetWorkshopsQuery>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _controller.GetAll(null);

        // Assert
        result.Should().BeOfType<ObjectResult>();
        var objectResult = result as ObjectResult;
        objectResult.StatusCode.Should().Be(500);
    }

    [Fact]
    public async Task Create_Should_Return500_When_ExceptionOccurs()
    {
        // Arrange
        var command = _fixture.Create<CreateWorkshopCommand>();
        _mockSender.Setup(x => x.Send(command, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _controller.Create(command);

        // Assert
        result.Should().BeOfType<ObjectResult>();
        var objectResult = result as ObjectResult;
        objectResult.StatusCode.Should().Be(500);
    }

    [Fact]
    public async Task GetById_Should_Return500_When_ExceptionOccurs()
    {
        // Arrange
        var workshopId = Guid.NewGuid();
        _mockSender.Setup(x => x.Send(It.IsAny<GetWorkshopByIdQuery>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _controller.GetById(workshopId);

        // Assert
        result.Should().BeOfType<ObjectResult>();
        var objectResult = result as ObjectResult;
        objectResult.StatusCode.Should().Be(500);
    }

    [Fact]
    public async Task Update_Should_Return500_When_ExceptionOccurs()
    {
        // Arrange
        var workshopId = Guid.NewGuid();
        var command = _fixture.Build<UpdateWorkshopCommand>()
            .With(x => x.Id, workshopId)
            .Create();

        _mockSender.Setup(x => x.Send(command, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _controller.Update(workshopId, command);

        // Assert
        result.Should().BeOfType<ObjectResult>();
        var objectResult = result as ObjectResult;
        objectResult.StatusCode.Should().Be(500);
    }

    [Fact]
    public async Task Delete_Should_Return500_When_ExceptionOccurs()
    {
        // Arrange
        var workshopId = Guid.NewGuid();
        _mockSender.Setup(x => x.Send(It.IsAny<DeleteWorkshopCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act
        var result = await _controller.Delete(workshopId);

        // Assert
        result.Should().BeOfType<ObjectResult>();
        var objectResult = result as ObjectResult;
        objectResult.StatusCode.Should().Be(500);
    }
} 
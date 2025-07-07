using MediatR;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Reviews.Dtos;
using WorkshopBooker.Application.Common;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Reviews.Commands.CreateReview;

public record CreateReviewCommand : IRequest<Result<ReviewDto>>
{
    public Guid BookingId { get; init; }
    public Guid WorkshopId { get; init; }
    public int Rating { get; init; }
    public string? Comment { get; init; }
} 
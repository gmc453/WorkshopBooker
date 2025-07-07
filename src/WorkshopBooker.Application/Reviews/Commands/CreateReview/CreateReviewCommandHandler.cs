using MediatR;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Reviews.Dtos;
using WorkshopBooker.Application.Common;
using WorkshopBooker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace WorkshopBooker.Application.Reviews.Commands.CreateReview;

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, Result<ReviewDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;

    public CreateReviewCommandHandler(IApplicationDbContext context, ICurrentUserProvider currentUserProvider)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
    }

    public async Task<Result<ReviewDto>> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserProvider.UserId;
        if (currentUserId == null)
            return Result<ReviewDto>.Failure("Użytkownik nie jest zalogowany");

        // Sprawdź czy booking istnieje i należy do użytkownika
        var booking = await _context.Bookings
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == request.BookingId && b.UserId == currentUserId, cancellationToken);

        if (booking == null)
            return Result<ReviewDto>.Failure("Rezerwacja nie została znaleziona");

        // Sprawdź czy recenzja już istnieje
        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r => r.BookingId == request.BookingId, cancellationToken);

        if (existingReview != null)
            return Result<ReviewDto>.Failure("Recenzja dla tej rezerwacji już istnieje");

        // Sprawdź czy booking jest zakończony (można dodać recenzję)
        if (booking.Status != BookingStatus.Completed)
            return Result<ReviewDto>.Failure("Można dodać recenzję tylko dla zakończonych rezerwacji");

        var review = new Review(
            request.BookingId,
            request.WorkshopId,
            currentUserId.Value,
            request.Rating,
            request.Comment
        );

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync(cancellationToken);

        var reviewDto = new ReviewDto
        {
            Id = review.Id,
            BookingId = review.BookingId,
            WorkshopId = review.WorkshopId,
            UserId = review.UserId,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt,
            UpdatedAt = review.UpdatedAt,
            IsVerified = review.IsVerified,
            UserName = $"{booking.User.FirstName} {booking.User.LastName}",
            UserEmail = booking.User.Email
        };

        return Result<ReviewDto>.Success(reviewDto);
    }
} 
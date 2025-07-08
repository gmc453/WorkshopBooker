using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkshopBooker.Application.Reviews.Commands.CreateReview;
using WorkshopBooker.Application.Reviews.Dtos;
using WorkshopBooker.Application.Analytics.Queries.GetWorkshopAnalytics;
using WorkshopBooker.Application.Common.Interfaces;
using MediatR;

namespace WorkshopBooker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReviewsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
    {
        var command = new CreateReviewCommand
        {
            BookingId = request.BookingId,
            WorkshopId = request.WorkshopId,
            Rating = request.Rating,
            Comment = request.Comment
        };
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess && result.Value != null)
            return Ok(result.Value);
        
        return BadRequest(result.Error);
    }

    [HttpGet("workshop/{workshopId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetWorkshopReviews(Guid workshopId, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        var query = new GetWorkshopAnalyticsQuery
        {
            WorkshopId = workshopId,
            StartDate = start,
            EndDate = end
        };

        var result = await _mediator.Send(query);
        
        if (result.IsSuccess && result.Value != null)
            return Ok(result.Value);
        
        return BadRequest(result.Error);
    }
} 
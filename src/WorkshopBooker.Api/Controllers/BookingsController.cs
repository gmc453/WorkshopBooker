using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using WorkshopBooker.Application.Bookings.Commands.CreateBooking;
using WorkshopBooker.Application.Bookings.Dtos;
using WorkshopBooker.Application.Bookings.Queries.GetBookingsForWorkshop;
using WorkshopBooker.Application.Bookings.Queries.GetMyBookings;
using WorkshopBooker.Application.Bookings.Queries.GetMyWorkshopBookings;
using System.Security.Claims;
using WorkshopBooker.Application.Bookings.Commands.ConfirmBooking;
using WorkshopBooker.Application.Bookings.Commands.CancelBooking;
using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Api.Controllers;

[ApiController]
[Route("api/services/{serviceId}/bookings")]
public class BookingsController : ControllerBase
{
    private readonly ISender _sender;
    private readonly IConflictResolutionService _conflictResolutionService;

    public BookingsController(ISender sender, IConflictResolutionService conflictResolutionService)
    {
        _sender = sender;
        _conflictResolutionService = conflictResolutionService;
    }

    [HttpPost]
    [Authorize]
    [EnableRateLimiting("CriticalPolicy")]
    public async Task<IActionResult> Create(Guid serviceId, CreateBookingCommand command)
    {
        var fullCommand = command with { ServiceId = serviceId };
        var result = await _sender.Send(fullCommand);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error, validationErrors = result.ValidationErrors });
        }

        if (result.Value == null)
        {
            return BadRequest(new { error = "Booking creation failed - no ID returned" });
        }

        return CreatedAtAction(nameof(Create), new { serviceId, id = result.Value }, result.Value);
    }

    [HttpGet("~/api/workshops/{workshopId}/bookings")]
    [Authorize]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> GetForWorkshop(Guid workshopId)
    {
        var bookings = await _sender.Send(new GetBookingsForWorkshopQuery(workshopId));
        return Ok(bookings);
    }

    [HttpGet("~/api/bookings/my")]
    [Authorize]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> GetMyBookings()
    {
        var bookings = await _sender.Send(new GetMyBookingsQuery());
        return Ok(bookings);
    }

    [HttpGet("~/api/bookings/my-workshops")]
    [Authorize]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> GetMyWorkshopBookings()
    {
        var bookings = await _sender.Send(new GetMyWorkshopBookingsQuery());
        return Ok(bookings);
    }

    [HttpPost("~/api/workshops/{workshopId}/bookings/{bookingId}/confirm")]
    [Authorize]
    [EnableRateLimiting("WritePolicy")]
    public async Task<IActionResult> ConfirmBooking(Guid workshopId, Guid bookingId)
    {
        var command = new ConfirmBookingCommand(bookingId);
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("~/api/workshops/{workshopId}/bookings/{bookingId}/cancel")]
    [Authorize]
    [EnableRateLimiting("WritePolicy")]
    public async Task<IActionResult> CancelBooking(Guid workshopId, Guid bookingId)
    {
        var command = new CancelBookingCommand(bookingId);
        await _sender.Send(command);
        return NoContent();
    }

    [HttpGet("~/api/workshops/{workshopId}/alternatives")]
    [AllowAnonymous]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> GetAlternativeSlots(
        Guid workshopId, 
        [FromQuery] DateTime requestedTime, 
        [FromQuery] int durationMinutes = 60)
    {
        var alternatives = await _conflictResolutionService.SuggestAlternatives(workshopId, requestedTime, durationMinutes);
        return Ok(alternatives);
    }

    [HttpGet("~/api/workshops/{workshopId}/available-slots")]
    [AllowAnonymous]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> GetAvailableSlots(
        Guid workshopId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var slots = await _conflictResolutionService.FindAvailableSlots(workshopId, startDate, endDate);
        return Ok(slots);
    }
}

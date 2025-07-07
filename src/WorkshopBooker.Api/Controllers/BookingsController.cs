using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using WorkshopBooker.Application.Bookings.Commands.CreateBooking;
using WorkshopBooker.Application.Bookings.Dtos;
using WorkshopBooker.Application.Bookings.Queries.GetBookingsForWorkshop;
using WorkshopBooker.Application.Bookings.Queries.GetMyBookings;
using System.Security.Claims;
using WorkshopBooker.Application.Bookings.Commands.ConfirmBooking;
using WorkshopBooker.Application.Bookings.Commands.CancelBooking;

namespace WorkshopBooker.Api.Controllers;

[ApiController]
[Route("api/services/{serviceId}/bookings")]
[EnableRateLimiting("BookingPolicy")]
public class BookingsController : ControllerBase
{
    private readonly ISender _sender;

    public BookingsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(Guid serviceId, CreateBookingCommand command)
    {
        var fullCommand = command with { ServiceId = serviceId };
        var result = await _sender.Send(fullCommand);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error, validationErrors = result.ValidationErrors });
        }

        return CreatedAtAction(nameof(Create), new { serviceId, id = result.Value }, result.Value);
    }

    [HttpGet("~/api/workshops/{workshopId}/bookings")]
    public async Task<IActionResult> GetForWorkshop(Guid workshopId)
    {
        var bookings = await _sender.Send(new GetBookingsForWorkshopQuery(workshopId));
        return Ok(bookings);
    }

    [HttpGet("~/api/bookings/my")]
    [Authorize]
    public async Task<IActionResult> GetMyBookings()
    {
        var bookings = await _sender.Send(new GetMyBookingsQuery());
        return Ok(bookings);
    }

    [HttpPost("~/api/bookings/{id}/confirm")]
    [Authorize]
    public async Task<IActionResult> ConfirmBooking(Guid id)
    {
        await _sender.Send(new ConfirmBookingCommand(id));
        return NoContent();
    }

    [HttpPost("~/api/bookings/{id}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelBooking(Guid id)
    {
        await _sender.Send(new CancelBookingCommand(id));
        return NoContent();
    }
}

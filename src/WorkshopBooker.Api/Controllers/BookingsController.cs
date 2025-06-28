using MediatR;
using Microsoft.AspNetCore.Mvc;
using WorkshopBooker.Application.Bookings.Commands.CreateBooking;
using WorkshopBooker.Application.Bookings.Dtos;
using WorkshopBooker.Application.Bookings.Queries.GetBookingsForWorkshop;

namespace WorkshopBooker.Api.Controllers;

[ApiController]
[Route("api/services/{serviceId}/bookings")]
public class BookingsController : ControllerBase
{
    private readonly ISender _sender;

    public BookingsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid serviceId, CreateBookingCommand command)
    {
        var fullCommand = command with { ServiceId = serviceId };
        var bookingId = await _sender.Send(fullCommand);
        return CreatedAtAction(nameof(Create), new { serviceId, id = bookingId }, bookingId);
    }

    [HttpGet("~/api/workshops/{workshopId}/bookings")]
    public async Task<IActionResult> GetForWorkshop(Guid workshopId)
    {
        var bookings = await _sender.Send(new GetBookingsForWorkshopQuery(workshopId));
        return Ok(bookings);
    }
}

using MediatR;
using Microsoft.AspNetCore.Mvc;
using WorkshopBooker.Application.Bookings.Commands.CreateBooking;

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
}

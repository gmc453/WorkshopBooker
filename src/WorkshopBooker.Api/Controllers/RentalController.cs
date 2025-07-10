using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using WorkshopBooker.Application.Rentals.Commands.CreateVehicle;
using WorkshopBooker.Application.Rentals.Commands.UpdateVehicleLocation;
using WorkshopBooker.Application.Rentals.Commands.CreateRentalReservation;
using WorkshopBooker.Application.Rentals.Queries.GetAvailableVehicles;

namespace WorkshopBooker.Api.Controllers;

[ApiController]
[Route("api/rentals")]
public class RentalController : ControllerBase
{
    private readonly ISender _sender;

    public RentalController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("vehicles")]
    [Authorize]
    [EnableRateLimiting("WritePolicy")]
    public async Task<IActionResult> CreateVehicle(CreateVehicleCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(GetAvailableVehicles), new { id }, id);
    }

    [HttpPost("vehicles/{vehicleId}/location")]
    [Authorize]
    [EnableRateLimiting("WritePolicy")]
    public async Task<IActionResult> UpdateLocation(Guid vehicleId, UpdateVehicleLocationCommand command)
    {
        var full = command with { VehicleId = vehicleId };
        await _sender.Send(full);
        return NoContent();
    }

    [HttpGet("vehicles/available")]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> GetAvailableVehicles()
    {
        var vehicles = await _sender.Send(new GetAvailableVehiclesQuery());
        return Ok(vehicles);
    }

    [HttpPost("reservations")]
    [Authorize]
    [EnableRateLimiting("CriticalPolicy")]
    public async Task<IActionResult> CreateReservation(CreateRentalReservationCommand command)
    {
        var result = await _sender.Send(command);
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error });
        }
        return CreatedAtAction(nameof(CreateReservation), new { id = result.Value }, result.Value);
    }
}

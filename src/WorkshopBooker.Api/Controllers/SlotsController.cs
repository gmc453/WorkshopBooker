using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkshopBooker.Application.Slots.Commands.CreateSlot;
using WorkshopBooker.Application.Slots.Commands.DeleteSlot;
using WorkshopBooker.Application.Slots.Queries.GetSlots;
using WorkshopBooker.Application.Slots.Queries.GetAvailableSlots;

namespace WorkshopBooker.Api.Controllers;

[ApiController]
[Route("api")] // base route; we'll specify full routes on actions
public class SlotsController : ControllerBase
{
    private readonly ISender _sender;

    public SlotsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("workshops/{workshopId}/slots")]
    [Authorize]
    public async Task<IActionResult> Create(Guid workshopId, CreateSlotCommand command)
    {
        var id = await _sender.Send(command with { WorkshopId = workshopId });
        return CreatedAtAction(nameof(GetForWorkshop), new { workshopId }, id);
    }

    [HttpGet("workshops/{workshopId}/slots")]
    public async Task<IActionResult> GetForWorkshop(Guid workshopId, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
    {
        var slots = await _sender.Send(new GetSlotsQuery(workshopId, dateFrom, dateTo));
        return Ok(slots);
    }

    [HttpGet("workshops/{workshopId}/services/{serviceId}/slots")]
    public async Task<IActionResult> GetAvailableForService(Guid workshopId, Guid serviceId, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
    {
        var slots = await _sender.Send(new GetAvailableSlotsQuery(workshopId, serviceId, dateFrom, dateTo));
        return Ok(slots);
    }

    [HttpDelete("slots/{slotId}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid slotId)
    {
        await _sender.Send(new DeleteSlotCommand(slotId));
        return NoContent();
    }
}

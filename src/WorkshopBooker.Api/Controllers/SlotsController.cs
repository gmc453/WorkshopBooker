using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
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
    [EnableRateLimiting("WritePolicy")]
    public async Task<IActionResult> Create(Guid workshopId, CreateSlotCommand command)
    {
        var id = await _sender.Send(command with { WorkshopId = workshopId });
        return CreatedAtAction(nameof(GetForWorkshop), new { workshopId }, id);
    }

    [HttpGet("workshops/{workshopId}/slots")]
    [Authorize]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> GetForWorkshop(Guid workshopId, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
    {
        var slots = await _sender.Send(new GetSlotsQuery(workshopId, dateFrom, dateTo));
        return Ok(slots);
    }

    [HttpGet("workshops/{workshopId}/services/{serviceId}/slots")]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> GetAvailableForService(Guid workshopId, Guid serviceId, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
    {
        var slots = await _sender.Send(new GetAvailableSlotsQuery(workshopId, serviceId, dateFrom, dateTo));
        return Ok(slots);
    }

    [HttpDelete("slots/{slotId}")]
    [Authorize]
    [EnableRateLimiting("WritePolicy")]
    public async Task<IActionResult> Delete(Guid slotId)
    {
        await _sender.Send(new DeleteSlotCommand(slotId));
        return NoContent();
    }

    [HttpGet("workshops/{workshopId}/services/{serviceId}/next-available")]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> GetNextAvailable(Guid workshopId, Guid serviceId)
    {
        var slots = await _sender.Send(new GetAvailableSlotsQuery(workshopId, serviceId, null, null));
        var nextSlot = slots.Where(s => s.IsAvailable)
                           .OrderBy(s => s.StartTime)
                           .FirstOrDefault();
        
        if (nextSlot == null)
        {
            return Ok(new { message = "No available slots found" });
        }
        
        return Ok(nextSlot);
    }

    [HttpGet("slots/{slotId}/availability")]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> CheckAvailability(Guid slotId)
    {
        // TODO: Implement proper slot availability check
        // For now, return mock data
        return Ok(new { isAvailable = true, slotId = slotId });
    }

    [HttpGet("workshops/{workshopId}/services/{serviceId}/quick-slots")]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> GetQuickSlots(Guid workshopId, Guid serviceId, [FromQuery] int count = 5)
    {
        var slots = await _sender.Send(new GetAvailableSlotsQuery(workshopId, serviceId, null, null));
        var quickSlots = slots.Where(s => s.IsAvailable)
                             .OrderBy(s => s.StartTime)
                             .Take(count)
                             .ToList();
        return Ok(quickSlots);
    }
}

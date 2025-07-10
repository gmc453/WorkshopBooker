using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Emergency.Domain.Entities;
using WorkshopBooker.Emergency.Infrastructure;
using WorkshopBooker.Core.Messaging;
using WorkshopBooker.Emergency.Domain.Events;

namespace WorkshopBooker.Emergency.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmergencyController : ControllerBase
{
    private readonly EmergencyDbContext _context;
    private readonly IEventBus _eventBus;

    public EmergencyController(EmergencyDbContext context, IEventBus eventBus)
    {
        _context = context;
        _eventBus = eventBus;
    }

    [HttpPost("request")]
    public async Task<ActionResult<EmergencyRequest>> Create(EmergencyRequest request)
    {
        request.Id = Guid.NewGuid();
        request.CreatedAt = DateTime.UtcNow;
        request.Status = "Pending";
        
        _context.EmergencyRequests.Add(request);
        await _context.SaveChangesAsync();

        await _eventBus.PublishAsync(new EmergencyRequestCreatedEvent
        {
            RequestId = request.Id,
            UserId = request.UserId,
            CreatedAt = request.CreatedAt,
            Priority = request.Priority
        });

        return CreatedAtAction(nameof(GetAll), new { id = request.Id }, request);
    }

    [HttpGet("requests")]
    public async Task<ActionResult<IEnumerable<EmergencyRequest>>> GetAll()
    {
        return await _context.EmergencyRequests.ToListAsync();
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { Status = "Healthy", Service = "Emergency Service" });
    }
}

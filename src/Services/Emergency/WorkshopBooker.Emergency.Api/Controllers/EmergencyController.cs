using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Emergency.Domain.Entities;
using WorkshopBooker.Emergency.Infrastructure;

namespace WorkshopBooker.Emergency.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmergencyController : ControllerBase
{
    private readonly EmergencyDbContext _context;

    public EmergencyController(EmergencyDbContext context)
    {
        _context = context;
    }

    [HttpPost("request")]
    public async Task<ActionResult<EmergencyRequest>> Create(EmergencyRequest request)
    {
        request.Id = Guid.NewGuid();
        request.CreatedAt = DateTime.UtcNow;
        request.Status = "Pending";
        _context.EmergencyRequests.Add(request);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = request.Id }, request);
    }

    [HttpGet("requests")]
    public async Task<ActionResult<IEnumerable<EmergencyRequest>>> GetAll()
    {
        return await _context.EmergencyRequests.ToListAsync();
    }
}

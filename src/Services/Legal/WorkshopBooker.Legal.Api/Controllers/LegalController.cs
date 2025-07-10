using Microsoft.AspNetCore.Mvc;
using WorkshopBooker.Core.Messaging;

namespace WorkshopBooker.Legal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LegalController : ControllerBase
{
    private readonly IEventBus _eventBus;

    public LegalController(IEventBus eventBus)
    {
        _eventBus = eventBus;
    }

    [HttpGet("consultations")]
    public async Task<IActionResult> GetConsultations()
    {
        var consultations = new[]
        {
            new { Id = 1, LawyerName = "Jan Kowalski", Specialty = "Contract Law", Price = 250.00 },
            new { Id = 2, LawyerName = "Anna Nowak", Specialty = "Insurance Claims", Price = 300.00 }
        };

        return Ok(consultations);
    }

    [HttpPost("consultations")]
    public async Task<IActionResult> BookConsultation([FromBody] object consultationData)
    {
        var consultationId = Guid.NewGuid();
        
        return Ok(new { Id = consultationId, Status = "Booked" });
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { Status = "Healthy", Service = "Legal Service" });
    }
} 
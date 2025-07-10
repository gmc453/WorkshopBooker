using Microsoft.AspNetCore.Mvc;
using WorkshopBooker.Core.Messaging;

namespace WorkshopBooker.Insurance.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InsuranceController : ControllerBase
{
    private readonly IEventBus _eventBus;

    public InsuranceController(IEventBus eventBus)
    {
        _eventBus = eventBus;
    }

    [HttpGet("policies")]
    public async Task<IActionResult> GetPolicies()
    {
        // ✅ BASIC IMPLEMENTATION
        var policies = new[]
        {
            new { Id = 1, Name = "Basic Coverage", Premium = 299.99 },
            new { Id = 2, Name = "Premium Coverage", Premium = 599.99 }
        };

        return Ok(policies);
    }

    [HttpPost("policies")]
    public async Task<IActionResult> CreatePolicy([FromBody] object policyData)
    {
        // ✅ BASIC IMPLEMENTATION
        var policyId = Guid.NewGuid();
        
        // Event publishing example
        // await _eventBus.PublishAsync(new PolicyCreatedEvent { PolicyId = policyId });

        return Ok(new { Id = policyId, Status = "Created" });
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { Status = "Healthy", Service = "Insurance Service" });
    }
} 
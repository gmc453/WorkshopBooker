// src/WorkshopBooker.Api/Controllers/ServicesController.cs
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using WorkshopBooker.Application.Services.Commands.CreateService;
using WorkshopBooker.Application.Services.Commands.UpdateService;
using WorkshopBooker.Application.Services.Commands.DeleteService;
using WorkshopBooker.Application.Services.Queries.GetServices;
using WorkshopBooker.Application.Services.Queries.GetServiceById;
using Microsoft.AspNetCore.RateLimiting;

namespace WorkshopBooker.Api.Controllers;

[ApiController]
[Route("api/workshops/{workshopId}/services")]
public class ServicesController : ControllerBase
{
    private readonly ISender _sender;

    public ServicesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    [Authorize]
    [EnableRateLimiting("WritePolicy")]
    public async Task<IActionResult> Create(Guid workshopId, CreateServiceCommand command)
    {
        var fullCommand = command with { WorkshopId = workshopId };
        var serviceId = await _sender.Send(fullCommand);
        return CreatedAtAction(nameof(GetById), new { workshopId, id = serviceId }, serviceId);
    }

    [HttpGet]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> GetAll(Guid workshopId)
    {
        var services = await _sender.Send(new GetServicesQuery(workshopId));
        return Ok(services);
    }

    [HttpGet("{id}")]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> GetById(Guid workshopId, Guid id)
    {
        var service = await _sender.Send(new GetServiceByIdQuery(workshopId, id));
        return service is not null ? Ok(service) : NotFound();
    }

    [HttpPut("{id}")]
    [Authorize]
    [EnableRateLimiting("WritePolicy")]
    public async Task<IActionResult> Update(Guid workshopId, Guid id, UpdateServiceCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest();
        }

        var fullCommand = command with { WorkshopId = workshopId };
        await _sender.Send(fullCommand);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize]
    [EnableRateLimiting("WritePolicy")]
    public async Task<IActionResult> Delete(Guid workshopId, Guid id)
    {
        await _sender.Send(new DeleteServiceCommand(workshopId, id));
        return NoContent();
    }
}

// src/WorkshopBooker.Api/Controllers/WorkshopsController.cs
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using WorkshopBooker.Application.Workshops.Commands.CreateWorkshop;
using WorkshopBooker.Application.Workshops.Commands.UpdateWorkshop;
using WorkshopBooker.Application.Workshops.Commands.DeleteWorkshop;
using WorkshopBooker.Application.Workshops.Queries.GetWorkshopById;
using WorkshopBooker.Application.Workshops.Queries.GetWorkshops;
using WorkshopBooker.Application.Workshops.Queries.GetMyWorkshops;

namespace WorkshopBooker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkshopsController : ControllerBase
{
    private readonly ISender _sender;

    // Wstrzykujemy ISender - główny interfejs MediatR do wysyłania komend/zapytań
    public WorkshopsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    [Authorize]
    [EnableRateLimiting("WritePolicy")]
    public async Task<IActionResult> Create(CreateWorkshopCommand command)
    {
        var result = await _sender.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error, validationErrors = result.ValidationErrors });
        }

        if (result.Value == null)
        {
            return BadRequest(new { error = "Workshop creation failed - no ID returned" });
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value);
    }
    [HttpGet]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> GetAll([FromQuery] string? searchTerm)
    {
        var workshops = await _sender.Send(new GetWorkshopsQuery(searchTerm));
        return Ok(workshops);
    }
    [HttpGet("{id}")]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var query = new GetWorkshopByIdQuery(id);
        var workshop = await _sender.Send(query);

        // Jeśli handler zwrócił null, to znaczy, że nie znaleziono warsztatu.
        // Zwracamy wtedy standardowy kod HTTP 404 Not Found.
        return workshop is not null ? Ok(workshop) : NotFound();
    }
    
    [HttpGet("my")]
    [Authorize]
    [EnableRateLimiting("ReadPolicy")]
    public async Task<IActionResult> GetMyWorkshops()
    {
        var workshops = await _sender.Send(new GetMyWorkshopsQuery());
        return Ok(workshops);
    }
    
    [HttpPut("{id}")]
    [Authorize]
    [EnableRateLimiting("WritePolicy")]
    public async Task<IActionResult> Update(Guid id, UpdateWorkshopCommand command)
    {
        // Sprawdzamy, czy ID z URL zgadza się z ID w ciele zapytania
        if (id != command.Id)
        {
            return BadRequest("ID in URL does not match ID in request body"); // Zwracamy błąd, jeśli są różne
        }

        await _sender.Send(command);

        // Po pomyślnej aktualizacji zwracamy kod 204 No Content.
        // To standardowa odpowiedź dla operacji PUT/DELETE, które się powiodły.
        return NoContent();
    }
    [HttpDelete("{id}")]
    [Authorize]
    [EnableRateLimiting("WritePolicy")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteWorkshopCommand(id));
        return NoContent();
    }
}
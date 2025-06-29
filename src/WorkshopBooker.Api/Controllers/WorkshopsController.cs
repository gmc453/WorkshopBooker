// src/WorkshopBooker.Api/Controllers/WorkshopsController.cs
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
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
    public async Task<IActionResult> Create(CreateWorkshopCommand command)
    {
        // Cała logika kontrolera to wysłanie komendy i zwrócenie wyniku. Proste i czyste!
        var workshopId = await _sender.Send(command);

        // Zwracamy kod 201 Created wraz z ID nowego zasobu
        return CreatedAtAction(nameof(Create), new { id = workshopId }, workshopId);
    }
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? searchTerm)
    {
        var workshops = await _sender.Send(new GetWorkshopsQuery(searchTerm));
        return Ok(workshops);
    }
    [HttpGet("{id}")]
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
    public async Task<IActionResult> GetMyWorkshops()
    {
        var workshops = await _sender.Send(new GetMyWorkshopsQuery());
        return Ok(workshops);
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateWorkshopCommand command)
    {
        // Sprawdzamy, czy ID z URL zgadza się z ID w ciele zapytania
        if (id != command.Id)
        {
            return BadRequest(); // Zwracamy błąd, jeśli są różne
        }

        await _sender.Send(command);

        // Po pomyślnej aktualizacji zwracamy kod 204 No Content.
        // To standardowa odpowiedź dla operacji PUT/DELETE, które się powiodły.
        return NoContent();
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteWorkshopCommand(id));
        return NoContent();
    }
}
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using WorkshopBooker.Application.Bookings.Commands.CreateBooking;
using WorkshopBooker.Application.Bookings.Dtos;
using WorkshopBooker.Application.Bookings.Queries.GetBookingsForWorkshop;
using System.Security.Claims;

namespace WorkshopBooker.Api.Controllers;

[ApiController]
[Route("api/services/{serviceId}/bookings")]
public class BookingsController : ControllerBase
{
    private readonly ISender _sender;

    public BookingsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(Guid serviceId, CreateBookingCommand command)
    {
        // Sprawdzamy nagłówek Authorization
        if (Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            Console.WriteLine($"Nagłówek Authorization: {authHeader}");
        }
        else
        {
            Console.WriteLine("Brak nagłówka Authorization!");
        }
        
        // Dodajemy logowanie informacji o autoryzacji
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        var userRole = User.FindFirstValue(ClaimTypes.Role);
        
        Console.WriteLine($"Użytkownik próbuje utworzyć rezerwację:");
        Console.WriteLine($"- ID: {userId ?? "brak"}");
        Console.WriteLine($"- Email: {userEmail ?? "brak"}");
        Console.WriteLine($"- Rola: {userRole ?? "brak"}");
        Console.WriteLine($"- Czy autoryzowany: {User.Identity?.IsAuthenticated}");
        
        // Wypisz wszystkie dostępne claims
        Console.WriteLine("Wszystkie claims:");
        foreach (var claim in User.Claims)
        {
            Console.WriteLine($"- {claim.Type}: {claim.Value}");
        }

        var fullCommand = command with { ServiceId = serviceId };
        var bookingId = await _sender.Send(fullCommand);
        return CreatedAtAction(nameof(Create), new { serviceId, id = bookingId }, bookingId);
    }

    [HttpGet("~/api/workshops/{workshopId}/bookings")]
    public async Task<IActionResult> GetForWorkshop(Guid workshopId)
    {
        var bookings = await _sender.Send(new GetBookingsForWorkshopQuery(workshopId));
        return Ok(bookings);
    }
}

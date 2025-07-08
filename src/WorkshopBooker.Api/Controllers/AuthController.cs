// src/WorkshopBooker.Api/Controllers/AuthController.cs
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WorkshopBooker.Application.Auth.Commands.Register;
using WorkshopBooker.Application.Auth.Dtos;
using WorkshopBooker.Application.Auth.Queries.Login;

namespace WorkshopBooker.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterUserCommand command)
    {
        var result = await _sender.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error, validationErrors = result.ValidationErrors });
        }

        return Ok(new { message = "Użytkownik został pomyślnie zarejestrowany" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginQuery query)
    {
        var result = await _sender.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error, validationErrors = result.ValidationErrors });
        }

        var token = result.Value ?? throw new InvalidOperationException("Token generation failed");
        var response = new AuthResponse(token);
        return Ok(response);
    }
}

// Dodajemy nowy kontroler do sprawdzania stanu API
[ApiController]
[Route("api")]
public class HealthController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult Check()
    {
        return Ok(new { status = "ok", timestamp = DateTime.UtcNow });
    }
}

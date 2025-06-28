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
        await _sender.Send(command);
        return Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginQuery query)
    {
        var token = await _sender.Send(query);
        var response = new AuthResponse(token);
        return Ok(response);
    }
}

// src/WorkshopBooker.Application/Auth/Commands/Register/RegisterUserCommand.cs
using MediatR;

namespace WorkshopBooker.Application.Auth.Commands.Register;

/// <summary>
/// Command to register a new user.
/// </summary>
/// <param name="Email">User email address.</param>
/// <param name="Password">User password.</param>
public record RegisterUserCommand(string Email, string Password) : IRequest;

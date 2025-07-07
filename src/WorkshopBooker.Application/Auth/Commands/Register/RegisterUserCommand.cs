// src/WorkshopBooker.Application/Auth/Commands/Register/RegisterUserCommand.cs
using MediatR;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Auth.Commands.Register;

/// <summary>
/// Command to register a new user.
/// </summary>
/// <param name="Email">User email address.</param>
/// <param name="Password">User password.</param>
/// <param name="FirstName">User first name.</param>
/// <param name="LastName">User last name.</param>
public record RegisterUserCommand(string Email, string Password, string FirstName, string LastName) : IRequest<Result>;

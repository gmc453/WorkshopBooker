// src/WorkshopBooker.Application/Auth/Queries/Login/LoginQuery.cs
using MediatR;
using WorkshopBooker.Application.Common;

namespace WorkshopBooker.Application.Auth.Queries.Login;

/// <summary>
/// Query used to authenticate a user and obtain JWT token.
/// </summary>
/// <param name="Email">User email.</param>
/// <param name="Password">User password.</param>
public record LoginQuery(string Email, string Password) : IRequest<Result<string>>;

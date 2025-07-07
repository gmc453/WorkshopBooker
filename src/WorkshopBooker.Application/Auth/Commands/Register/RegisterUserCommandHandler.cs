// src/WorkshopBooker.Application/Auth/Commands/Register/RegisterUserCommandHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common;
using WorkshopBooker.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace WorkshopBooker.Application.Auth.Commands.Register;

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<RegisterUserCommandHandler> _logger;

    public RegisterUserCommandHandler(
        IApplicationDbContext context, 
        IPasswordHasher passwordHasher,
        ILogger<RegisterUserCommandHandler> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task<Result> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Rejestracja nowego użytkownika: {Email}", request.Email);

            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == request.Email, cancellationToken);
            if (emailExists)
            {
                _logger.LogWarning("Próba rejestracji z istniejącym emailem: {Email}", request.Email);
                return Result.Failure("Użytkownik z tym adresem email już istnieje");
            }

            var hashedPassword = _passwordHasher.Hash(request.Password);
            var user = new User(Guid.NewGuid(), request.Email, hashedPassword, request.FirstName, request.LastName);
            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Pomyślnie zarejestrowano użytkownika: {UserId}", user.Id);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Błąd podczas rejestracji użytkownika: {Email}", request.Email);
            return Result.Failure("Wystąpił błąd podczas rejestracji użytkownika");
        }
    }
}

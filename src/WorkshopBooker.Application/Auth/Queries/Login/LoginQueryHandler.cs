// src/WorkshopBooker.Application/Auth/Queries/Login/LoginQueryHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common;
using Microsoft.Extensions.Logging;

namespace WorkshopBooker.Application.Auth.Queries.Login;

public class LoginQueryHandler : IRequestHandler<LoginQuery, Result<string>>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly ILogger<LoginQueryHandler> _logger;

    public LoginQueryHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator tokenGenerator,
        ILogger<LoginQueryHandler> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenGenerator = tokenGenerator;
        _logger = logger;
    }

    public async Task<Result<string>> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Próba logowania użytkownika: {Email}", request.Email);

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

            if (user is null)
            {
                _logger.LogWarning("Próba logowania z nieistniejącym emailem: {Email}", request.Email);
                return Result<string>.Failure("Nieprawidłowy email lub hasło");
            }

            if (!_passwordHasher.Verify(request.Password, user.HashedPassword))
            {
                _logger.LogWarning("Nieprawidłowe hasło dla użytkownika: {Email}", request.Email);
                return Result<string>.Failure("Nieprawidłowy email lub hasło");
            }

            var token = _tokenGenerator.GenerateToken(user);
            _logger.LogInformation("Pomyślnie zalogowano użytkownika: {UserId}", user.Id);
            return Result<string>.Success(token);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Błąd podczas logowania użytkownika: {Email}", request.Email);
            return Result<string>.Failure("Wystąpił błąd podczas logowania");
        }
    }
}

// src/WorkshopBooker.Application/Auth/Queries/Login/LoginQueryHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Application.Auth.Queries.Login;

public class LoginQueryHandler : IRequestHandler<LoginQuery, string>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _tokenGenerator;

    public LoginQueryHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator tokenGenerator)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<string> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user is null || !_passwordHasher.Verify(request.Password, user.HashedPassword))
        {
            throw new Exception("Invalid email or password.");
        }

        var token = _tokenGenerator.GenerateToken(user);
        return token;
    }
}

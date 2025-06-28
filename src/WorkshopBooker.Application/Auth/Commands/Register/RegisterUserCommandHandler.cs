// src/WorkshopBooker.Application/Auth/Commands/Register/RegisterUserCommandHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Auth.Commands.Register;

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public RegisterUserCommandHandler(IApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var emailExists = await _context.Users
            .AnyAsync(u => u.Email == request.Email, cancellationToken);
        if (emailExists)
        {
            throw new Exception("Email already exists.");
        }

        var hashedPassword = _passwordHasher.Hash(request.Password);
        var user = new User(Guid.NewGuid(), request.Email, hashedPassword, "Client");
        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);
    }
}

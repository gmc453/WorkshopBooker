// src/WorkshopBooker.Application/Workshops/Commands/CreateWorkshop/CreateWorkshopCommandHandler.cs
using MediatR;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Common;
using WorkshopBooker.Application.Common.Exceptions;
using WorkshopBooker.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace WorkshopBooker.Application.Workshops.Commands.CreateWorkshop;

public class CreateWorkshopCommandHandler : IRequestHandler<CreateWorkshopCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserProvider _currentUserProvider;
    private readonly ILogger<CreateWorkshopCommandHandler> _logger;

    public CreateWorkshopCommandHandler(
        IApplicationDbContext context, 
        ICurrentUserProvider currentUserProvider,
        ILogger<CreateWorkshopCommandHandler> logger)
    {
        _context = context;
        _currentUserProvider = currentUserProvider;
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(CreateWorkshopCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Sprawdź czy użytkownik jest zalogowany
            if (_currentUserProvider.UserId is null)
            {
                return Result<Guid>.Failure("Użytkownik musi być zalogowany");
            }

            _logger.LogInformation("Tworzenie nowego warsztatu: {WorkshopName}", request.Name);

            // Sprawdź czy warsztat o takiej nazwie już istnieje (case-insensitive, bez białych znaków)
            var normalizedName = request.Name.Trim().ToLowerInvariant();
            var existingWorkshop = _context.Workshops.FirstOrDefault(w => w.Name.Trim().ToLower() == normalizedName);
            if (existingWorkshop != null)
            {
                _logger.LogWarning("Próba utworzenia warsztatu o nazwie, która już istnieje: {WorkshopName}", request.Name);
                return Result<Guid>.Failure("Warsztat o takiej nazwie już istnieje");
            }

            // Stwórz nową encję na podstawie danych z komendy
            var workshop = new Workshop(
                Guid.NewGuid(),
                request.Name,
                request.Description);

            // Przypisz dodatkowe dane kontaktowe
            workshop.SetContactData(request.PhoneNumber, request.Email, request.Address);

            // Przypisz właściciela warsztatu
            workshop.AssignOwner(_currentUserProvider.UserId.Value);

            // Dodaj encję do kontekstu bazy danych
            _context.Workshops.Add(workshop);

            // Zapisz zmiany w bazie danych
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Pomyślnie utworzono warsztat z ID: {WorkshopId}", workshop.Id);

            return Result<Guid>.Success(workshop.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Błąd podczas tworzenia warsztatu: {WorkshopName}", request.Name);
            return Result<Guid>.Failure("Wystąpił błąd podczas tworzenia warsztatu");
        }
    }
}
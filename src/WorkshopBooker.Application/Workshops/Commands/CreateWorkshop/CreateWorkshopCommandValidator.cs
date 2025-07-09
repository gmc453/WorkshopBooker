using FluentValidation;

namespace WorkshopBooker.Application.Workshops.Commands.CreateWorkshop;

public class CreateWorkshopCommandValidator : AbstractValidator<CreateWorkshopCommand>
{
    public CreateWorkshopCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nazwa warsztatu jest wymagana")
            .MaximumLength(100).WithMessage("Nazwa warsztatu nie może przekraczać 100 znaków")
            .MinimumLength(3).WithMessage("Nazwa warsztatu musi mieć co najmniej 3 znaki")
            .Must(name => !string.IsNullOrWhiteSpace(name?.Trim())).WithMessage("Nazwa warsztatu jest wymagana");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Opis warsztatu jest wymagany")
            .MaximumLength(500).WithMessage("Opis warsztatu nie może przekraczać 500 znaków")
            .MinimumLength(10).WithMessage("Opis warsztatu musi mieć co najmniej 10 znaków");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email jest wymagany")
            .EmailAddress().WithMessage("Nieprawidłowy format adresu email");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Numer telefonu jest wymagany")
            .Matches(@"^\+?\d{9,15}$").WithMessage("Nieprawidłowy format numeru telefonu");

        // Price i Duration nie istnieją w CreateWorkshopCommand, więc usuwamy te reguły
    }
} 
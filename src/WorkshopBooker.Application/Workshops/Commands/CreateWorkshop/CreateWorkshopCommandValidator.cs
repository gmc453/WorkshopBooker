using FluentValidation;

namespace WorkshopBooker.Application.Workshops.Commands.CreateWorkshop;

public class CreateWorkshopCommandValidator : AbstractValidator<CreateWorkshopCommand>
{
    public CreateWorkshopCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nazwa warsztatu jest wymagana")
            .MaximumLength(100).WithMessage("Nazwa warsztatu nie może przekraczać 100 znaków")
            .MinimumLength(3).WithMessage("Nazwa warsztatu musi mieć co najmniej 3 znaki");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Opis warsztatu jest wymagany")
            .MaximumLength(500).WithMessage("Opis warsztatu nie może przekraczać 500 znaków")
            .MinimumLength(10).WithMessage("Opis warsztatu musi mieć co najmniej 10 znaków");

        // Price i Duration nie istnieją w CreateWorkshopCommand, więc usuwamy te reguły
    }
} 
using FluentValidation;

namespace WorkshopBooker.Application.Bookings.Commands.CreateBooking;

public class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(x => x.SlotId)
            .NotEmpty().WithMessage("ID dostępnego slotu jest wymagane");

        RuleFor(x => x.CustomerName)
            .MaximumLength(100).WithMessage("Imię i nazwisko nie może przekraczać 100 znaków")
            .When(x => !string.IsNullOrEmpty(x.CustomerName));

        RuleFor(x => x.CustomerEmail)
            .EmailAddress().WithMessage("Nieprawidłowy format adresu email")
            .MaximumLength(100).WithMessage("Email nie może przekraczać 100 znaków")
            .When(x => !string.IsNullOrEmpty(x.CustomerEmail));

        RuleFor(x => x.CustomerPhone)
            .MaximumLength(20).WithMessage("Telefon nie może przekraczać 20 znaków")
            .When(x => !string.IsNullOrEmpty(x.CustomerPhone));

        RuleFor(x => x.CarBrand)
            .MaximumLength(50).WithMessage("Marka pojazdu nie może przekraczać 50 znaków")
            .When(x => !string.IsNullOrEmpty(x.CarBrand));

        RuleFor(x => x.CarModel)
            .MaximumLength(50).WithMessage("Model pojazdu nie może przekraczać 50 znaków")
            .When(x => !string.IsNullOrEmpty(x.CarModel));

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notatki nie mogą przekraczać 500 znaków")
            .When(x => !string.IsNullOrEmpty(x.Notes));
    }
} 
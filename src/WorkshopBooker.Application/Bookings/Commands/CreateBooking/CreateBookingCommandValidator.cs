using FluentValidation;

namespace WorkshopBooker.Application.Bookings.Commands.CreateBooking;

public class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(x => x.SlotId)
            .NotEmpty().WithMessage("ID dostępnego slotu jest wymagane");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notatki nie mogą przekraczać 500 znaków")
            .When(x => !string.IsNullOrEmpty(x.Notes));
    }
} 
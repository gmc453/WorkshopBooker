using FluentValidation;

namespace WorkshopBooker.Application.Slots.Commands.CreateSlot;

public class CreateSlotCommandValidator : AbstractValidator<CreateSlotCommand>
{
    public CreateSlotCommandValidator()
    {
        RuleFor(x => x.WorkshopId)
            .NotEmpty().WithMessage("ID warsztatu jest wymagane");

        RuleFor(x => x.StartTime)
            .NotEmpty().WithMessage("Czas rozpoczęcia jest wymagany")
            .Must(startTime => startTime > DateTime.UtcNow)
            .WithMessage("Czas rozpoczęcia musi być w przyszłości");

        RuleFor(x => x.EndTime)
            .NotEmpty().WithMessage("Czas zakończenia jest wymagany")
            .Must((command, endTime) => endTime > command.StartTime)
            .WithMessage("Czas zakończenia musi być późniejszy niż czas rozpoczęcia");

        // MaxBookings nie istnieje w CreateSlotCommand, więc usuwamy tę regułę
    }
} 
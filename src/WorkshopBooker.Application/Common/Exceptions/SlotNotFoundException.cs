namespace WorkshopBooker.Application.Common.Exceptions;

public class SlotNotFoundException : Exception
{
    public SlotNotFoundException() : base("Termin nie został znaleziony")
    {
    }

    public SlotNotFoundException(string message) : base(message)
    {
    }

    public SlotNotFoundException(string message, Exception innerException) : base(message, innerException)
    {
    }
} 
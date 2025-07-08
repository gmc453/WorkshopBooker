namespace WorkshopBooker.Application.Common.Exceptions;

public class SlotOverlapException : Exception
{
    public SlotOverlapException() : base("Termin nakłada się z już istniejącym terminem")
    {
    }

    public SlotOverlapException(string message) : base(message)
    {
    }

    public SlotOverlapException(string message, Exception innerException) : base(message, innerException)
    {
    }
} 
namespace WorkshopBooker.Application.Common.Exceptions;

public class WorkshopNotFoundException : Exception
{
    public WorkshopNotFoundException() : base("Warsztat nie został znaleziony")
    {
    }

    public WorkshopNotFoundException(string message) : base(message)
    {
    }

    public WorkshopNotFoundException(string message, Exception innerException) : base(message, innerException)
    {
    }
} 
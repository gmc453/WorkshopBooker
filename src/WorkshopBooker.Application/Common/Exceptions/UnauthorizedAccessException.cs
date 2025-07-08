namespace WorkshopBooker.Application.Common.Exceptions;

public class UnauthorizedAccessException : Exception
{
    public UnauthorizedAccessException() : base("Brak uprawnień do wykonania tej operacji")
    {
    }

    public UnauthorizedAccessException(string message) : base(message)
    {
    }

    public UnauthorizedAccessException(string message, Exception innerException) : base(message, innerException)
    {
    }
} 
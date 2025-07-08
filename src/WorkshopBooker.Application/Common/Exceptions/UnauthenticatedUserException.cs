namespace WorkshopBooker.Application.Common.Exceptions;

public class UnauthenticatedUserException : Exception
{
    public UnauthenticatedUserException() : base("Użytkownik musi być zalogowany")
    {
    }

    public UnauthenticatedUserException(string message) : base(message)
    {
    }

    public UnauthenticatedUserException(string message, Exception innerException) : base(message, innerException)
    {
    }
} 
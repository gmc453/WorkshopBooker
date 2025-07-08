namespace WorkshopBooker.Application.Common.Exceptions;

/// <summary>
/// Wyjątek rzucany gdy użytkownik nie jest uwierzytelniony
/// </summary>
public class UnauthenticatedUserException : Exception
{
    public UnauthenticatedUserException() : base("Użytkownik musi być uwierzytelniony")
    {
    }

    public UnauthenticatedUserException(string message) : base(message)
    {
    }

    public UnauthenticatedUserException(string message, Exception innerException) : base(message, innerException)
    {
    }
} 
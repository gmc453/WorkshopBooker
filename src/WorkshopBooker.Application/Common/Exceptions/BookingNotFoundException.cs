namespace WorkshopBooker.Application.Common.Exceptions;

/// <summary>
/// Wyjątek rzucany gdy rezerwacja nie została znaleziona
/// </summary>
public class BookingNotFoundException : Exception
{
    public BookingNotFoundException() : base("Rezerwacja nie została znaleziona")
    {
    }

    public BookingNotFoundException(string message) : base(message)
    {
    }

    public BookingNotFoundException(string message, Exception innerException) : base(message, innerException)
    {
    }
} 
namespace WorkshopBooker.Application.Common.Exceptions;

public class ServiceNotFoundException : Exception
{
    public ServiceNotFoundException() : base("Usługa nie została znaleziona")
    {
    }

    public ServiceNotFoundException(string message) : base(message)
    {
    }

    public ServiceNotFoundException(string message, Exception innerException) : base(message, innerException)
    {
    }
} 
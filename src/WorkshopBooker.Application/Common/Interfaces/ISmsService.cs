namespace WorkshopBooker.Application.Common.Interfaces;

public interface ISmsService
{
    Task SendSmsAsync(string phoneNumber, string message);
} 
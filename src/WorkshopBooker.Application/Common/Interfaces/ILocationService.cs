namespace WorkshopBooker.Application.Common.Interfaces;

public interface ILocationService
{
    Task<string?> GetLocationAsync(string address, CancellationToken cancellationToken);
}

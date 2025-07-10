using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Infrastructure.Services;

public class LocationService : ILocationService
{
    private readonly HttpClient _httpClient;

    public LocationService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string?> GetLocationAsync(string address, CancellationToken cancellationToken)
    {
        // Placeholder implementation - in real scenario we would call external geocoding API
        await Task.Delay(50, cancellationToken);
        return address;
    }
}

using Microsoft.Extensions.Caching.Memory;
using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Application.Common.Services;

/// <summary>
/// Implementacja serwisu cache dla analytics
/// </summary>
public class AnalyticsCacheService : IAnalyticsCacheService
{
    private readonly IMemoryCache _cache;
    private readonly TimeSpan _defaultExpiration = TimeSpan.FromMinutes(10);
    
    public AnalyticsCacheService(IMemoryCache cache)
    {
        _cache = cache;
    }
    
    public async Task<T> GetOrCreateAsync<T>(
        string key, 
        Func<Task<T>> factory,
        TimeSpan? expiration = null)
    {
        if (_cache.TryGetValue(key, out T cachedValue))
            return cachedValue;
            
        var value = await factory();
        
        var cacheOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiration ?? _defaultExpiration,
            SlidingExpiration = TimeSpan.FromMinutes(5) // Przedłuża cache przy dostępie
        };
        
        _cache.Set(key, value, cacheOptions);
        
        return value;
    }
    
    public void Invalidate(string key)
    {
        _cache.Remove(key);
    }
    
    public void InvalidatePattern(string pattern)
    {
        // W MemoryCache nie ma wbudowanego pattern matching
        // W produkcji można użyć Redis lub innego cache z pattern matching
        // Na razie implementacja podstawowa
        if (_cache is MemoryCache memoryCache)
        {
            // MemoryCache nie obsługuje pattern matching, więc musimy ręcznie śledzić klucze
            // W prawdziwej aplikacji użyj Redis lub innego cache z pattern matching
        }
    }
} 
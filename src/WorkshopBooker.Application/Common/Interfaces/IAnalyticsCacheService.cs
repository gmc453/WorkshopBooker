namespace WorkshopBooker.Application.Common.Interfaces;

/// <summary>
/// Serwis do zarządzania cache dla analytics
/// </summary>
public interface IAnalyticsCacheService
{
    /// <summary>
    /// Pobiera wartość z cache lub tworzy ją za pomocą factory
    /// </summary>
    /// <typeparam name="T">Typ zwracanej wartości</typeparam>
    /// <param name="key">Klucz cache</param>
    /// <param name="factory">Funkcja tworząca wartość</param>
    /// <param name="expiration">Czas wygaśnięcia cache (opcjonalny)</param>
    /// <returns>Wartość z cache lub nowo utworzona</returns>
    Task<T> GetOrCreateAsync<T>(
        string key, 
        Func<Task<T>> factory,
        TimeSpan? expiration = null);
        
    /// <summary>
    /// Inwaliduje cache dla danego klucza
    /// </summary>
    /// <param name="key">Klucz do usunięcia</param>
    void Invalidate(string key);
    
    /// <summary>
    /// Inwaliduje wszystkie klucze zawierające pattern
    /// </summary>
    /// <param name="pattern">Pattern do wyszukania kluczy</param>
    void InvalidatePattern(string pattern);
} 
/**
 * Utility functions do bezpiecznego dostępu do właściwości obiektów
 * Eliminuje potencjalne null reference errors w frontend
 */

/**
 * Bezpiecznie pobiera wartość z obiektu z domyślną wartością
 */
export function safeGet<T>(obj: unknown, path: string, defaultValue: T): T {
  try {
    const keys = path.split('.');
    let result: unknown = obj;
    
    for (const key of keys) {
      if (result == null || (result as Record<string, unknown>)[key] === undefined) {
        return defaultValue;
      }
      result = (result as Record<string, unknown>)[key];
    }
    
    return (result as T) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Bezpiecznie pobiera wartość z obiektu z domyślną wartością dla liczby
 */
export function safeGetNumber(obj: unknown, path: string, defaultValue: number = 0): number {
  const value = safeGet(obj, path, defaultValue);
  return typeof value === 'number' ? value : defaultValue;
}

/**
 * Bezpiecznie pobiera wartość z obiektu z domyślną wartością dla stringa
 */
export function safeGetString(obj: unknown, path: string, defaultValue: string = ''): string {
  const value = safeGet(obj, path, defaultValue);
  return typeof value === 'string' ? value : defaultValue;
}

/**
 * Bezpiecznie pobiera wartość z obiektu z domyślną wartością dla boolean
 */
export function safeGetBoolean(obj: unknown, path: string, defaultValue: boolean = false): boolean {
  const value = safeGet(obj, path, defaultValue);
  return typeof value === 'boolean' ? value : defaultValue;
}

/**
 * Bezpiecznie pobiera wartość z obiektu z domyślną wartością dla tablicy
 */
export function safeGetArray<T>(obj: unknown, path: string, defaultValue: T[] = []): T[] {
  const value = safeGet(obj, path, defaultValue);
  return Array.isArray(value) ? value : defaultValue;
}

/**
 * Bezpiecznie formatuje datę
 */
export function safeFormatDate(date: unknown, format: string = 'dd.MM.yyyy HH:mm'): string {
  if (!date) return '-';
  
  try {
    const dateObj = new Date(date as string);
    if (isNaN(dateObj.getTime())) return '-';
    
    // Prosty formatter - można rozszerzyć o bardziej zaawansowane opcje
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    
    return format
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', year.toString())
      .replace('HH', hours)
      .replace('mm', minutes);
  } catch {
    return '-';
  }
}

/**
 * Bezpiecznie formatuje cenę
 */
export function safeFormatPrice(price: unknown, currency: string = 'PLN'): string {
  // Jeśli price jest już liczbą, użyj jej bezpośrednio
  if (typeof price === 'number') {
    return `${price.toFixed(2)} ${currency}`;
  }
  
  // Jeśli price jest null/undefined, zwróć 0
  if (price == null) {
    return `0.00 ${currency}`;
  }
  
  // Jeśli price jest stringiem, spróbuj przekonwertować na liczbę
  if (typeof price === 'string') {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? `0.00 ${currency}` : `${numPrice.toFixed(2)} ${currency}`;
  }
  
  // Dla obiektów użyj safeGetNumber z pustą ścieżką
  const numPrice = safeGetNumber(price, '', 0);
  return `${numPrice.toFixed(2)} ${currency}`;
}

/**
 * Bezpiecznie formatuje czas trwania w minutach
 */
export function safeFormatDuration(minutes: unknown): string {
  // Jeśli minutes jest już liczbą, użyj jej bezpośrednio
  if (typeof minutes === 'number') {
    const numMinutes = minutes;
    if (numMinutes < 60) {
      return `${numMinutes} min`;
    }
    
    const hours = Math.floor(numMinutes / 60);
    const remainingMinutes = numMinutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} h`;
    }
    
    return `${hours} h ${remainingMinutes} min`;
  }
  
  // Jeśli minutes jest null/undefined, zwróć 0 min
  if (minutes == null) {
    return '0 min';
  }
  
  // Jeśli minutes jest stringiem, spróbuj przekonwertować na liczbę
  if (typeof minutes === 'string') {
    const numMinutes = parseInt(minutes, 10);
    if (isNaN(numMinutes)) return '0 min';
    
    if (numMinutes < 60) {
      return `${numMinutes} min`;
    }
    
    const hours = Math.floor(numMinutes / 60);
    const remainingMinutes = numMinutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} h`;
    }
    
    return `${hours} h ${remainingMinutes} min`;
  }
  
  // Dla obiektów użyj safeGetNumber z pustą ścieżką
  const numMinutes = safeGetNumber(minutes, '', 0);
  if (numMinutes < 60) {
    return `${numMinutes} min`;
  }
  
  const hours = Math.floor(numMinutes / 60);
  const remainingMinutes = numMinutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} h`;
  }
  
  return `${hours} h ${remainingMinutes} min`;
}

/**
 * Bezpiecznie sprawdza czy obiekt ma określoną właściwość
 */
export function safeHas(obj: unknown, path: string): boolean {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result == null || !(key in (result as Record<string, unknown>))) {
        return false;
      }
      result = (result as Record<string, unknown>)[key];
    }
    
    return true;
  } catch {
    return false;
  }
} 
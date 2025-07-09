/**
 * Utility functions do bezpiecznego dostępu do właściwości obiektów
 * Eliminuje potencjalne null reference errors w frontend
 */

/**
 * Bezpiecznie pobiera wartość z obiektu z domyślną wartością
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result == null || result[key] === undefined) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Bezpiecznie pobiera wartość z obiektu z domyślną wartością dla liczby
 */
export function safeGetNumber(obj: any, path: string, defaultValue: number = 0): number {
  const value = safeGet(obj, path, defaultValue);
  return typeof value === 'number' ? value : defaultValue;
}

/**
 * Bezpiecznie pobiera wartość z obiektu z domyślną wartością dla stringa
 */
export function safeGetString(obj: any, path: string, defaultValue: string = ''): string {
  const value = safeGet(obj, path, defaultValue);
  return typeof value === 'string' ? value : defaultValue;
}

/**
 * Bezpiecznie pobiera wartość z obiektu z domyślną wartością dla boolean
 */
export function safeGetBoolean(obj: any, path: string, defaultValue: boolean = false): boolean {
  const value = safeGet(obj, path, defaultValue);
  return typeof value === 'boolean' ? value : defaultValue;
}

/**
 * Bezpiecznie pobiera wartość z obiektu z domyślną wartością dla tablicy
 */
export function safeGetArray<T>(obj: any, path: string, defaultValue: T[] = []): T[] {
  const value = safeGet(obj, path, defaultValue);
  return Array.isArray(value) ? value : defaultValue;
}

/**
 * Bezpiecznie formatuje datę
 */
export function safeFormatDate(date: any, format: string = 'dd.MM.yyyy HH:mm'): string {
  if (!date) return '-';
  
  try {
    const dateObj = new Date(date);
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
export function safeFormatPrice(price: any, currency: string = 'PLN'): string {
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
export function safeFormatDuration(minutes: any): string {
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
 * Bezpiecznie formatuje procent
 */
export function safeFormatPercentage(value: any, decimals: number = 1): string {
  // Jeśli value jest już liczbą, użyj jej bezpośrednio
  if (typeof value === 'number') {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  }
  
  // Jeśli value jest null/undefined, zwróć 0%
  if (value == null) {
    return '0.0%';
  }
  
  // Jeśli value jest stringiem, spróbuj przekonwertować na liczbę
  if (typeof value === 'string') {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? '0.0%' : `${numValue >= 0 ? '+' : ''}${numValue.toFixed(decimals)}%`;
  }
  
  // Dla obiektów użyj safeGetNumber z pustą ścieżką
  const numValue = safeGetNumber(value, '', 0);
  return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(decimals)}%`;
}

/**
 * Bezpiecznie sprawdza czy obiekt ma określoną właściwość
 */
export function safeHas(obj: any, path: string): boolean {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result == null || !(key in result)) {
        return false;
      }
      result = result[key];
    }
    
    return true;
  } catch {
    return false;
  }
} 
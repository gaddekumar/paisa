import Cookies from 'js-cookie';

const COOKIE_OPTIONS = {
  expires: 365, // 1 year
  sameSite: 'strict' as const,
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
};

export function saveToCookie(key: string, value: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    Cookies.set(key, JSON.stringify(value), COOKIE_OPTIONS);
  } catch (error) {
    console.error(`Error saving to cookie ${key}:`, error);
  }
}

export function loadFromCookie<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const value = Cookies.get(key);
    if (value) {
      return JSON.parse(value) as T;
    }
  } catch (error) {
    console.error(`Error loading from cookie ${key}:`, error);
  }
  return defaultValue;
}

export function removeCookie(key: string): void {
  if (typeof window === 'undefined') return;
  Cookies.remove(key);
}

const isBrowser = typeof window !== "undefined";

export function safeLocalStorageGetItem(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeLocalStorageSetItem(key: string, value: string): boolean {
  if (!isBrowser) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeLocalStorageRemoveItem(key: string): boolean {
  if (!isBrowser) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function safeLocalStorageClear(): boolean {
  if (!isBrowser) return false;
  try {
    localStorage.clear();
    return true;
  } catch {
    return false;
  }
}

export function safeSessionStorageGetItem(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSessionStorageSetItem(key: string, value: string): boolean {
  if (!isBrowser) return false;
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeSessionStorageRemoveItem(key: string): boolean {
  if (!isBrowser) return false;
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function safeSessionStorageClear(): boolean {
  if (!isBrowser) return false;
  try {
    sessionStorage.clear();
    return true;
  } catch {
    return false;
  }
}

export function readJsonStorage<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

export const STORAGE_KEYS = {
  THEME: "vite-ui-theme",
  HOME_TAB: "default-tab",
  EMAIL_VERIFY_DISMISSED: "email-verify-prompt-dismissed",
  CROSS_TAB_LOGOUT: "__cross_tab_logout__",
} as const;

export const VALID_THEMES = ["dark", "light", "system"] as const;
export const VALID_HOME_TABS = ["for-you", "following"] as const;

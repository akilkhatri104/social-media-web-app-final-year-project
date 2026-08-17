import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  safeLocalStorageGetItem,
  safeLocalStorageSetItem,
  safeLocalStorageRemoveItem,
  safeLocalStorageClear,
  safeSessionStorageGetItem,
  safeSessionStorageSetItem,
  safeSessionStorageRemoveItem,
  safeSessionStorageClear,
  readJsonStorage,
  STORAGE_KEYS,
  VALID_THEMES,
  VALID_HOME_TABS,
} from '~/lib/storage';

describe('safeLocalStorage wrappers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('get returns value that was set', () => {
    localStorage.setItem('test-key', 'test-val');
    expect(safeLocalStorageGetItem('test-key')).toBe('test-val');
  });

  it('get returns null for missing key', () => {
    expect(safeLocalStorageGetItem('nonexistent')).toBeNull();
  });

  it('set and get round-trip', () => {
    const ok = safeLocalStorageSetItem('k', 'v');
    expect(ok).toBe(true);
    expect(safeLocalStorageGetItem('k')).toBe('v');
  });

  it('set returns false on quota error', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(safeLocalStorageSetItem('k', 'v')).toBe(false);
    spy.mockRestore();
  });

  it('get returns false when localStorage throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(safeLocalStorageGetItem('k')).toBeNull();
    spy.mockRestore();
  });

  it('removeItem returns true on success', () => {
    localStorage.setItem('rm', '1');
    expect(safeLocalStorageRemoveItem('rm')).toBe(true);
    expect(localStorage.getItem('rm')).toBeNull();
  });

  it('clear returns true and clears all', () => {
    localStorage.setItem('a', '1');
    localStorage.setItem('b', '2');
    expect(safeLocalStorageClear()).toBe(true);
    expect(localStorage.length).toBe(0);
  });

  it('remove returns false on error', () => {
    const spy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('fail');
    });
    expect(safeLocalStorageRemoveItem('k')).toBe(false);
    spy.mockRestore();
  });

  it('clear returns false on error', () => {
    const spy = vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
      throw new Error('fail');
    });
    expect(safeLocalStorageClear()).toBe(false);
    spy.mockRestore();
  });
});

describe('safeSessionStorage wrappers', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('get returns value that was set', () => {
    sessionStorage.setItem('sk', 'sv');
    expect(safeSessionStorageGetItem('sk')).toBe('sv');
  });

  it('get returns null for missing key', () => {
    expect(safeSessionStorageGetItem('nope')).toBeNull();
  });

  it('set and get round-trip', () => {
    expect(safeSessionStorageSetItem('k', 'v')).toBe(true);
    expect(safeSessionStorageGetItem('k')).toBe('v');
  });

  it('set returns false on error', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('fail');
    });
    expect(safeSessionStorageSetItem('k', 'v')).toBe(false);
    spy.mockRestore();
  });

  it('get returns null on error', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('fail');
    });
    expect(safeSessionStorageGetItem('k')).toBeNull();
    spy.mockRestore();
  });

  it('remove returns true and removes', () => {
    sessionStorage.setItem('rm', '1');
    expect(safeSessionStorageRemoveItem('rm')).toBe(true);
    expect(sessionStorage.getItem('rm')).toBeNull();
  });

  it('remove returns false on error', () => {
    const spy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('fail');
    });
    expect(safeSessionStorageRemoveItem('k')).toBe(false);
    spy.mockRestore();
  });

  it('clear returns true and clears', () => {
    sessionStorage.setItem('a', '1');
    expect(safeSessionStorageClear()).toBe(true);
    expect(sessionStorage.length).toBe(0);
  });

  it('clear returns false on error', () => {
    const spy = vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
      throw new Error('fail');
    });
    expect(safeSessionStorageClear()).toBe(false);
    spy.mockRestore();
  });
});

describe('readJsonStorage', () => {
  it('returns fallback for null input', () => {
    expect(readJsonStorage(null, 'default')).toBe('default');
  });

  it('returns fallback for empty string', () => {
    expect(readJsonStorage('', 42)).toBe(42);
  });

  it('parses valid JSON', () => {
    expect(readJsonStorage('{"a":1}', {})).toEqual({ a: 1 });
  });

  it('returns fallback for invalid JSON', () => {
    expect(readJsonStorage('not json', [])).toEqual([]);
  });

  it('returns parsed array', () => {
    expect(readJsonStorage('[1,2,3]', [])).toEqual([1, 2, 3]);
  });

  it('parses valid JSON numbers', () => {
    expect(readJsonStorage('123', 'fallback')).toBe(123);
  });
});

describe('STORAGE_KEYS', () => {
  it('has expected keys', () => {
    expect(STORAGE_KEYS.THEME).toBe('vite-ui-theme');
    expect(STORAGE_KEYS.HOME_TAB).toBe('default-tab');
    expect(STORAGE_KEYS.EMAIL_VERIFY_DISMISSED).toBe('email-verify-prompt-dismissed');
    expect(STORAGE_KEYS.CROSS_TAB_LOGOUT).toBe('__cross_tab_logout__');
  });
});

describe('VALID_THEMES', () => {
  it('contains dark, light, system', () => {
    expect(VALID_THEMES).toContain('dark');
    expect(VALID_THEMES).toContain('light');
    expect(VALID_THEMES).toContain('system');
    expect(VALID_THEMES).toHaveLength(3);
  });
});

describe('VALID_HOME_TABS', () => {
  it('contains for-you, following', () => {
    expect(VALID_HOME_TABS).toContain('for-you');
    expect(VALID_HOME_TABS).toContain('following');
    expect(VALID_HOME_TABS).toHaveLength(2);
  });
});

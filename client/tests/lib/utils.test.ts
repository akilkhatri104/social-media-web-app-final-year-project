import { describe, it, expect } from 'vitest';
import { cn } from '~/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    const result = cn('foo', 'bar');
    expect(result).toContain('foo');
    expect(result).toContain('bar');
  });

  it('deduplicates conflicting tailwind classes', () => {
    const result = cn('p-2', 'p-4');
    expect(result).toBe('p-4');
  });

  it('returns empty string with no args', () => {
    expect(cn()).toBe('');
  });

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'extra');
    expect(result).toContain('base');
    expect(result).toContain('extra');
    expect(result).not.toContain('hidden');
  });

  it('handles undefined and null', () => {
    const result = cn('a', undefined, null, 'b');
    expect(result).toContain('a');
    expect(result).toContain('b');
  });
});

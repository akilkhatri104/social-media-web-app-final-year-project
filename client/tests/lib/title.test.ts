import { describe, it, expect } from 'vitest';
import {
  formatDocumentTitle,
  truncateTitleSegment,
  APP_TITLE,
} from '~/lib/title';

describe('APP_TITLE', () => {
  it('is "PU Connect"', () => {
    expect(APP_TITLE).toBe('PU Connect');
  });
});

describe('formatDocumentTitle', () => {
  it('returns APP_TITLE when no argument', () => {
    expect(formatDocumentTitle()).toBe('PU Connect');
  });

  it('returns APP_TITLE for null', () => {
    expect(formatDocumentTitle(null)).toBe('PU Connect');
  });

  it('returns APP_TITLE for undefined', () => {
    expect(formatDocumentTitle(undefined)).toBe('PU Connect');
  });

  it('returns formatted title for given page', () => {
    expect(formatDocumentTitle('Home')).toBe('Home | PU Connect');
  });

  it('handles empty string as falsy', () => {
    expect(formatDocumentTitle('')).toBe('PU Connect');
  });
});

describe('truncateTitleSegment', () => {
  it('returns original when under max length', () => {
    expect(truncateTitleSegment('short')).toBe('short');
  });

  it('returns original when exactly max length', () => {
    const str = 'a'.repeat(60);
    expect(truncateTitleSegment(str)).toBe(str);
  });

  it('truncates and adds ellipsis when over max length', () => {
    const result = truncateTitleSegment('a'.repeat(70));
    expect(result.length).toBe(60);
    expect(result).toMatch(/\.\.\.$/);
  });

  it('uses custom max length', () => {
    const result = truncateTitleSegment('abcdef', 4);
    expect(result).toBe('a...');
  });

  it('normalizes whitespace', () => {
    const result = truncateTitleSegment('hello   world   test');
    expect(result).toBe('hello world test');
  });
});

import { extractHashtags } from '../../src/lib/hashtags.js';

describe('extractHashtags', () => {
  it('returns empty array for empty string', () => {
    expect(extractHashtags('')).toEqual([]);
  });

  it('extracts a single hashtag', () => {
    expect(extractHashtags('Hello #world')).toEqual(['world']);
  });

  it('extracts multiple hashtags', () => {
    expect(extractHashtags('#one #two #three')).toEqual(['one', 'two', 'three']);
  });

  it('lowercases hashtags', () => {
    expect(extractHashtags('#HELLO #Hello #hello')).toEqual(['hello']);
  });

  it('deduplicates hashtags', () => {
    expect(extractHashtags('#tag #tag #tag')).toEqual(['tag']);
  });

  it('extracts hashtags mid-sentence', () => {
    expect(extractHashtags('Loving #TypeScript today!')).toEqual(['typescript']);
  });

  it('ignores hashtags with no word boundary before #', () => {
    expect(extractHashtags('abc#def')).toEqual([]);
  });

  it('handles hashtags at start of string', () => {
    expect(extractHashtags('#start of text')).toEqual(['start']);
  });

  it('handles hashtags at end of string', () => {
    expect(extractHashtags('end of text #fin')).toEqual(['fin']);
  });

  it('handles hashtags after punctuation', () => {
    expect(extractHashtags('Check this out! #cool, right?')).toEqual(['cool']);
  });

  it('ignores empty hashtags (# alone)', () => {
    expect(extractHashtags('Hello # World')).toEqual([]);
  });

  it('limits tag length to 50 characters', () => {
    const longTag = 'a'.repeat(60);
    const result = extractHashtags(`#${longTag}`);
    expect(result.length).toBe(1);
    expect(result[0]!.length).toBeLessThanOrEqual(50);
  });

  it('allows underscores in hashtags', () => {
    expect(extractHashtags('#my_tag')).toEqual(['my_tag']);
  });

  it('allows numbers in hashtags', () => {
    expect(extractHashtags('#tag123')).toEqual(['tag123']);
  });
});

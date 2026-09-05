import { extractMentions } from '../../src/lib/mentions.js';

describe('extractMentions', () => {
  it('returns empty array for empty string', () => {
    expect(extractMentions('')).toEqual([]);
  });

  it('extracts a single mention', () => {
    expect(extractMentions('Hello @alice')).toEqual(['alice']);
  });

  it('extracts multiple mentions', () => {
    expect(extractMentions('@alice @bob @charlie')).toEqual([
      'alice',
      'bob',
      'charlie',
    ]);
  });

  it('lowercases mentions', () => {
    expect(extractMentions('@Alice @ALICE')).toEqual(['alice']);
  });

  it('deduplicates mentions', () => {
    expect(extractMentions('@alice @alice @alice')).toEqual(['alice']);
  });

  it('ignores mentions with no word boundary before @', () => {
    expect(extractMentions('foo@bar')).toEqual([]);
  });

  it('handles mentions after punctuation', () => {
    expect(extractMentions('Hey, @alice!')).toEqual(['alice']);
  });

  it('handles mention at start of string', () => {
    expect(extractMentions('@start here')).toEqual(['start']);
  });

  it('ignores empty mentions (@ alone or @ followed by non-word)', () => {
    expect(extractMentions('Hello @ world')).toEqual([]);
  });

  it('allows underscores in usernames', () => {
    expect(extractMentions('@user_name')).toEqual(['user_name']);
  });

  it('allows numbers in usernames', () => {
    expect(extractMentions('@user123')).toEqual(['user123']);
  });

  it('limits username length to 30 characters', () => {
    const longName = 'a'.repeat(40);
    const result = extractMentions(`@${longName}`);
    expect(result.length).toBe(1);
    expect(result[0]!.length).toBeLessThanOrEqual(30);
  });

  it('handles mixed mentions and hashtags', () => {
    const result = extractMentions('@alice #cool @bob');
    expect(result).toEqual(['alice', 'bob']);
  });
});

import { toPostDto } from '../../src/lib/postDto.js';

describe('toPostDto', () => {
  const baseDate = new Date('2026-01-01T00:00:00Z');

  it('transforms a minimal post record', () => {
    const input = {
      id: 1,
      userId: 'user-1',
      parentPostId: null,
      quotedPostId: null,
      content: 'Hello world',
      visibility: 'public' as const,
      createdAt: baseDate,
      updatedAt: baseDate,
    };

    const result = toPostDto(input);

    expect(result.id).toBe(1);
    expect(result.userId).toBe('user-1');
    expect(result.content).toBe('Hello world');
    expect(result.visibility).toBe('public');
    expect(result.author).toBeNull();
    expect(result.media).toEqual([]);
    expect(result.hashtags).toEqual([]);
    expect(result.parentPost).toBeNull();
    expect(result.quotedPost).toBeNull();
    expect(result.likeCount).toBe(0);
    expect(result.commentCount).toBe(0);
    expect(result.repostCount).toBe(0);
  });

  it('extracts hashtags from postHashtags', () => {
    const input = {
      id: 1,
      userId: 'user-1',
      parentPostId: null,
      quotedPostId: null,
      content: '#hello #world',
      visibility: 'public' as const,
      createdAt: baseDate,
      updatedAt: baseDate,
      postHashtags: [
        { hashtag: { name: 'hello' } },
        { hashtag: { name: 'world' } },
      ],
    };

    const result = toPostDto(input as any);
    expect(result.hashtags).toEqual(['hello', 'world']);
  });

  it('filters out null hashtags', () => {
    const input = {
      id: 1,
      userId: 'user-1',
      parentPostId: null,
      quotedPostId: null,
      content: '#valid #null-tag',
      visibility: 'public' as const,
      createdAt: baseDate,
      updatedAt: baseDate,
      postHashtags: [
        { hashtag: { name: 'valid' } },
        { hashtag: null },
      ],
    };

    const result = toPostDto(input as any);
    expect(result.hashtags).toEqual(['valid']);
  });

  it('counts likes, comments, and reposts', () => {
    const input = {
      id: 1,
      userId: 'user-1',
      parentPostId: null,
      quotedPostId: null,
      content: 'test',
      visibility: 'public' as const,
      createdAt: baseDate,
      updatedAt: baseDate,
      likes: [{ userId: 'a' }, { userId: 'b' }],
      comments: [{ userId: 'c' }],
      reposts: [{ userId: 'd' }],
      quotePosts: [{ userId: 'e' }],
    };

    const result = toPostDto(input as any);
    expect(result.likeCount).toBe(2);
    expect(result.commentCount).toBe(1);
    expect(result.repostCount).toBe(2); // reposts + quotePosts
  });

  it('includes parentPost when present', () => {
    const input = {
      id: 2,
      userId: 'user-2',
      parentPostId: 1,
      quotedPostId: null,
      content: 'reply',
      visibility: 'public' as const,
      createdAt: baseDate,
      updatedAt: baseDate,
      parentPost: {
        id: 1,
        userId: 'user-1',
        content: 'original',
        createdAt: baseDate,
        author: { id: 'user-1', name: 'Alice' },
      },
    };

    const result = toPostDto(input as any);
    expect(result.parentPost).not.toBeNull();
    expect(result.parentPost!.id).toBe(1);
    expect(result.parentPost!.content).toBe('original');
    expect(result.parentPost!.author).toEqual({ id: 'user-1', name: 'Alice' });
  });

  it('includes quotedPost when present', () => {
    const input = {
      id: 3,
      userId: 'user-3',
      parentPostId: null,
      quotedPostId: 1,
      content: 'quote',
      visibility: 'public' as const,
      createdAt: baseDate,
      updatedAt: baseDate,
      quotedPost: {
        id: 1,
        userId: 'user-1',
        parentPostId: null,
        quotedPostId: null,
        content: 'original',
        visibility: 'public' as const,
        createdAt: baseDate,
        updatedAt: baseDate,
      },
    };

    const result = toPostDto(input as any);
    expect(result.quotedPost).not.toBeNull();
    expect(result.quotedPost!.id).toBe(1);
    expect(result.quotedPost!.content).toBe('original');
  });

  it('defaults visibility to public when null', () => {
    const input = {
      id: 1,
      userId: 'user-1',
      parentPostId: null,
      quotedPostId: null,
      content: 'test',
      visibility: null,
      createdAt: baseDate,
      updatedAt: baseDate,
    };

    const result = toPostDto(input as any);
    expect(result.visibility).toBe('public');
  });
});

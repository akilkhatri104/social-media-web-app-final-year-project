const HASHTAG_PATTERN = /(?:^|[^\w])#([a-zA-Z0-9_]{1,50})/g;

export function extractHashtags(content: string): string[] {
  const hashtags = new Set<string>();

  for (const match of content.matchAll(HASHTAG_PATTERN)) {
    const tag = match[1]?.trim().toLowerCase();
    if (tag) {
      hashtags.add(tag);
    }
  }

  return [...hashtags];
}

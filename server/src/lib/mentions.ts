const MENTION_PATTERN = /(^|[^a-zA-Z0-9_])@([a-zA-Z0-9_]{1,30})/g;

export function extractMentions(content: string) {
  const mentions = new Set<string>();

  for (const match of content.matchAll(MENTION_PATTERN)) {
    const username = match[2];

    if (username) {
      mentions.add(username.toLowerCase());
    }
  }

  return [...mentions];
}

import { Link } from "react-router";

const HASHTAG_PATTERN = /#([a-zA-Z0-9_]{1,50})/g;

export function LinkifiedText({ content }: { content: string }) {
  const segments: Array<{ type: "text" | "tag"; value: string }> = [];
  let lastIndex = 0;

  for (const match of content.matchAll(HASHTAG_PATTERN)) {
    const start = match.index ?? 0;
    const tag = match[1];

    if (start > lastIndex) {
      segments.push({ type: "text", value: content.slice(lastIndex, start) });
    }

    segments.push({ type: "tag", value: tag.toLowerCase() });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: "text", value: content.slice(lastIndex) });
  }

  if (segments.length === 0) {
    return <>{content}</>;
  }

  return (
    <span className="whitespace-pre-wrap break-words">
      {segments.map((segment, index) =>
        segment.type === "tag" ? (
          <Link
            key={`${segment.type}-${segment.value}-${index}`}
            to={`/hashtag/${segment.value}`}
            className="font-medium text-primary hover:underline"
          >
            #{segment.value}
          </Link>
        ) : (
          <span key={`${segment.type}-${index}`}>{segment.value}</span>
        ),
      )}
    </span>
  );
}

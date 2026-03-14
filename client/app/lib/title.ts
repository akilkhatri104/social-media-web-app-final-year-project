import { useEffect } from "react";

export const APP_TITLE = "PU Connect";

export function formatDocumentTitle(pageTitle?: string | null) {
  if (!pageTitle) {
    return APP_TITLE;
  }

  return `${pageTitle} | ${APP_TITLE}`;
}

export function truncateTitleSegment(value: string, maxLength = 60) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

export function useDocumentTitle(pageTitle?: string | null) {
  useEffect(() => {
    document.title = formatDocumentTitle(pageTitle);
  }, [pageTitle]);
}

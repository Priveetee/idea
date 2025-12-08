export type TextSegment =
  | { type: "text"; value: string }
  | { type: "link"; url: string };

const URL_REGEX = /https?:\/\/[^\s)]+/gi;

export function parseTextWithLinks(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    const url = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      segments.push({
        type: "text",
        value: text.slice(lastIndex, index),
      });
    }

    segments.push({ type: "link", url });
    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  return segments;
}

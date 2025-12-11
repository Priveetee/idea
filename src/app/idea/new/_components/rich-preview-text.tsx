"use client";

import type { TextSegment } from "./parse-text-with-links";
import { parseTextWithLinks } from "./parse-text-with-links";
import { getLinkMeta } from "@/lib/link-icons";

type RichPreviewTextProps = {
  text: string;
};

export function RichPreviewText({ text }: RichPreviewTextProps) {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const segments: TextSegment[] = parseTextWithLinks(trimmed);

  return (
    <div className="rounded-2xl bg-zinc-950/60 px-4 py-3 text-[13px] leading-relaxed text-zinc-200">
      <p className="whitespace-pre-wrap">
        {segments.map((segment, index) => {
          if (segment.type === "text") {
            return <span key={`t-${index}`}>{segment.value}</span>;
          }

          const meta = getLinkMeta(segment.url);
          const Icon = meta.icon;

          let host = "";
          try {
            host = new URL(segment.url).hostname.replace(/^www\./i, "");
          } catch {
            host = segment.url;
          }

          return (
            <span key={`l-${index}`} className="inline-block align-middle">
              <a
                href={segment.url}
                target="_blank"
                rel="noreferrer noopener"
                className="ml-1 inline-flex items-center gap-1 rounded-full bg-zinc-900/80 px-2 py-0.5 text-[12px] text-zinc-100 underline-offset-2 hover:bg-zinc-800 hover:underline"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-950">
                  <Icon className="h-3 w-3" />
                </span>
                <span className="max-w-[140px] truncate">{meta.label}</span>
                <span className="max-w-[120px] truncate text-[10px] text-zinc-400">
                  {host}
                </span>
              </a>
            </span>
          );
        })}
      </p>
    </div>
  );
}

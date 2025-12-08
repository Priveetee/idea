"use client";

import { getLinkMeta } from "@/lib/link-icons";
import { parseTextWithLinks, type TextSegment } from "./parse-text-with-links";

type RichPreviewTextProps = {
  text: string;
};

export function RichPreviewText({ text }: RichPreviewTextProps) {
  const segments: TextSegment[] = parseTextWithLinks(text);

  if (!segments.length) return null;

  return (
    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-zinc-100">
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={`text-${index}`}>{segment.value}</span>;
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
          <span
            key={`link-${index}`}
            className="inline-flex items-center gap-1 align-baseline"
          >
            <Icon className="h-3 w-3 text-zinc-400" />
            <a
              href={segment.url}
              target="_blank"
              rel="noreferrer noopener"
              title={segment.url}
              className="text-[12px] text-[#a5b4fc] underline-offset-2 hover:text-[#c7d2fe] hover:underline"
            >
              {meta.label || host}
            </a>
          </span>
        );
      })}
    </p>
  );
}

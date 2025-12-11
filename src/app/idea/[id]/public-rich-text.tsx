"use client";

import { useState } from "react";
import { EXTERNAL_ICON, getLinkMeta } from "@/lib/link-icons";
import {
  parseTextWithLinks,
  type TextSegment,
} from "../new/_components/parse-text-with-links";

type PublicRichTextProps = {
  content: string;
};

function stripReferencesPrefix(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("références intéressantes")) {
    const idx = trimmed.indexOf(":");
    if (idx !== -1 && idx + 1 < trimmed.length) {
      return trimmed.slice(idx + 1).trim();
    }
    return "";
  }
  return trimmed;
}

export function PublicRichText({ content }: PublicRichTextProps) {
  const [expanded, setExpanded] = useState(false);

  const base = stripReferencesPrefix(content);
  const trimmed = base.trim();

  if (!trimmed) {
    return (
      <div className="rounded-2xl bg-zinc-950/60 px-4 py-3 text-[13px] text-zinc-500">
        Aucun détail supplémentaire n&apos;a encore été ajouté.
      </div>
    );
  }

  const segments: TextSegment[] = parseTextWithLinks(trimmed);
  const ExternalIcon = EXTERNAL_ICON;

  return (
    <div className="space-y-3">
      <div
        className={`rounded-2xl bg-zinc-950/60 px-5 py-4 text-[13px] leading-relaxed text-zinc-200 ${
          expanded ? "" : "max-h-48 overflow-hidden"
        }`}
      >
        <p className="whitespace-pre-wrap">
          {segments.map((seg, idx) => {
            if (seg.type === "text") {
              return <span key={`t-${idx}`}>{seg.value}</span>;
            }

            const meta = getLinkMeta(seg.url);
            const Icon = meta.icon;

            let host = "";
            try {
              host = new URL(seg.url).hostname.replace(/^www\./i, "");
            } catch {
              host = seg.url;
            }

            return (
              <span
                key={`l-${idx}`}
                className="inline-flex items-center gap-1 align-middle"
              >
                <a
                  href={seg.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-900/80 px-2 py-0.5 text-[12px] text-zinc-100 underline-offset-2 hover:bg-zinc-800 hover:underline"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-950">
                    <Icon className="h-3 w-3" />
                  </span>
                  <span className="max-w-[140px] truncate">{meta.label}</span>
                  <span className="max-w-[120px] truncate text-[10px] text-zinc-400">
                    {host}
                  </span>
                  <ExternalIcon className="h-3 w-3 text-zinc-500" />
                </a>
              </span>
            );
          })}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[11px] text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
        >
          {expanded ? "Réduire" : "Lire la suite"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { EXTERNAL_ICON, getLinkMeta } from "@/lib/link-icons";
import {
  parseTextWithLinks,
  type TextSegment,
} from "@/app/idea/new/_components/parse-text-with-links";

type AdminRichTextPreviewProps = {
  content: string;
};

export function AdminRichTextPreview({ content }: AdminRichTextPreviewProps) {
  const [expanded, setExpanded] = useState(false);

  const trimmed = content.trim();
  if (!trimmed) {
    return (
      <div className="rounded-xl bg-zinc-950/60 px-4 py-3 text-[13px] text-zinc-500">
        Aucun détail supplémentaire.
      </div>
    );
  }

  const segments: TextSegment[] = parseTextWithLinks(trimmed);
  const ExternalIcon = EXTERNAL_ICON;

  const approxLength = trimmed.length;
  const needsExpand = approxLength > 700 || segments.length > 10;

  return (
    <div className="space-y-3">
      <div
        className={`rounded-xl bg-zinc-950/60 px-5 py-4 text-[13px] leading-relaxed text-zinc-200 ${
          expanded ? "max-h-[520px]" : "max-h-[260px]"
        } overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full`}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#3f3f46 transparent",
        }}
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
                  <span className="max-w-[180px] truncate">{meta.label}</span>
                  <span className="max-w-[140px] truncate text-[10px] text-zinc-400">
                    {host}
                  </span>
                  <ExternalIcon className="h-3 w-3 text-zinc-500" />
                </a>
              </span>
            );
          })}
        </p>
      </div>

      {needsExpand && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
          >
            {expanded ? "Réduire" : "Lire la suite"}
          </button>
        </div>
      )}
    </div>
  );
}

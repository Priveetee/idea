"use client";

import { useState } from "react";
import { getLinkMeta, EXTERNAL_ICON } from "@/lib/link-icons";
import {
  parseTextWithLinks,
  type TextSegment,
} from "@/app/idea/new/_components/parse-text-with-links";

type HubIdeaComment = {
  id: string;
  text: string;
  createdAt: number;
};

type HubIdeaCommentsProps = {
  comments: HubIdeaComment[];
};

function getRelativeTime(ts: number) {
  const diffMs = Date.now() - ts;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) return "à l’instant";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD} j`;
}

const MAX_LENGTH = 220;

export function HubIdeaComments({ comments }: HubIdeaCommentsProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  if (comments.length === 0) return null;

  const toggle = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className="mb-3 max-h-56 space-y-2 overflow-y-auto pr-1"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#3f3f46 transparent",
      }}
    >
      {comments.map((c) => {
        const expanded = expandedIds[c.id] ?? false;
        const tooLong = c.text.length > MAX_LENGTH;
        const rawText =
          expanded || !tooLong ? c.text : `${c.text.slice(0, MAX_LENGTH)}…`;

        const segments: TextSegment[] = parseTextWithLinks(rawText);
        const ExternalIcon = EXTERNAL_ICON;

        return (
          <div
            key={c.id}
            className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-[12px] text-zinc-200"
          >
            <div className="max-w-full whitespace-pre-wrap break-words">
              {segments.map((seg, idx) => {
                if (seg.type === "text") {
                  return <span key={`t-${c.id}-${idx}`}>{seg.value}</span>;
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
                    key={`l-${c.id}-${idx}`}
                    className="inline-flex items-center gap-1 align-middle"
                  >
                    <a
                      href={seg.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 rounded-full bg-zinc-900/80 px-2 py-0.5 text-[11px] text-zinc-100 underline-offset-2 hover:bg-zinc-800 hover:underline"
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-950">
                        <Icon className="h-3 w-3" />
                      </span>
                      <span className="max-w-[120px] truncate">
                        {meta.label}
                      </span>
                      <span className="max-w-[110px] truncate text-[10px] text-zinc-400">
                        {host}
                      </span>
                      <ExternalIcon className="h-3 w-3 text-zinc-500" />
                    </a>
                  </span>
                );
              })}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500">
              <span>{getRelativeTime(c.createdAt)}</span>
              {tooLong && (
                <button
                  type="button"
                  onClick={() => toggle(c.id)}
                  className="text-[10px] text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
                >
                  {expanded ? "Réduire" : "Lire la suite"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

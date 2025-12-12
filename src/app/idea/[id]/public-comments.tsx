"use client";

import { useState } from "react";
import { getLinkMeta, EXTERNAL_ICON } from "@/lib/link-icons";
import {
  parseTextWithLinks,
  type TextSegment,
} from "@/app/idea/new/_components/parse-text-with-links";

type PublicIdeaComment = {
  id: string;
  text: string;
  createdAt: number;
};

type PublicCommentsProps = {
  comments: PublicIdeaComment[];
};

const MAX_LENGTH = 220;

export function PublicComments({ comments }: PublicCommentsProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  if (comments.length === 0) {
    return (
      <div className="text-[12px] text-zinc-500">
        Aucun commentaire pour l&apos;instant.
      </div>
    );
  }

  const toggle = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className="max-h-60 space-y-2 overflow-y-auto pr-1"
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
            className="rounded-xl bg-zinc-900/80 px-3 py-2 text-[12px] text-zinc-100"
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
                      className="inline-flex items-center gap-1 rounded-full bg-zinc-950 px-2 py-0.5 text-[11px] text-zinc-100 underline-offset-2 hover:bg-zinc-800 hover:underline"
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900">
                        <Icon className="h-3 w-3" />
                      </span>
                      <span className="max-w-[140px] truncate">
                        {meta.label}
                      </span>
                      <span className="max-w-[120px] truncate text-[10px] text-zinc-400">
                        {host}
                      </span>
                      <ExternalIcon className="h-3 w-3 text-zinc-500" />
                    </a>
                  </span>
                );
              })}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500">
              <span>il y a quelques secondes</span>
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

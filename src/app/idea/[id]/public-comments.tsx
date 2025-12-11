"use client";

import { useState } from "react";

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
    <div className="space-y-1">
      {comments.map((c) => {
        const expanded = expandedIds[c.id] ?? false;
        const tooLong = c.text.length > MAX_LENGTH;
        const displayText =
          expanded || !tooLong ? c.text : `${c.text.slice(0, MAX_LENGTH)}…`;

        return (
          <div
            key={c.id}
            className="rounded-xl bg-zinc-900/80 px-3 py-2 text-[12px] text-zinc-100"
          >
            <div className="max-w-full whitespace-pre-wrap break-words">
              {displayText}
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

"use client";

import { useState } from "react";

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
  if (diffSec < 60) return "il y a quelques secondes";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD} j`;
}

export function HubIdeaComments({ comments }: HubIdeaCommentsProps) {
  const [expandedComments, setExpandedComments] = useState<
    Record<string, boolean>
  >({});
  const [showAllComments, setShowAllComments] = useState(false);

  if (comments.length === 0) return null;

  const baseComments = showAllComments
    ? comments
    : comments.length <= 2
      ? comments
      : comments.slice(-2);
  const visibleComments = baseComments;

  const toggleCommentExpand = (id: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleShowAllComments = () => {
    setShowAllComments((prev) => !prev);
  };

  return (
    <div className="relative mb-2 max-h-32 space-y-1.5 overflow-hidden text-[12px] text-zinc-300">
      {comments.length > visibleComments.length && (
        <button
          type="button"
          onClick={handleToggleShowAllComments}
          className="mb-1 text-[11px] text-zinc-500 hover:text-zinc-300"
        >
          {showAllComments
            ? "Réduire les commentaires"
            : `${comments.length - visibleComments.length} commentaire(s) plus ancien(s)…`}
        </button>
      )}

      {visibleComments.map((c) => {
        const expanded = expandedComments[c.id] === true;
        const isLong = c.text.length > 160;

        return (
          <div
            key={c.id}
            className="rounded-lg bg-zinc-900/60 px-3 py-1.5 text-[12px] text-zinc-200"
          >
            <p className={`break-words ${expanded ? "" : "line-clamp-2"}`}>
              {c.text}
            </p>
            <div className="mt-0.5 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">
                {getRelativeTime(c.createdAt)}
              </span>
              {isLong && (
                <button
                  type="button"
                  onClick={() => toggleCommentExpand(c.id)}
                  className="text-[11px] font-medium text-zinc-500 hover:text-zinc-300"
                >
                  {expanded ? "Réduire" : "Lire la suite"}
                </button>
              )}
            </div>
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-[#0A0A0C] to-transparent" />
    </div>
  );
}

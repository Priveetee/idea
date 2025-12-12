"use client";

import { useState, type KeyboardEvent } from "react";
import { RiSendPlaneFill } from "react-icons/ri";
import { HubIdeaComments } from "./hub-idea-comments";
import { HubIdeaHeaderBody } from "./hub-idea-header-body";
import { HubIdeaReactionsBar } from "./hub-idea-reactions-bar";

export type HubIdeaLink = {
  id: string;
  label: string;
  url: string;
};

export type HubIdeaBullet = {
  id: string;
  text: string;
};

export type HubIdeaItem = {
  id: string;
  label: string;
  status: string;
  originLabel?: string;
  originColor?: string;
  managerSummary?: string;
  managerContent?: string;
  managerLinks?: HubIdeaLink[];
  managerBullets?: HubIdeaBullet[];
  managerNote?: string;
};

type HubIdeaComment = {
  id: string;
  text: string;
  createdAt: number;
};

type HubIdeaCardProps = {
  idea: HubIdeaItem;
  reactions: string[];
  comments: HubIdeaComment[];
  onToggleReaction: (_emoji: string) => void;
  onAddComment: (_text: string) => void;
};

type StackedReaction = { value: string; count: number };

function stackReactions(raw: string[]): StackedReaction[] {
  const map = new Map<string, number>();
  raw.forEach((r) => {
    const key = r.trim();
    if (!key) return;
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([value, count]) => ({ value, count }));
}

export function HubIdeaCard({
  idea,
  reactions,
  comments,
  onToggleReaction,
  onAddComment,
}: HubIdeaCardProps) {
  const [commentValue, setCommentValue] = useState("");

  const label = idea.label;
  const end = label.indexOf("]");
  const title = end === -1 ? label : label.slice(end + 1).trim();

  const stacked = stackReactions(reactions);
  const totalReactions = stacked.reduce((sum, r) => sum + r.count, 0);

  const handleCommentKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = commentValue.trim();
      if (!value) return;
      onAddComment(value);
      setCommentValue("");
    }
  };

  const handleSendClick = () => {
    const value = commentValue.trim();
    if (!value) return;
    onAddComment(value);
    setCommentValue("");
  };

  return (
    <div className="group relative flex flex-col overflow-visible rounded-3xl border border-zinc-800/60 bg-[#0A0A0C] transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/50">
      <HubIdeaHeaderBody
        idea={idea}
        label={label}
        title={title}
        totalReactions={totalReactions}
      />

      <div className="mt-auto px-5 pb-5 pt-5">
        <HubIdeaReactionsBar
          stacked={stacked}
          onToggleReaction={onToggleReaction}
        />

        <HubIdeaComments comments={comments} />

        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ajouter un commentaire..."
            className="h-9 w-full rounded-xl border border-zinc-800 bg-zinc-900/30 pl-3 pr-9 text-[12px] text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-zinc-700 focus:bg-zinc-900"
            value={commentValue}
            onChange={(e) => setCommentValue(e.target.value)}
            onKeyDown={handleCommentKeyDown}
          />
          <button
            type="button"
            onClick={handleSendClick}
            className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-[#5227FF] hover:text-white"
          >
            <RiSendPlaneFill className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

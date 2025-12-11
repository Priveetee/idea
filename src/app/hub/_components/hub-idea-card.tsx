"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { HubIdeaHeaderBody } from "./hub-idea-header-body";
import { HubIdeaReactionsBar } from "./hub-idea-reactions-bar";
import { HubIdeaComments } from "./hub-idea-comments";

type HubIdeaLink = {
  id: string;
  label: string;
  url: string;
};

type HubIdeaBullet = {
  id: string;
  text: string;
};

export type HubIdeaItem = {
  id: string;
  label: string;
  status: string;
  managerSummary?: string;
  managerContent?: string;
  managerLinks?: HubIdeaLink[];
  managerBullets?: HubIdeaBullet[];
  managerNote?: string;
};

type Comment = {
  id: string;
  text: string;
  createdAt: number;
};

type HubIdeaCardProps = {
  idea: HubIdeaItem;
  reactions: string[];
  comments: Comment[];
  onToggleReaction: (_emoji: string) => void;
  onAddComment: (_text: string) => void;
};

export function HubIdeaCard({
  idea,
  reactions,
  comments,
  onToggleReaction,
}: HubIdeaCardProps) {
  const label = idea.label;
  const end = label.indexOf("]");
  const title = end === -1 ? label : label.slice(end + 1).trim();

  const totalReactions = reactions.length;

  const cardContent: ReactNode = (
    <div className="flex h-full flex-col rounded-3xl border border-zinc-900 bg-[#060010] px-4 py-3 text-[13px] text-zinc-200 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
      <HubIdeaHeaderBody
        idea={idea}
        label={label}
        title={title}
        totalReactions={totalReactions}
      />

      <div className="mt-2 px-4 pb-3 text-[13px] text-zinc-300">
        {idea.managerSummary && (
          <p className="line-clamp-3 whitespace-pre-wrap">
            {idea.managerSummary}
          </p>
        )}
      </div>

      <div className="mt-auto space-y-2 px-4 pb-3">
        <HubIdeaReactionsBar
          stacked={stackReactions(reactions)}
          onToggleReaction={onToggleReaction}
        />

        <HubIdeaComments comments={comments} />
      </div>
    </div>
  );

  return (
    <Link href={`/idea/${idea.id}`} className="block h-full">
      {cardContent}
    </Link>
  );
}

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

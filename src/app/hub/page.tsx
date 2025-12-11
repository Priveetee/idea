"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import type { IdeaItem } from "@/lib/mock-data";
import { HubIdeaCard } from "./_components/hub-idea-card";
import {
  HubAnimatedList,
  type HubAnimatedListItem,
} from "./_components/hub-animated-list";

type ReactionMap = Record<string, string[]>;
type Comment = { id: string; text: string; createdAt: number };
type CommentMap = Record<string, Comment[]>;

function createComment(text: string): Comment {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    createdAt: Date.now(),
  };
}

export default function HubPage() {
  const { data, isLoading } = trpc.idea.list.useQuery();
  const [reactions, setReactions] = useState<ReactionMap>({});
  const [comments, setComments] = useState<CommentMap>({});

  const ideas: IdeaItem[] = useMemo(
    () =>
      (data ?? []).map((idea) => ({
        id: idea.id,
        label: idea.label,
        status: idea.status,
        managerSummary: idea.managerSummary,
        managerContent: idea.managerContent,
        managerLinks: idea.links?.map((l) => ({
          id: l.id,
          label: l.label,
          url: l.url,
        })),
        managerBullets: idea.bullets?.map((b) => ({
          id: b.id,
          text: b.text,
        })),
        managerNote: idea.managerNote,
      })),
    [data],
  );

  const listItems: HubAnimatedListItem[] = useMemo(
    () =>
      ideas.map((idea) => ({
        id: idea.id,
        label: idea.label,
      })),
    [ideas],
  );

  const handleToggleReaction = (ideaId: string, emoji: string) => {
    setReactions((prev) => {
      const current = prev[ideaId] ?? [];
      const exists = current.includes(emoji);

      const nextReactions = exists
        ? current.filter((e) => e !== emoji)
        : [...current, emoji];

      return {
        ...prev,
        [ideaId]: nextReactions,
      };
    });
  };

  const handleAddComment = (ideaId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setComments((prev) => {
      const current = prev[ideaId] ?? [];
      const next = [...current, createComment(trimmed)];
      return {
        ...prev,
        [ideaId]: next.slice(-5),
      };
    });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#050509] text-white">
      <div className="shrink-0 border-b border-zinc-900 bg-[#050509]/80 px-6 py-6 backdrop-blur-md md:px-10">
        <div className="mx-auto flex w-full max-w-[2000px] flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#5227FF]">
              Idea Hub
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Mur des idées
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/idea/new"
              className="group relative flex h-9 items-center gap-2 overflow-hidden rounded-full bg-white px-5 text-[13px] font-bold text-black transition hover:bg-zinc-200"
            >
              <span>Proposer une idée</span>
            </Link>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-6 py-8 md:px-10 [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#050509] [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-zinc-700"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#3f3f46 #050509",
        }}
      >
        <div className="mx-auto max-w-[2000px]">
          {isLoading ? (
            <div className="mt-20 text-center text-sm text-zinc-500">
              Chargement des idées...
            </div>
          ) : ideas.length === 0 ? (
            <div className="mt-20 flex flex-col items-center justify-center gap-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-900/50">
                <span className="text-3xl">🌪️</span>
              </div>
              <div className="max-w-md text-[15px] text-zinc-500">
                Aucune idée n&apos;est encore disponible.
              </div>
            </div>
          ) : (
            <HubAnimatedList
              layout="grid"
              items={listItems}
              enableDrag={false}
              showGradients={false}
              renderItem={(item) => {
                const idea = ideas.find((i) => i.id === item.id) as IdeaItem;
                const ideaComments = comments[idea.id] ?? [];
                return (
                  <HubIdeaCard
                    idea={idea}
                    reactions={reactions[idea.id] ?? []}
                    comments={ideaComments}
                    onToggleReaction={(emoji) =>
                      handleToggleReaction(idea.id, emoji)
                    }
                    onAddComment={(text) => handleAddComment(idea.id, text)}
                  />
                );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

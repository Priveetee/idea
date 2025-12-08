"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useIdeaStore } from "@/app/admin/_providers/idea-store";
import type { IdeaItem } from "@/lib/mock-data";
import { HubFilters } from "./_components/hub-filters";
import { HubIdeaCard } from "./_components/hub-idea-card";
import {
  HubAnimatedList,
  type HubAnimatedListItem,
} from "./_components/hub-animated-list";

type FilterStatus = "ALL" | "INBOX" | "DEV" | "ARCHIVE";

type ReactionMap = Record<string, string[]>;

const REACTIONS_STORAGE_KEY = "idea-hub-reactions";

function loadInitialReactions(): ReactionMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(REACTIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ReactionMap;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function saveReactions(map: ReactionMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export default function HubPage() {
  const { ideas } = useIdeaStore();
  const [status, setStatus] = useState<FilterStatus>("ALL");
  const [query, setQuery] = useState("");
  const [reactions, setReactions] = useState<ReactionMap>(() =>
    loadInitialReactions(),
  );

  const filteredIdeas = useMemo(() => {
    const base =
      status === "ALL" ? ideas : ideas.filter((idea) => idea.status === status);

    if (!query.trim()) return base;

    const q = query.toLowerCase();
    return base.filter((idea) => idea.label.toLowerCase().includes(q));
  }, [ideas, status, query]);

  const handleAddReaction = (ideaId: string, text: string) => {
    setReactions((prev) => {
      const current = prev[ideaId] ?? [];
      const nextText = text.trim();
      if (!nextText) return prev;
      const updated: ReactionMap = {
        ...prev,
        [ideaId]: [...current, nextText].slice(-6),
      };
      saveReactions(updated);
      return updated;
    });
  };

  const listItems: HubAnimatedListItem[] = filteredIdeas.map((idea) => ({
    id: idea.id,
    label: idea.label,
  }));

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

        <div className="mx-auto mt-6 max-w-[2000px]">
          <HubFilters
            status={status}
            onStatusChange={setStatus}
            query={query}
            onQueryChange={setQuery}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
        <div className="mx-auto max-w-[2000px]">
          {filteredIdeas.length === 0 ? (
            <div className="mt-20 flex flex-col items-center justify-center gap-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-900/50">
                <span className="text-3xl">🌪️</span>
              </div>
              <div className="max-w-md text-[15px] text-zinc-500">
                Aucune idée ne correspond à votre recherche.
              </div>
            </div>
          ) : (
            <HubAnimatedList
              layout="grid"
              items={listItems}
              enableDrag={false}
              showGradients={false}
              renderItem={(item) => {
                const idea = filteredIdeas.find(
                  (i) => i.id === item.id,
                ) as IdeaItem;
                return (
                  <HubIdeaCard
                    idea={idea}
                    reactions={reactions[idea.id] ?? []}
                    addReaction={(text) => handleAddReaction(idea.id, text)}
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

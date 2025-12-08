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
  } catch {
    // ignore
  }
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
    <div className="flex min-h-screen items-center justify-center bg-[#050509] text-white">
      <div className="w-full max-w-7xl px-8 py-10">
        <div className="mb-8 flex items-end justify-between border-b border-zinc-900 pb-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#5227FF]">
              Idea Hub
            </div>
            <h1 className="mt-1 text-4xl font-bold tracking-tight text-white">
              Mur des idées
            </h1>
            <p className="mt-2 text-[13px] text-zinc-400">
              Découvrez, réagissez et contribuez aux propositions de l equipe.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/idea/new"
              className="group relative flex h-9 items-center gap-2 overflow-hidden rounded-full bg-white px-4 text-[13px] font-semibold text-black transition hover:bg-zinc-200"
            >
              <span>Proposer une idée</span>
            </Link>
          </div>
        </div>

        <HubFilters
          status={status}
          onStatusChange={setStatus}
          query={query}
          onQueryChange={setQuery}
        />

        {filteredIdeas.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900/50">
              <span className="text-2xl">🌪️</span>
            </div>
            <div className="text-sm text-zinc-500">
              Aucune idée trouvée pour ce filtre.
            </div>
          </div>
        ) : (
          <HubAnimatedList
            layout="grid"
            items={listItems}
            enableDrag={false}
            showGradients={false}
            className="mt-8"
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
  );
}

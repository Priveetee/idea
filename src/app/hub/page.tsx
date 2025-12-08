"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useIdeaStore } from "@/app/admin/_providers/idea-store";
import type { IdeaItem } from "@/lib/mock-data";
import { HubFilters } from "./_components/hub-filters";
import { HubIdeaCard } from "./_components/hub-idea-card";

type FilterStatus = "ALL" | "INBOX" | "DEV" | "ARCHIVE";

type ReactionMap = Record<string, string[]>;

const REACTIONS_STORAGE_KEY = "idea-hub-reactions";

function loadReactions(): ReactionMap {
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
    loadReactions(),
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050509] text-white">
      <div className="w-full max-w-6xl px-8 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">
              Hub public des idées
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-50">
              Idées proposées
            </h1>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            <Link
              href="/idea/new"
              className="rounded-full bg-[#5227FF] px-4 py-1.5 text-[11px] font-medium text-white hover:bg-[#3f21c9]"
            >
              Proposer une idée
            </Link>
            <div className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              <span>{ideas.length} idée(s)</span>
            </div>
          </div>
        </div>

        <HubFilters
          status={status}
          onStatusChange={setStatus}
          query={query}
          onQueryChange={setQuery}
        />

        {filteredIdeas.length === 0 ? (
          <div className="mt-10 flex h-40 items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-[#050509] text-[12px] text-zinc-500">
            Aucune idée ne correspond à ce filtre pour le moment.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {filteredIdeas.map((idea: IdeaItem) => (
              <HubIdeaCard
                key={idea.id}
                idea={idea}
                reactions={reactions[idea.id] ?? []}
                addReaction={(text) => handleAddReaction(idea.id, text)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

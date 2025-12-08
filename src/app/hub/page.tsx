"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useIdeaStore } from "@/app/admin/_providers/idea-store";
import type { IdeaStatus } from "@/lib/mock-data";

type FilterStatus = "ALL" | IdeaStatus;

const STATUS_LABEL: Record<FilterStatus, string> = {
  ALL: "Toutes",
  INBOX: "Inbox",
  DEV: "En cours",
  ARCHIVE: "Archives",
};

export default function HubPage() {
  const { ideas } = useIdeaStore();
  const [status, setStatus] = useState<FilterStatus>("ALL");
  const [query, setQuery] = useState("");

  const filteredIdeas = useMemo(() => {
    const base =
      status === "ALL" ? ideas : ideas.filter((idea) => idea.status === status);

    if (!query.trim()) return base;

    const q = query.toLowerCase();
    return base.filter((idea) => idea.label.toLowerCase().includes(q));
  }, [ideas, status, query]);

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

        <div className="mb-4 flex items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div className="inline-flex gap-1 rounded-full border border-zinc-800 bg-zinc-950 p-1">
            {(["ALL", "INBOX", "DEV", "ARCHIVE"] as FilterStatus[]).map(
              (value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={`rounded-full px-3 py-1 ${
                    status === value
                      ? "bg-[#5227FF] text-zinc-50"
                      : "text-zinc-400 hover:bg-zinc-900"
                  }`}
                >
                  {STATUS_LABEL[value]}
                </button>
              ),
            )}
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrer par titre ou TGI..."
            className="h-8 w-60 rounded-full border border-zinc-700 bg-zinc-950 px-3 text-[11px] text-zinc-100 outline-none focus:border-[#5227FF]"
          />
        </div>

        {filteredIdeas.length === 0 ? (
          <div className="mt-10 flex h-40 items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-[#050509] text-[12px] text-zinc-500">
            Aucune idée ne correspond à ce filtre pour le moment.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIdeas.map((idea) => {
              const label = idea.label;
              const end = label.indexOf("]");
              const tgi = end === -1 ? null : label.slice(0, end + 1);
              const title = end === -1 ? label : label.slice(end + 1).trim();

              const isInbox = idea.status === "INBOX";
              const isDev = idea.status === "DEV";
              const isArchive = idea.status === "ARCHIVE";

              const statusLabel = isInbox
                ? "Inbox"
                : isDev
                  ? "En cours"
                  : isArchive
                    ? "Archives"
                    : String(idea.status);

              const statusColor = isInbox
                ? "#5227FF"
                : isDev
                  ? "#22c55e"
                  : "#64748b";

              const linksCount = idea.managerLinks?.length ?? 0;

              return (
                <Link
                  key={idea.id}
                  href={`/idea/${idea.id}`}
                  className="block rounded-2xl border border-zinc-900 bg-[#060010] px-5 py-4 text-[13px] text-zinc-100 shadow-[0_0_24px_rgba(0,0,0,0.6)] transition hover:border-zinc-700 hover:bg-[#090013]"
                >
                  <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-400">
                    <div className="flex items-center gap-2">
                      {tgi && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-200">
                          {tgi}
                        </span>
                      )}
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px]"
                        style={{ color: statusColor }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: statusColor }}
                        />
                        {statusLabel}
                      </span>
                      {linksCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-400">
                          {linksCount} lien(s)
                        </span>
                      )}
                    </div>
                    <span className="text-zinc-500">
                      ID interne&nbsp;: {idea.id}
                    </span>
                  </div>

                  <div className="text-[15px] font-medium text-zinc-50">
                    {title}
                  </div>

                  {idea.managerContent && (
                    <div className="mt-1 line-clamp-2 text-[12px] text-zinc-400">
                      {idea.managerContent}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

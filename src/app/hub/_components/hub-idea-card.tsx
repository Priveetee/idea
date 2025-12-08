"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";
import type { IdeaItem, IdeaStatus } from "@/lib/mock-data";
import { getLinkMeta } from "@/lib/link-icons";
import { RichPreviewText } from "@/app/idea/new/_components/rich-preview-text";

type HubIdeaCardProps = {
  idea: IdeaItem;
  reactions: string[];
  addReaction: (_text: string) => void;
};

function getStatusMeta(status: IdeaStatus | string): {
  label: string;
  color: string;
} {
  if (status === "INBOX") return { label: "Inbox", color: "#5227FF" };
  if (status === "DEV") return { label: "En cours", color: "#22c55e" };
  if (status === "ARCHIVE") return { label: "Archives", color: "#64748b" };
  return { label: String(status), color: "#6b7280" };
}

export function HubIdeaCard({
  idea,
  reactions,
  addReaction,
}: HubIdeaCardProps) {
  const label = idea.label;
  const end = label.indexOf("]");
  const tgi = end === -1 ? null : label.slice(0, end + 1);
  const title = end === -1 ? label : label.slice(end + 1).trim();

  const statusMeta = getStatusMeta(idea.status);
  const links = idea.managerLinks ?? [];
  const linksCount = links.length;
  const hasRichContent = !!idea.managerContent?.trim() || linksCount > 0;

  const handleReactionKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      const text = target.value.trim();
      if (!text) return;
      addReaction(text);
      target.value = "";
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-900 bg-[#060010] px-5 py-4 text-[13px] text-zinc-100 shadow-[0_0_32px_rgba(0,0,0,0.7)]">
      <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-2">
          {tgi && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-200">
              {tgi}
            </span>
          )}
          <span
            className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px]"
            style={{ color: statusMeta.color }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: statusMeta.color }}
            />
            {statusMeta.label}
          </span>
          {linksCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-400">
              {linksCount} lien(s)
            </span>
          )}
          {hasRichContent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Enrichie
            </span>
          )}
        </div>
        <span className="text-zinc-500">ID interne&nbsp;: {idea.id}</span>
      </div>

      <Link
        href={`/idea/${idea.id}`}
        className="block text-[15px] font-medium text-zinc-50 hover:underline"
      >
        {title}
      </Link>

      <div className="mt-3 rounded-2xl border border-zinc-900 bg-[#050509] px-4 py-3">
        <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          Détail de l&apos;idée
        </div>
        {idea.managerContent ? (
          <div className="line-clamp-4">
            <RichPreviewText text={idea.managerContent} />
          </div>
        ) : (
          <div className="text-[12px] text-zinc-500">
            Aucun détail n&apos;a encore été ajouté pour cette idée.
          </div>
        )}
      </div>

      {linksCount > 0 && (
        <div className="mt-3 rounded-2xl border border-zinc-900 bg-[#050509] px-4 py-3 text-[12px] text-zinc-200">
          <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Liens
          </div>
          <div className="space-y-1">
            {links.map((link) => {
              const meta = getLinkMeta(link.url);
              const Icon = meta.icon;

              let host = "";
              try {
                host = new URL(link.url).hostname.replace(/^www\./i, "");
              } catch {
                host = link.url;
              }

              return (
                <div
                  key={link.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-[11px] text-zinc-200 hover:bg-zinc-900/80"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    <span className="shrink-0 text-zinc-100">{meta.label}</span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      title={link.url}
                      className="truncate text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
                    >
                      {host}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-3 rounded-2xl border border-zinc-900 bg-[#050509] px-4 py-3 text-[12px] text-zinc-200">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          <span>Réactions</span>
          <span className="text-zinc-600">
            Local, non partagé (mock collaboration)
          </span>
        </div>
        {reactions.length === 0 ? (
          <div className="mb-2 text-[11px] text-zinc-500">
            Vous pouvez ajouter une courte réaction pour garder une trace de vos
            idées ou questions.
          </div>
        ) : (
          <div className="mb-2 flex flex-wrap gap-1">
            {reactions.map((reaction, index) => (
              <span
                key={`${reaction}-${index}`}
                className="max-w-[220px] truncate rounded-full bg-zinc-900 px-3 py-1 text-[11px] text-zinc-200"
                title={reaction}
              >
                {reaction}
              </span>
            ))}
          </div>
        )}
        <input
          type="text"
          placeholder="Ajouter une réaction et appuyer sur Entrée..."
          className="mt-1 h-8 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-[11px] text-zinc-100 outline-none focus:border-[#5227FF]"
          onKeyDown={handleReactionKeyDown}
        />
      </div>
    </div>
  );
}

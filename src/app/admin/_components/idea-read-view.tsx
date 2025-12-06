"use client";

import { useMemo } from "react";
import { FaNoteSticky } from "react-icons/fa6";
import { FiExternalLink } from "react-icons/fi";
import type { IdeaStatus, IdeaLink, IdeaBullet } from "@/lib/mock-data";
import { getIconForUrl } from "@/lib/link-icons";

type IdeaReadViewProps = {
  titleLabel: string;
  tgiLabel: string | null;
  activeStatus: IdeaStatus;
  managerSummary: string;
  managerContent: string;
  managerBullets: IdeaBullet[];
  managerLinks: IdeaLink[];
  managerNote: string;
};

export function IdeaReadView({
  titleLabel,
  tgiLabel,
  activeStatus,
  managerSummary,
  managerContent,
  managerBullets,
  managerLinks,
  managerNote,
}: IdeaReadViewProps) {
  const formattedContent = useMemo(
    () =>
      managerContent
        .split(/\n{2,}/)
        .map((chunk) => chunk.trim())
        .filter(Boolean),
    [managerContent],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          {tgiLabel && (
            <div className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-3 py-1 text-[11px] font-mono text-indigo-300">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "#5227FF" }}
              />
              {tgiLabel}
            </div>
          )}
          <div className="text-[11px] uppercase tracking-[0.15em] text-zinc-500">
            Statut espace: {activeStatus}
          </div>
        </div>
        <div className="flex flex-col items-end text-[11px] text-zinc-500">
          <span>Origine: Lien unique TGI</span>
          <span className="mt-0.5 opacity-70">Flux: mockdata admin</span>
        </div>
      </div>

      <h1 className="text-xl font-semibold leading-snug text-zinc-50">
        {titleLabel}
      </h1>

      {managerSummary.trim() && (
        <div className="rounded-2xl border border-zinc-900 bg-[#050012] px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Résumé rapide
          </div>
          <p className="mt-2 text-sm text-zinc-100">{managerSummary}</p>
        </div>
      )}

      {formattedContent.length > 0 && (
        <div className="rounded-2xl border border-zinc-900 bg-[#050012] px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Détail de l&apos;idée
          </div>
          <div className="mt-2 space-y-2 text-sm text-zinc-100">
            {formattedContent.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {managerBullets.length > 0 && (
        <div className="rounded-2xl border border-zinc-900 bg-[#050012] px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Points clés
          </div>
          <ul className="mt-2 space-y-1 text-sm text-zinc-100">
            {managerBullets
              .filter((b) => b.text.trim())
              .map((b) => (
                <li key={b.id} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-500" />
                  <span>{b.text}</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {managerLinks.length > 0 && (
        <div className="rounded-2xl border border-zinc-900 bg-[#050012] px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Liens
          </div>
          <div className="mt-2 space-y-2">
            {managerLinks.map((link) => {
              const Icon = getIconForUrl(link.url);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 hover:border-[#6366f1] hover:text-white"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900">
                    <Icon className="h-3.5 w-3.5 text-zinc-200" />
                  </div>
                  <div className="flex flex-col">
                    <span className="truncate">{link.label}</span>
                    <span className="truncate text-[10px] text-zinc-500">
                      {link.url}
                    </span>
                  </div>
                  <FiExternalLink className="ml-auto h-3 w-3 text-zinc-500" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {managerNote.trim() && (
        <div className="rounded-2xl border border-zinc-900 bg-[#050012] px-4 py-3">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            <FaNoteSticky className="h-3 w-3 text-zinc-600" />
            <span>Notes internes</span>
          </div>
          <p className="whitespace-pre-line text-sm text-zinc-200">
            {managerNote}
          </p>
        </div>
      )}
    </div>
  );
}

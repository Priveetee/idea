"use client";

import { useMemo } from "react";
import { FaNoteSticky, FaCircleInfo } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
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

  const bulletsFilled = managerBullets.filter((b) => b.text.trim());
  const hasEnrichment =
    managerSummary.trim().length > 0 ||
    formattedContent.length > 0 ||
    bulletsFilled.length > 0 ||
    managerLinks.length > 0 ||
    managerNote.trim().length > 0;

  const infoChips: string[] = [];
  if (bulletsFilled.length > 0)
    infoChips.push(`${bulletsFilled.length} points clés`);
  if (managerLinks.length > 0) infoChips.push(`${managerLinks.length} lien(s)`);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {tgiLabel && (
              <div className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-3 py-1 text-[11px] font-mono text-indigo-300">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "#5227FF" }}
                />
                {tgiLabel}
              </div>
            )}
            {hasEnrichment ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/40 px-3 py-1 text-[10px] font-medium text-emerald-300">
                <FaCheckCircle className="h-3 w-3" />
                Enrichie
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1 text-[10px] font-medium text-zinc-400">
                <FaCircleInfo className="h-3 w-3" />
                Non enrichie
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
            <span className="uppercase tracking-[0.15em]">
              Statut espace: {activeStatus}
            </span>
            {infoChips.length > 0 && (
              <>
                <span className="h-1 w-1 rounded-full bg-zinc-600" />
                <span>{infoChips.join(" · ")}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end text-[11px] text-zinc-500">
          <span>Origine: Lien unique TGI</span>
          <span className="mt-0.5 opacity-70">Flux: mockdata admin</span>
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-xl font-semibold leading-snug text-zinc-50">
          {titleLabel}
        </h1>
        <div className="h-px w-full bg-gradient-to-r from-zinc-800 via-zinc-800/60 to-transparent" />
      </div>

      {managerSummary.trim() && (
        <div className="rounded-2xl border border-zinc-900 bg-[#050012] px-4 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Résumé rapide
          </div>
          <p className="mt-3 text-sm text-zinc-100">{managerSummary}</p>
        </div>
      )}

      {formattedContent.length > 0 && (
        <div className="rounded-2xl border border-zinc-900 bg-[#050012] px-4 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Détail de l&apos;idée
          </div>
          <div className="mt-3 max-w-[640px] space-y-3 text-sm leading-relaxed text-zinc-100">
            {formattedContent.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {bulletsFilled.length > 0 && (
        <div className="rounded-2xl border border-zinc-900 bg-[#050012] px-4 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Points clés
          </div>
          <ul className="mt-3 grid gap-2 text-sm text-zinc-100 md:grid-cols-2">
            {bulletsFilled.map((b) => (
              <li
                key={b.id}
                className="flex items-start gap-2 rounded-lg bg-zinc-950 px-3 py-2"
              >
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {managerLinks.length > 0 && (
        <div className="rounded-2xl border border-zinc-900 bg-[#050012] px-4 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Liens
          </div>
          <div className="mt-3 grid gap-2 text-xs text-zinc-100 md:grid-cols-2">
            {managerLinks.map((link) => {
              const Icon = getIconForUrl(link.url);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 hover:border-[#6366f1] hover:text-white"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900">
                    <Icon className="h-4 w-4 text-zinc-200" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{link.label}</span>
                    <span className="truncate text-[10px] text-zinc-500">
                      {link.url}
                    </span>
                  </div>
                  <FiExternalLink className="ml-auto h-3 w-3 flex-shrink-0 text-zinc-500" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {managerNote.trim() && (
        <div className="rounded-2xl border border-zinc-900 bg-[#050012] px-4 py-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            <FaNoteSticky className="h-3 w-3 text-zinc-600" />
            <span>Notes internes</span>
          </div>
          <div className="rounded-xl bg-zinc-950/80 px-3 py-3 text-sm text-zinc-200 whitespace-pre-line">
            {managerNote}
          </div>
        </div>
      )}
    </div>
  );
}

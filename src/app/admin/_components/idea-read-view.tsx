"use client";

import { useMemo } from "react";
import { FaCircleInfo } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { TbListDetails } from "react-icons/tb";
import { IoKeyOutline } from "react-icons/io5";
import { FaLink, FaRegStickyNote } from "react-icons/fa";
import { getIconForUrl } from "@/lib/link-icons";
import { AdminRichTextPreview } from "./admin-rich-text-preview";

type AdminIdeaStatus = string;

type AdminIdeaLink = {
  id: string;
  label: string;
  url: string;
};

type AdminIdeaBullet = {
  id: string;
  text: string;
};

type IdeaReadViewProps = {
  titleLabel: string;
  tgiLabel: string | null;
  activeStatus: AdminIdeaStatus;
  managerSummary: string;
  managerContent: string;
  managerBullets: AdminIdeaBullet[];
  managerLinks: AdminIdeaLink[];
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
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {tgiLabel && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-3 py-1 text-[11px] font-mono text-indigo-300">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "#5227FF" }}
                />
                {tgiLabel}
              </span>
            )}
            {hasEnrichment ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/40 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
                <FaCheckCircle className="h-3 w-3" />
                Enrichie
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2.5 py-0.5 text-[10px] font-medium text-zinc-400">
                <FaCircleInfo className="h-3 w-3" />
                Non enrichie
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500">
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
        <div className="flex flex-col items-end text-[11px] text-zinc-500" />
      </header>

      <div className="space-y-2">
        <h1 className="text-xl font-semibold leading-snug text-zinc-50">
          {titleLabel}
        </h1>
      </div>

      <div className="h-px w-full bg-zinc-900" />

      <main className="flex flex-col gap-5 text-sm text-zinc-100">
        {managerSummary.trim() && (
          <SectionBox
            icon={<AiOutlineThunderbolt className="h-4 w-4 text-amber-400" />}
            title="Résumé rapide"
          >
            <p className="max-w-[640px]">{managerSummary}</p>
          </SectionBox>
        )}

        {managerContent.trim() && (
          <SectionBox
            icon={<TbListDetails className="h-4 w-4 text-sky-300" />}
            title="Détail de l'idée"
          >
            <AdminRichTextPreview content={managerContent} />
          </SectionBox>
        )}

        {bulletsFilled.length > 0 && (
          <SectionBox
            icon={<IoKeyOutline className="h-4 w-4 text-emerald-300" />}
            title="Points clés"
          >
            <ul className="space-y-1.5">
              {bulletsFilled.map((b) => (
                <li
                  key={b.id}
                  className="flex items-start gap-2 rounded-md px-1 py-1 hover:bg-zinc-900/60"
                >
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>
          </SectionBox>
        )}

        {managerLinks.length > 0 && (
          <SectionBox
            icon={<FaLink className="h-3.5 w-3.5 text-indigo-300" />}
            title="Liens"
          >
            <div className="space-y-1.5 text-xs">
              {managerLinks.map((link) => {
                const Icon = getIconForUrl(link.url);

                let host = "";
                try {
                  host = new URL(link.url).hostname.replace(/^www\./i, "");
                } catch {
                  host = link.url;
                }

                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-zinc-900/60"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900">
                      <Icon className="h-3.5 w-3.5 text-zinc-200" />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-zinc-100">
                        {link.label}
                      </span>
                      <span className="truncate text-[10px] text-zinc-500">
                        {host}
                      </span>
                    </div>
                    <FiExternalLink className="ml-auto h-3 w-3 flex-shrink-0 text-zinc-500" />
                  </a>
                );
              })}
            </div>
          </SectionBox>
        )}

        {managerNote.trim() && (
          <SectionBox
            icon={<FaRegStickyNote className="h-3.5 w-3.5 text-fuchsia-300" />}
            title="Notes internes"
          >
            <div className="max-h-40 overflow-y-auto pr-1">
              <div className="whitespace-pre-line text-sm text-zinc-200">
                {managerNote}
              </div>
            </div>
          </SectionBox>
        )}
      </main>
    </div>
  );
}

type SectionBoxProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
};

function SectionBox({ icon, title, children }: SectionBoxProps) {
  return (
    <section className="rounded-2xl border border-zinc-900 bg-zinc-950/80 px-4 py-3">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-900/80">
          {icon}
        </span>
        <span>{title}</span>
      </div>
      {children}
    </section>
  );
}

"use client";

import Link from "next/link";
import { getLinkMeta } from "@/lib/link-icons";
import { RichPreviewText } from "@/app/idea/new/_components/rich-preview-text";
import { RiLinksLine, RiArrowRightUpLine } from "react-icons/ri";
import type { HubIdeaItem } from "./hub-idea-card";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  INBOX: {
    label: "Inbox",
    bg: "bg-[#5227FF]/10",
    text: "text-[#6b47ff]",
    dot: "bg-[#6b47ff]",
  },
  DEV: {
    label: "En cours",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  ARCHIVE: {
    label: "Archives",
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    dot: "bg-zinc-400",
  },
  DEFAULT: {
    label: "Idée",
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    dot: "bg-zinc-400",
  },
};

type HubIdeaHeaderBodyProps = {
  idea: HubIdeaItem;
  label: string;
  title: string;
  totalReactions: number;
};

export function HubIdeaHeaderBody({
  idea,
  label,
  title,
  totalReactions,
}: HubIdeaHeaderBodyProps) {
  const end = label.indexOf("]");
  const tgi = end === -1 ? null : label.slice(0, end + 1);
  const status = STATUS_CONFIG[idea.status] ?? STATUS_CONFIG.DEFAULT;
  const links = idea.managerLinks ?? [];

  return (
    <>
      <div className="flex items-start justify-between p-5 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {tgi && (
            <span className="font-mono text-[10px] font-bold text-zinc-600">
              {tgi}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${status.bg} ${status.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          {totalReactions > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] text-zinc-400">
              {totalReactions} réaction{totalReactions > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {links.length > 0 && (
          <div className="flex -space-x-1.5">
            {links.slice(0, 3).map((l) => {
              const Icon = getLinkMeta(l.url).icon;
              return (
                <div
                  key={l.id}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[#0A0A0C] bg-zinc-800 text-zinc-400 shadow-sm"
                >
                  <Icon className="h-3 w-3" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-5">
        <Link href={`/idea/${idea.id}`} className="block">
          <h3 className="text-[17px] font-bold leading-tight text-zinc-100 transition duration-300 group-hover:text-[#5227FF]">
            {title}
          </h3>
        </Link>

        <div className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-zinc-400">
          {idea.managerContent ? (
            <RichPreviewText text={idea.managerContent} />
          ) : (
            <span className="italic text-zinc-600">
              Pas de description détaillée...
            </span>
          )}
        </div>
      </div>

      {links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 px-5">
          {links.slice(0, 2).map((link) => {
            const meta = getLinkMeta(link.url);
            let host = link.url;
            try {
              host = new URL(link.url).hostname.replace("www.", "");
            } catch {}

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="group/link inline-flex max-w-full items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/40 px-2 py-1 text-[10px] text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200"
              >
                <RiLinksLine className="shrink-0 opacity-50 transition group-hover/link:opacity-100" />
                <span className="truncate max-w-[120px]">
                  {meta.label || host}
                </span>
                <RiArrowRightUpLine className="shrink-0 opacity-0 transition group-hover/link:opacity-50" />
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}

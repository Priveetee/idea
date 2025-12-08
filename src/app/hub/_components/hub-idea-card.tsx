"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";
import type { IdeaItem } from "@/lib/mock-data";
import { getLinkMeta } from "@/lib/link-icons";
import { RichPreviewText } from "@/app/idea/new/_components/rich-preview-text";
import {
  RiThumbUpLine,
  RiLightbulbLine,
  RiQuestionMark,
  RiFireLine,
  RiLinksLine,
  RiArrowRightUpLine,
} from "react-icons/ri";

type HubIdeaCardProps = {
  idea: IdeaItem;
  reactions: string[];
  addReaction: (_text: string) => void;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  INBOX: {
    label: "Inbox",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    dot: "bg-blue-400",
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

const REACTION_ICONS: Record<string, React.ElementType> = {
  "👍": RiThumbUpLine,
  "💡": RiLightbulbLine,
  "❓": RiQuestionMark,
  "🔥": RiFireLine,
};

type StackedReaction = { value: string; count: number };

function stackReactions(raw: string[]): StackedReaction[] {
  const map = new Map<string, number>();
  raw.forEach((r) => {
    const key = r.trim();
    if (!key) return;
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([value, count]) => ({ value, count }));
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

  const status = STATUS_CONFIG[idea.status] ?? STATUS_CONFIG.DEFAULT;
  const links = idea.managerLinks ?? [];
  const stacked = stackReactions(reactions);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      const val = target.value.trim();
      if (val) {
        addReaction(val);
        target.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-zinc-800/60 bg-[#0A0A0C] shadow-xl transition-all hover:border-zinc-700 hover:shadow-2xl hover:shadow-zinc-900/50">
      <div className="flex items-start justify-between p-5 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {tgi && (
            <span className="font-mono text-[10px] font-medium text-zinc-500">
              {tgi}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.bg} ${status.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        {links.length > 0 && (
          <div className="flex -space-x-2">
            {links.slice(0, 3).map((l, i) => {
              const Icon = getLinkMeta(l.url).icon;
              return (
                <div
                  key={i}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[#0A0A0C] bg-zinc-800 text-zinc-400"
                >
                  <Icon className="h-3 w-3" />
                </div>
              );
            })}
            {links.length > 3 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#0A0A0C] bg-zinc-800 text-[9px] text-zinc-400">
                +{links.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-5">
        <Link href={`/idea/${idea.id}`} className="group block">
          <h3 className="text-lg font-semibold leading-snug text-zinc-100 decoration-zinc-500 underline-offset-4 group-hover:underline">
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
            } catch {
              /* ignore */
            }

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-zinc-900/80 px-2 py-1 text-[10px] text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
              >
                <RiLinksLine className="shrink-0" />
                <span className="truncate max-w-[120px]">
                  {meta.label || host}
                </span>
                <RiArrowRightUpLine className="shrink-0 opacity-50" />
              </a>
            );
          })}
        </div>
      )}

      <div className="mt-auto px-5 pb-5 pt-4">
        <div className="flex flex-wrap gap-1.5 pb-3">
          {stacked.map((r) => (
            <button
              key={r.value}
              onClick={() => addReaction(r.value)}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <span>{r.value}</span>
              {r.count > 1 && <span className="text-zinc-500">{r.count}</span>}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-zinc-900/40 p-1 pl-1 pr-1">
          <div className="flex shrink-0 gap-0.5 border-r border-zinc-800 pr-1">
            {Object.entries(REACTION_ICONS).map(([emoji, Icon]) => (
              <button
                key={emoji}
                onClick={() => addReaction(emoji)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
                title={emoji}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Réagir..."
            className="h-7 min-w-0 flex-1 bg-transparent text-[13px] text-zinc-200 placeholder-zinc-600 outline-none"
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
}

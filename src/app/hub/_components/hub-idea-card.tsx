"use client";

import Link from "next/link";
import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import type { IdeaItem } from "@/lib/mock-data";
import { getLinkMeta } from "@/lib/link-icons";
import { RichPreviewText } from "@/app/idea/new/_components/rich-preview-text";
import {
  RiLinksLine,
  RiArrowRightUpLine,
  RiAddLine,
  RiSendPlaneFill,
} from "react-icons/ri";
import { AnimatePresence, motion } from "motion/react";

type HubIdeaComment = {
  id: string;
  text: string;
  createdAt: number;
};

type HubIdeaCardProps = {
  idea: IdeaItem;
  reactions: string[];
  comments: HubIdeaComment[];
  onToggleReaction: (_emoji: string) => void;
  onAddComment: (_text: string) => void;
};

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

const EMOJI_PALETTE = [
  "👍",
  "❤️",
  "🔥",
  "🚀",
  "😂",
  "😮",
  "😢",
  "🙏",
  "👀",
  "🤔",
  "💩",
  "🤡",
];

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
  comments,
  onToggleReaction,
  onAddComment,
}: HubIdeaCardProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [commentValue, setCommentValue] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  const label = idea.label;
  const end = label.indexOf("]");
  const tgi = end === -1 ? null : label.slice(0, end + 1);
  const title = end === -1 ? label : label.slice(end + 1).trim();

  const status = STATUS_CONFIG[idea.status] ?? STATUS_CONFIG.DEFAULT;
  const links = idea.managerLinks ?? [];
  const stacked = stackReactions(reactions);
  const visibleComments = comments.length <= 2 ? comments : comments.slice(-2);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onEmojiClick = (emoji: string) => {
    onToggleReaction(emoji);
    setIsPickerOpen(false);
  };

  const handleCommentKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = commentValue.trim();
      if (!value) return;
      onAddComment(value);
      setCommentValue("");
    }
  };

  const handleSendClick = () => {
    const value = commentValue.trim();
    if (!value) return;
    onAddComment(value);
    setCommentValue("");
  };

  return (
    <div className="group relative flex flex-col overflow-visible rounded-3xl border border-zinc-800/60 bg-[#0A0A0C] transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/50">
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
        </div>

        {links.length > 0 && (
          <div className="flex -space-x-1.5">
            {links.slice(0, 3).map((l, i) => {
              const Icon = getLinkMeta(l.url).icon;
              return (
                <div
                  key={i}
                  className="flex h-6 w-6 items-center justifycenter rounded-full border border-[#0A0A0C] bg-zinc-800 text-zinc-400 shadow-sm"
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

      <div className="mt-auto px-5 pb-5 pt-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {stacked.map((r) => (
            <button
              key={r.value}
              onClick={() => onToggleReaction(r.value)}
              className="group flex h-7 min-w-[36px] items-center justify-center gap-1.5 rounded-full border border-zinc-800 bg-[#121214] px-2.5 text-[13px] font-medium text-zinc-300 transition hover:border-[#5227FF] hover:bg-[#5227FF]/10 hover:text-white"
            >
              <span className="leading-none">{r.value}</span>
              <span className="text-[10px] font-bold text-zinc-600 group-hover:text-[#5227FF]">
                {r.count}
              </span>
            </button>
          ))}

          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className={`flex h-7 w-8 items-center justify-center rounded-full border transition ${
                isPickerOpen
                  ? "border-zinc-700 bg-zinc-800 text-zinc-200"
                  : "border-transparent bg-zinc-900/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              }`}
            >
              <RiAddLine className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {isPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-0 top-full z-50 mt-2 w-[180px] rounded-xl border border-zinc-800 bg-[#121214] p-2 shadow-2xl"
                >
                  <div className="grid grid-cols-4 gap-1">
                    {EMOJI_PALETTE.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => onEmojiClick(emoji)}
                        className="flex aspect-square items-center justify-center rounded-lg text-lg transition hover:bg-zinc-800 hover:scale-110 active:scale-95"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {visibleComments.length > 0 && (
          <div className="mb-2 space-y-1.5 text-[12px] text-zinc-300">
            {comments.length > 2 && (
              <div className="text-[11px] text-zinc-500">
                {comments.length - visibleComments.length} commentaire(s) plus
                ancien(s)…
              </div>
            )}
            {visibleComments.map((c) => (
              <div
                key={c.id}
                className="rounded-lg bg-zinc-900/60 px-3 py-1.5 text-[12px] text-zinc-200"
              >
                {c.text}
              </div>
            ))}
          </div>
        )}

        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ajouter un commentaire..."
            className="h-9 w-full rounded-xl border border-zinc-800 bg-zinc-900/30 pl-3 pr-9 text-[12px] text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-zinc-700 focus:bg-zinc-900"
            value={commentValue}
            onChange={(e) => setCommentValue(e.target.value)}
            onKeyDown={handleCommentKeyDown}
          />
          <button
            onClick={handleSendClick}
            className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-[#5227FF] hover:text-white"
          >
            <RiSendPlaneFill className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

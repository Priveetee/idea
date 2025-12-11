"use client";

import { useState, useRef, useEffect } from "react";

type StackedReaction = { value: string; count: number };

const EMOJI_PALETTE = [
  "👍",
  "❤️",
  "🔥",
  "🚀",
  "🤔",
  "😂",
  "😮",
  "😢",
  "🙏",
  "👀",
];

type PublicReactionsBarProps = {
  stacked: StackedReaction[];
  onToggleReaction: (_emoji: string) => void;
};

export function PublicReactionsBar({
  stacked,
  onToggleReaction,
}: PublicReactionsBarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex items-center gap-2" ref={ref}>
      <div className="flex flex-wrap items-center gap-2">
        {stacked.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => onToggleReaction(r.value)}
            className="flex h-7 min-w-[36px] items-center justify-center gap-1.5 rounded-full border border-zinc-800 bg-[#121214] px-2.5 text-[13px] font-medium text-zinc-300 transition hover:-translate-y-[1px] hover:border-zinc-500 hover:bg-zinc-900 hover:text-white"
          >
            <span className="leading-none">{r.value}</span>
            <span className="text-[10px] font-bold text-zinc-600">
              {r.count}
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex h-7 w-8 items-center justify-center rounded-full border text-[14px] transition ${
            open
              ? "border-zinc-700 bg-zinc-800 text-zinc-200"
              : "border-transparent bg-zinc-900/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          }`}
        >
          +
        </button>

        {open && (
          <div className="absolute left-0 top-full z-50 mt-2 w-[180px] rounded-xl border border-zinc-800 bg-[#121214] p-2 shadow-2xl">
            <div className="grid grid-cols-5 gap-1">
              {EMOJI_PALETTE.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onToggleReaction(emoji);
                    setOpen(false);
                  }}
                  className="flex aspect-square items-center justify-center rounded-lg text-lg transition hover:bg-zinc-800 hover:scale-110 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

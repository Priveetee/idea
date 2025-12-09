"use client";

import { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RiAddLine } from "react-icons/ri";

type StackedReaction = { value: string; count: number };

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

type HubIdeaReactionsBarProps = {
  stacked: StackedReaction[];
  onToggleReaction: (_emoji: string) => void;
};

export function HubIdeaReactionsBar({
  stacked,
  onToggleReaction,
}: HubIdeaReactionsBarProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex items-center gap-2">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {stacked.map((r) => (
          <button
            key={r.value}
            onClick={() => onToggleReaction(r.value)}
            className="group flex h-7 min-w-[36px] items-center justify-center gap-1.5 rounded-full border border-zinc-800 bg-[#121214] px-2.5 text-[13px] font-medium text-zinc-300 transition hover:-translate-y-[1px] hover:border-[#5227FF] hover:bg-[#5227FF]/15 hover:text-white hover:shadow-[0_0_12px_rgba(82,39,255,0.35)]"
          >
            <span className="leading-none">{r.value}</span>
            <span className="text-[10px] font-bold text-zinc-600 group-hover:text-[#d4d4ff]">
              {r.count}
            </span>
          </button>
        ))}
      </div>

      <div className="relative mb-3" ref={pickerRef}>
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
  );
}

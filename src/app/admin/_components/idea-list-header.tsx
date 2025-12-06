"use client";

import { useEffect, useRef, useState } from "react";
import { FaFilter } from "react-icons/fa";

type SortMode = "recent" | "old";

type IdeaListHeaderProps = {
  color: string;
  label: string;
  sortMode: SortMode;
  onChangeSort: (_: SortMode) => void;
  query: string;
  onChangeQuery: (_: string) => void;
  onAddFolder: () => void;
  onOpenCreation: () => void;
};

export function IdeaListHeader({
  color,
  label,
  sortMode,
  onChangeSort,
  query,
  onChangeQuery,
  onAddFolder,
  onOpenCreation,
}: IdeaListHeaderProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  const filterLabel = sortMode === "recent" ? "Récent" : "Ancien";

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium text-zinc-300">{label}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((x) => !x)}
              className={`flex h-7 items-center gap-2 rounded-full border px-3 transition ${
                filterOpen
                  ? "border-[#5227FF] bg-[#5227FF]/10 text-zinc-100"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              <FaFilter className="h-3 w-3" />
              <span>{filterLabel}</span>
            </button>
            {filterOpen && (
              <div className="absolute right-0 z-20 mt-1 w-44 rounded-md border border-zinc-700 bg-[#050509] py-1 text-[11px] text-zinc-200 shadow-lg">
                <button
                  type="button"
                  className="flex w-full items-center px-3 py-1.5 text-left hover:bg-zinc-800"
                  onClick={() => {
                    onChangeSort("recent");
                    setFilterOpen(false);
                  }}
                >
                  Récent
                </button>
                <button
                  type="button"
                  className="flex w-full items-center px-3 py-1.5 text-left hover:bg-zinc-800"
                  onClick={() => {
                    onChangeSort("old");
                    setFilterOpen(false);
                  }}
                >
                  Ancien
                </button>
              </div>
            )}
          </div>
          <input
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            placeholder="Filtrer..."
            className="h-7 w-32 rounded-full border border-zinc-700 bg-zinc-900 px-3 text-[11px] text-zinc-200 outline-none focus:border-[#5227FF]"
          />
          <button
            type="button"
            onClick={onAddFolder}
            className="h-7 rounded-full border border-zinc-700 bg-zinc-900 px-3 text-[11px] text-zinc-300 transition hover:border-zinc-500"
          >
            + Folder
          </button>
          <button
            type="button"
            onClick={onOpenCreation}
            className="h-7 rounded-full bg-[#5227FF] px-4 text-[11px] font-medium text-white transition hover:bg-[#3f21c9]"
          >
            + Idée
          </button>
        </div>
      </div>
    </>
  );
}

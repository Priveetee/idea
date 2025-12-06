"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import AnimatedList from "@/components/ui/animated-list";
import {
  getFolderColor,
  getFolderLabel,
  type IdeaStatus,
  type IdeaItem,
  type FolderConfig,
} from "@/lib/mock-data";
import { IdeaCreationModal } from "./idea-creation-modal";

type SortMode = "recent" | "old";

type AdminIdeaListProps = {
  activeStatus: IdeaStatus | string;
  folders: FolderConfig[];
  items: IdeaItem[];
  selectAction: (_: { item: string; index: number }) => void;
  addIdeaAction: (_: { label: string; status: IdeaStatus | string }) => void;
  addFolderAction: () => void;
};

export function AdminIdeaList({
  activeStatus,
  folders,
  items,
  selectAction,
  addIdeaAction,
  addFolderAction,
}: AdminIdeaListProps) {
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creationOpen, setCreationOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const color = getFolderColor(activeStatus, folders);
  const label = getFolderLabel(activeStatus, folders);

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

  const sorted = useMemo(() => {
    const base =
      sortMode === "recent"
        ? [...items].sort((a, b) => Number(b.id) - Number(a.id))
        : [...items].sort((a, b) => Number(a.id) - Number(b.id));

    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, sortMode, query]);

  const displayItems = sorted.map((i) => {
    const label = i.label;
    const idx = label.indexOf(" (Impact:");
    if (idx === -1) return label;
    return label.slice(0, idx);
  });

  const filterLabel = sortMode === "recent" ? "Récent" : "Ancien";

  return (
    <div className="relative col-span-5 px-2">
      {creationOpen && (
        <IdeaCreationModal
          activeStatus={activeStatus}
          onClose={() => setCreationOpen(false)}
          onCreate={addIdeaAction}
        />
      )}

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
                    setSortMode("recent");
                    setFilterOpen(false);
                  }}
                >
                  Récent
                </button>
                <button
                  type="button"
                  className="flex w-full items-center px-3 py-1.5 text-left hover:bg-zinc-800"
                  onClick={() => {
                    setSortMode("old");
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrer..."
            className="h-7 w-32 rounded-full border border-zinc-700 bg-zinc-900 px-3 text-[11px] text-zinc-200 outline-none focus:border-[#5227FF]"
          />
          <button
            type="button"
            onClick={addFolderAction}
            className="h-7 rounded-full border border-zinc-700 bg-zinc-900 px-3 text-[11px] text-zinc-300 transition hover:border-zinc-500"
          >
            + Folder
          </button>
          <button
            type="button"
            onClick={() => setCreationOpen(true)}
            className="h-7 rounded-full bg-[#5227FF] px-4 text-[11px] font-medium text-white transition hover:bg-[#3f21c9]"
          >
            + Idée
          </button>
        </div>
      </div>

      <div
        className={`rounded-2xl border border-zinc-900 bg-[#060010] transition ${
          creationOpen ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <AnimatedList
          items={displayItems}
          onItemSelect={(item, index) => selectAction({ item, index })}
          showGradients
          enableArrowNavigation
          displayScrollbar
          className="w-full"
          itemClassName="border-l-2 border-transparent hover:border-[#5227FF] transition-colors"
        />
      </div>
    </div>
  );
}

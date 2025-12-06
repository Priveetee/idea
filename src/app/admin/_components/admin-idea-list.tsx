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
    const base = [...items].sort((a, b) => Number(b.id) - Number(a.id));
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query]);

  const displayItems = sorted.map((i) => {
    const l = i.label;
    const idx = l.indexOf(" (Impact:");
    if (idx === -1) return l;
    return l.slice(0, idx);
  });

  return (
    <div className="relative col-span-5 px-2">
      {creationOpen && (
        <IdeaCreationModal
          activeStatus={activeStatus}
          closeAction={() => setCreationOpen(false)}
          createAction={addIdeaAction}
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
              <span>Récent</span>
            </button>
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
        {displayItems.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-[12px] text-zinc-500">
            Aucune idée dans cet espace. Clique sur
            <span className="mx-1 rounded-full bg-[#5227FF] px-2 py-0.5 text-white">
              + Idée
            </span>
            pour en ajouter une.
          </div>
        ) : (
          <AnimatedList
            items={displayItems}
            onItemSelect={(item, index) => selectAction({ item, index })}
            showGradients
            enableArrowNavigation
            displayScrollbar
            className="w-full"
            itemClassName="border-l-2 border-transparent hover:border-[#5227FF] transition-colors"
          />
        )}
      </div>
    </div>
  );
}

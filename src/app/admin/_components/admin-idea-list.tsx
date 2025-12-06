"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import AnimatedList, {
  type AnimatedListItem,
} from "@/components/ui/animated-list";
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

type SortMode = "recent" | "oldest" | "alpha";

const SORT_MODE_LABEL: Record<SortMode, string> = {
  recent: "Plus récent",
  oldest: "Plus ancien",
  alpha: "Titre A → Z",
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
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creationOpen, setCreationOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const color = getFolderColor(activeStatus, folders);
  const label = getFolderLabel(activeStatus, folders);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setFilterMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  const sorted = useMemo(() => {
    const base = [...items];

    const withIdSort =
      sortMode === "recent"
        ? base.sort((a, b) => Number(b.id) - Number(a.id))
        : sortMode === "oldest"
          ? base.sort((a, b) => Number(a.id) - Number(b.id))
          : base.sort((a, b) => a.label.localeCompare(b.label));

    if (!query.trim()) return withIdSort;

    const q = query.toLowerCase();
    return withIdSort.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query, sortMode]);

  const displayItems: AnimatedListItem[] = sorted.map((i) => {
    const l = i.label;
    const idx = l.indexOf(" (Impact:");
    return {
      id: `idea-${i.id}`,
      label: idx === -1 ? l : l.slice(0, idx),
    };
  });

  const handleItemSelect = (item: AnimatedListItem, index: number) => {
    selectAction({ item: item.label, index });
  };

  const handleSelectSortMode = (mode: SortMode) => {
    setSortMode(mode);
    setFilterMenuOpen(false);
  };

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
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-300">{label}</span>
            <span className="text-[11px] text-zinc-500">
              {displayItems.length} idée(s)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setFilterMenuOpen((x) => !x)}
              className={`flex h-7 items-center gap-2 rounded-full border px-3 text-[11px] transition ${
                filterMenuOpen
                  ? "border-[#5227FF] bg-[#5227FF]/10 text-zinc-100"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              <FaFilter className="h-3 w-3" />
              <span>{SORT_MODE_LABEL[sortMode]}</span>
            </button>

            {filterMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-40 rounded-2xl border border-zinc-800 bg-[#050509] py-1 text-[11px] text-zinc-200 shadow-xl">
                <button
                  type="button"
                  onClick={() => handleSelectSortMode("recent")}
                  className={`flex w-full items-center px-3 py-1.5 text-left hover:bg-zinc-900 ${
                    sortMode === "recent" ? "text-zinc-50" : ""
                  }`}
                >
                  Plus récent
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSortMode("oldest")}
                  className={`flex w-full items-center px-3 py-1.5 text-left hover:bg-zinc-900 ${
                    sortMode === "oldest" ? "text-zinc-50" : ""
                  }`}
                >
                  Plus ancien
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSortMode("alpha")}
                  className={`flex w-full items-center px-3 py-1.5 text-left hover:bg-zinc-900 ${
                    sortMode === "alpha" ? "text-zinc-50" : ""
                  }`}
                >
                  Titre A → Z
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
        className={`rounded-4xl border border-zinc-900 bg-[#060010] px-2 py-2 transition ${
          creationOpen ? "pointer-events-none blur-sm" : ""
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
          <SortableContext
            items={displayItems.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatedList
              items={displayItems}
              onItemSelect={handleItemSelect}
              enableDrag
              showGradients
              enableArrowNavigation={false}
              displayScrollbar
              className="w-full"
            />
          </SortableContext>
        )}
      </div>
    </div>
  );
}

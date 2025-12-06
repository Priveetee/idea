"use client";

import { useState } from "react";
import { FaFilter } from "react-icons/fa";
import AnimatedList from "@/components/ui/animated-list";
import {
  getFolderColor,
  getFolderLabel,
  type IdeaStatus,
  type IdeaItem,
  type FolderConfig,
} from "@/lib/mock-data";

type SortMode = "created" | "alpha";

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
  const [sortMode, setSortMode] = useState<SortMode>("created");
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");

  const color = getFolderColor(activeStatus, folders);
  const label = getFolderLabel(activeStatus, folders);

  const sortedItems =
    sortMode === "alpha"
      ? [...items].sort((a, b) =>
          a.label.localeCompare(b.label, "fr", { sensitivity: "base" }),
        )
      : items;

  const handleCreateIdea = () => {
    const trimmed = draftLabel.trim();
    if (!trimmed) return;
    addIdeaAction({ label: trimmed, status: activeStatus });
    setDraftLabel("");
  };

  return (
    <div className="col-span-5 px-2">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium text-zinc-300">{label}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
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
            <span>Filtres</span>
          </button>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="h-7 rounded-full border border-zinc-700 bg-zinc-900 px-3 text-[11px] text-zinc-400 outline-none"
          >
            <option value="created">Ordre d&apos;arrivée</option>
            <option value="alpha">Alphabétique</option>
          </select>
          <button
            type="button"
            onClick={addFolderAction}
            className="h-7 rounded-full border border-zinc-700 bg-zinc-900 px-3 text-[11px] text-zinc-300 transition hover:border-zinc-500"
          >
            + Folder
          </button>
        </div>
      </div>

      {filterOpen && (
        <div className="mb-3 rounded-2xl border border-zinc-900 bg-[#060010] px-4 py-3 text-[11px] text-zinc-400">
          Zone filtres mock (par TGI, par mots-clés, par période).
        </div>
      )}

      <div className="mb-3 rounded-2xl border border-zinc-900 bg-[#060010] px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateIdea();
            }}
            placeholder="Nouvelle idée pour cet espace…"
            className="h-8 flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-[11px] text-zinc-100 outline-none focus:border-[#5227FF]"
          />
          <button
            type="button"
            onClick={handleCreateIdea}
            className="h-8 rounded-full bg-[#5227FF] px-3 text-[11px] font-medium text-white transition hover:bg-[#3f21c9]"
          >
            + Idée
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-900 bg-[#060010]">
        <AnimatedList
          items={sortedItems.map((i) => i.label)}
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

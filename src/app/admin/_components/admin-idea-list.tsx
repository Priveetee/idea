"use client";

import { useMemo, useState } from "react";
import AnimatedList from "@/components/ui/animated-list";
import {
  getFolderColor,
  getFolderLabel,
  type IdeaStatus,
  type IdeaItem,
  type FolderConfig,
} from "@/lib/mock-data";
import { IdeaListHeader } from "./idea-list-header";
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
  const [sortMode, setSortMode] = useState<"recent" | "old">("recent");
  const [query, setQuery] = useState("");
  const [creationOpen, setCreationOpen] = useState(false);

  const color = getFolderColor(activeStatus, folders);
  const label = getFolderLabel(activeStatus, folders);

  const sorted = useMemo(() => {
    const base =
      sortMode === "recent"
        ? [...items].sort((a, b) => Number(b.id) - Number(a.id))
        : [...items].sort((a, b) => Number(a.id) - Number(b.id));

    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, sortMode, query]);

  return (
    <div className="relative col-span-5 px-2">
      {creationOpen && (
        <IdeaCreationModal
          activeStatus={activeStatus}
          onClose={() => setCreationOpen(false)}
          onCreate={addIdeaAction}
        />
      )}

      <IdeaListHeader
        color={color}
        label={label}
        sortMode={sortMode}
        onChangeSort={setSortMode}
        query={query}
        onChangeQuery={setQuery}
        onAddFolder={addFolderAction}
        onOpenCreation={() => setCreationOpen(true)}
      />

      <div
        className={`rounded-2xl border border-zinc-900 bg-[#060010] transition ${
          creationOpen ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <AnimatedList
          items={sorted.map((i) => i.label)}
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

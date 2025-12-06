"use client";

import { useMemo, useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  getFolderColor,
  getFolderLabel,
  type IdeaStatus,
  type IdeaItem,
  type FolderConfig,
} from "@/lib/mock-data";
import { IdeaCreationModal } from "./idea-creation-modal";
import { IdeaListHeader } from "./idea-list-header";
import { IdeaListItem } from "./idea-list-item";
import { IdeaDeleteModal } from "./idea-delete-modal";

type SortMode = "recent" | "old";

type AdminIdeaListProps = {
  activeStatus: IdeaStatus | string;
  folders: FolderConfig[];
  items: IdeaItem[];
  selectAction: (_: { item: string; index: number }) => void;
  addIdeaAction: (_: { label: string; status: IdeaStatus | string }) => void;
  addFolderAction: () => void;
  renameIdeaAction: (_: { id: string; label: string }) => void;
  deleteIdeaAction: (_: { id: string }) => void;
};

export function AdminIdeaList({
  activeStatus,
  folders,
  items,
  selectAction,
  addIdeaAction,
  addFolderAction,
  renameIdeaAction,
  deleteIdeaAction,
}: AdminIdeaListProps) {
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [query, setQuery] = useState("");
  const [creationOpen, setCreationOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [actionsMenuId, setActionsMenuId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const color = getFolderColor(activeStatus, folders);
  const label = getFolderLabel(activeStatus, folders);

  const sorted = useMemo(() => {
    const base = [...items];

    const sortedById =
      sortMode === "recent"
        ? base.sort((a, b) => Number(b.id) - Number(a.id))
        : base.sort((a, b) => Number(a.id) - Number(b.id));

    if (!query.trim()) return sortedById;

    const q = query.toLowerCase();
    return sortedById.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query, sortMode]);

  const handleRowSelect = (idea: IdeaItem, index: number) => {
    setActiveId(idea.id);
    selectAction({ item: idea.label, index });
  };

  const handleStartEditing = (idea: IdeaItem) => {
    setEditingId(idea.id);
    setEditingDraft(idea.label);
    setActionsMenuId(null);
  };

  const handleCommitEditing = () => {
    if (!editingId) return;
    const trimmed = editingDraft.trim();
    if (trimmed) {
      renameIdeaAction({ id: editingId, label: trimmed });
    }
    setEditingId(null);
  };

  const handleCancelEditing = () => {
    setEditingId(null);
  };

  const handleToggleActions = (id: string) => {
    setActionsMenuId((current) => (current === id ? null : id));
  };

  const openDeleteModal = (id: string) => {
    setDeleteTargetId(id);
    setActionsMenuId(null);
  };

  const cancelDelete = () => {
    setDeleteTargetId(null);
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    deleteIdeaAction({ id: deleteTargetId });
    setDeleteTargetId(null);
  };

  const deleteTargetIdea =
    deleteTargetId !== null
      ? (sorted.find((idea) => idea.id === deleteTargetId) ?? null)
      : null;

  return (
    <div className="relative col-span-5 px-2">
      {creationOpen && (
        <IdeaCreationModal
          activeStatus={activeStatus}
          closeAction={() => setCreationOpen(false)}
          createAction={addIdeaAction}
        />
      )}

      <IdeaDeleteModal
        open={deleteTargetIdea !== null}
        label={deleteTargetIdea?.label ?? ""}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

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
        className={`rounded-4xl border border-zinc-900 bg-[#060010] px-2 py-2 transition ${
          creationOpen ? "pointer-events-none blur-sm" : ""
        }`}
      >
        {sorted.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-[12px] text-zinc-500">
            Aucune idée dans cet espace. Clique sur
            <span className="mx-1 rounded-full bg-[#5227FF] px-2 py-0.5 text-white">
              + Idée
            </span>
            pour en ajouter une.
          </div>
        ) : (
          <SortableContext
            items={sorted.map((idea) => `idea-${idea.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="max-h-[400px] overflow-y-auto px-2 py-1">
              {sorted.map((idea, index) => (
                <IdeaListItem
                  key={idea.id}
                  idea={idea}
                  isActive={activeId === idea.id}
                  isEditing={editingId === idea.id}
                  draftLabel={editingId === idea.id ? editingDraft : idea.label}
                  showActions={actionsMenuId === idea.id}
                  onSelect={() => handleRowSelect(idea, index)}
                  onStartEditing={() => handleStartEditing(idea)}
                  onChangeDraft={setEditingDraft}
                  onCommitEditing={handleCommitEditing}
                  onCancelEditing={handleCancelEditing}
                  onToggleActions={() => handleToggleActions(idea.id)}
                  onDelete={() => openDeleteModal(idea.id)}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}

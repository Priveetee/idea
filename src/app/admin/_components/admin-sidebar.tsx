"use client";

import { useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { IdeaStatus, IdeaItem, FolderConfig } from "@/lib/mock-data";
import { SidebarFolderItem } from "./sidebar-folder-item";

type AdminSidebarProps = {
  folders: FolderConfig[];
  ideas: IdeaItem[];
  activeStatus: IdeaStatus | string;
  changeStatusAction: (_: IdeaStatus | string) => void;
  renameFolderAction: (_: { id: string; label: string }) => void;
  changeFolderColorAction: (_: { id: string; color: string }) => void;
  duplicateFolderAction: (_: { id: string }) => void;
  deleteFolderAction: (_: { id: string }) => void;
};

export function AdminSidebar({
  folders,
  ideas,
  activeStatus,
  changeStatusAction,
  renameFolderAction,
  changeFolderColorAction,
  duplicateFolderAction,
  deleteFolderAction,
}: AdminSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [colorMenuId, setColorMenuId] = useState<string | null>(null);
  const [actionsMenuId, setActionsMenuId] = useState<string | null>(null);
  const [deleteStepById, setDeleteStepById] = useState<
    Record<string, "idle" | "confirm">
  >({});

  const getCountForFolder = (folderId: string) =>
    ideas.filter((idea) => idea.status === folderId).length;

  const startEditing = (folder: FolderConfig) => {
    setEditingId(folder.id as string);
    setDraftLabel(folder.label);
    setColorMenuId(null);
    setActionsMenuId(null);
    setDeleteStepById({});
  };

  const commitEditing = () => {
    if (!editingId) return;
    const trimmed = draftLabel.trim();
    if (trimmed) {
      renameFolderAction({ id: editingId, label: trimmed });
    }
    setEditingId(null);
  };

  const toggleColorMenu = (id: string) => {
    setColorMenuId((current) => (current === id ? null : id));
    setActionsMenuId(null);
    setDeleteStepById({});
  };

  const handleColorChange = (id: string, color: string) => {
    changeFolderColorAction({ id, color });
    setColorMenuId(null);
  };

  const toggleActionsMenu = (id: string) => {
    setActionsMenuId((current) => (current === id ? null : id));
    setColorMenuId(null);
    setDeleteStepById({});
  };

  const handleDuplicate = (id: string) => {
    duplicateFolderAction({ id });
    setActionsMenuId(null);
    setDeleteStepById({});
  };

  const requestDelete = (id: string) => {
    setDeleteStepById({ [id]: "confirm" });
  };

  const cancelDelete = () => {
    setDeleteStepById({});
  };

  const confirmDelete = (id: string) => {
    deleteFolderAction({ id });
    setDeleteStepById({});
  };

  return (
    <div className="col-span-2 border-r border-zinc-800/60">
      <div className="folders-scroll h-[calc(100vh-120px)] overflow-y-auto pt-8 pb-14">
        <SortableContext
          items={folders.map((folder) => `folder-sort-${folder.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col items-center gap-12">
            {folders.map((folder) => {
              const id = folder.id as string;
              const count = getCountForFolder(id);
              const isActive = activeStatus === folder.id;
              const isEditing = editingId === folder.id;
              const showColorMenu = colorMenuId === folder.id;
              const showActionsMenu = actionsMenuId === folder.id;
              const deleteStep = deleteStepById[id] ?? "idle";

              return (
                <SidebarFolderItem
                  key={id}
                  folderId={id}
                  label={folder.label}
                  color={folder.color}
                  ideaCount={count}
                  isActive={isActive}
                  isEditing={isEditing}
                  draftLabel={draftLabel}
                  deleteStep={deleteStep}
                  onSelectFolder={() => changeStatusAction(folder.id)}
                  onStartEditing={() => startEditing(folder)}
                  onCommitEditing={commitEditing}
                  onDraftChange={setDraftLabel}
                  showColorMenu={showColorMenu}
                  onToggleColorMenu={() => toggleColorMenu(id)}
                  onColorChange={(color) => handleColorChange(id, color)}
                  showActionsMenu={showActionsMenu}
                  onToggleActionsMenu={() => toggleActionsMenu(id)}
                  onDuplicate={() => handleDuplicate(id)}
                  onRequestDelete={() => requestDelete(id)}
                  onConfirmDelete={() => confirmDelete(id)}
                  onCancelDelete={cancelDelete}
                />
              );
            })}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

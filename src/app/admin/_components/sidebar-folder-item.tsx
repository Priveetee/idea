"use client";

import { motion } from "motion/react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Folder from "@/components/ui/folder";
import { SidebarFolderMenu } from "./sidebar-folder-menu";
import { SidebarFolderColorMenu } from "./sidebar-folder-color-menu";

type SidebarFolderItemProps = {
  folderId: string | undefined;
  label: string;
  color: string;
  ideaCount: number;
  isActive: boolean;
  isEditing: boolean;
  draftLabel: string;
  deleteStep: "idle" | "confirm";
  onSelectFolder: () => void;
  onStartEditing: () => void;
  onCommitEditing: () => void;
  onDraftChange: (_: string) => void;
  showColorMenu: boolean;
  onToggleColorMenu: () => void;
  onColorChange: (_: string) => void;
  showActionsMenu: boolean;
  onToggleActionsMenu: () => void;
  onDuplicate: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
};

export function SidebarFolderItem({
  folderId,
  label,
  color,
  ideaCount,
  isActive,
  isEditing,
  draftLabel,
  deleteStep,
  onSelectFolder,
  onStartEditing,
  onCommitEditing,
  onDraftChange,
  showColorMenu,
  onToggleColorMenu,
  onColorChange,
  showActionsMenu,
  onToggleActionsMenu,
  onDuplicate,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: SidebarFolderItemProps) {
  const id = folderId ?? "";
  const sortableId = `folder-sort-${id}`;
  const {
    setNodeRef: setSortableRef,
    transform,
    transition,
  } = useSortable({
    id: sortableId,
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `folder-${id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSystemFolder = id === "INBOX" || id === "DEV" || id === "ARCHIVE";

  return (
    <div
      ref={(node) => {
        setSortableRef(node);
        setDroppableRef(node);
      }}
      style={style}
      className="relative flex flex-col items-center"
    >
      <button
        type="button"
        onClick={onSelectFolder}
        className="relative transition hover:scale-[1.02]"
      >
        <Folder size={1.1} color={color} active={isActive} />
        {(isActive || isOver) && (
          <motion.div
            layoutId="folder-glow"
            className="absolute inset-0 -z-10 rounded-full bg-[#5227FF]/25 blur-2xl"
          />
        )}
      </button>

      <div className="mt-3 flex flex-col items-center text-[11px] font-medium text-zinc-400">
        {isEditing ? (
          <input
            value={draftLabel}
            onChange={(e) => onDraftChange(e.target.value)}
            onBlur={onCommitEditing}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCommitEditing();
              if (e.key === "Escape") onStartEditing();
            }}
            autoFocus
            className="w-[150px] rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-center text-[11px] text-zinc-100 outline-none focus:border-[#5227FF]"
          />
        ) : (
          <button
            type="button"
            className={`max-w-[150px] truncate ${
              isActive ? "text-zinc-50" : "text-zinc-500"
            }`}
            onClick={onStartEditing}
          >
            {label}
          </button>
        )}
        <div className="mt-0.5 text-[10px] text-zinc-500">
          {ideaCount} idée(s)
        </div>

        <div className="mt-2 flex items-center gap-2 text-[10px]">
          <button
            type="button"
            onClick={onToggleActionsMenu}
            className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-100"
          >
            ⋯
          </button>
          <button
            type="button"
            onClick={onToggleColorMenu}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-0.5 text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-200"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            Couleur
          </button>
        </div>
      </div>

      {showActionsMenu && (
        <SidebarFolderMenu
          isSystemFolder={isSystemFolder}
          deleteStep={deleteStep}
          onRename={onStartEditing}
          onDuplicate={onDuplicate}
          onRequestDelete={onRequestDelete}
          onConfirmDelete={onConfirmDelete}
          onCancelDelete={onCancelDelete}
        />
      )}

      {showColorMenu && (
        <SidebarFolderColorMenu onColorChangeAction={onColorChange} />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useDroppable } from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RiDragMove2Fill } from "react-icons/ri";
import Folder from "@/components/ui/folder";
import type { IdeaStatus, IdeaItem, FolderConfig } from "@/lib/mock-data";

type AdminSidebarProps = {
  folders: FolderConfig[];
  ideas: IdeaItem[];
  activeStatus: IdeaStatus | string;
  changeStatusAction: (_: IdeaStatus | string) => void;
  renameFolderAction: (_: { id: string; label: string }) => void;
  changeFolderColorAction: (_: { id: string; color: string }) => void;
};

const PALETTE_COLORS = [
  "#5227FF",
  "#3b82f6",
  "#0ea5e9",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#a855f7",
  "#6366f1",
  "#14b8a6",
  "#64748b",
];

type SidebarFolderItemProps = {
  folder: FolderConfig;
  ideaCount: number;
  isActive: boolean;
  isEditing: boolean;
  draftLabel: string;
  onChangeStatus: () => void;
  onStartEditing: () => void;
  onCommitEditing: () => void;
  onDraftChange: (_: string) => void;
  showColorMenu: boolean;
  onToggleColorMenu: () => void;
  onColorChange: (_: string) => void;
};

function SidebarFolderItem({
  folder,
  ideaCount,
  isActive,
  isEditing,
  draftLabel,
  onChangeStatus,
  onStartEditing,
  onCommitEditing,
  onDraftChange,
  showColorMenu,
  onToggleColorMenu,
  onColorChange,
}: SidebarFolderItemProps) {
  const sortableId = `folder-sort-${folder.id}`;
  const {
    setNodeRef: setSortableRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging,
  } = useSortable({ id: sortableId });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
        onClick={onChangeStatus}
        className={`relative transition ${isDragging ? "opacity-70" : ""}`}
      >
        <Folder size={1.1} color={folder.color} active={isActive} />
        {(isActive || isOver) && (
          <motion.div
            layoutId="folder-glow"
            className="absolute inset-0 -z-10 rounded-full bg-[#5227FF]/25 blur-2xl"
          />
        )}
      </button>

      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-[11px] text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-200 active:cursor-grabbing"
      >
        <RiDragMove2Fill className="h-3 w-3" />
      </button>

      <div className="mt-2 flex flex-col items-center text-[11px] font-medium text-zinc-400">
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
            className="w-[120px] rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-center text-[11px] text-zinc-100 outline-none focus:border-[#5227FF]"
          />
        ) : (
          <button
            type="button"
            className={`max-w-[120px] truncate ${
              isActive ? "text-zinc-50" : "text-zinc-500"
            }`}
            onClick={onStartEditing}
          >
            {folder.label}
          </button>
        )}
        <div className="mt-0.5 text-[10px] opacity-60">{ideaCount} idée(s)</div>

        <button
          type="button"
          onClick={onToggleColorMenu}
          className="mt-1 inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[9px] text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-200"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: folder.color }}
          />
          Couleur
        </button>

        {showColorMenu && (
          <div className="mt-2 rounded-2xl border border-zinc-800 bg-[#050509] px-2 py-2 text-[9px] text-zinc-400 shadow-xl">
            <div className="mb-1 px-1 text-[9px] uppercase tracking-[0.16em] text-zinc-500">
              Palette
            </div>
            <div className="grid grid-cols-6 gap-1">
              {PALETTE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onColorChange(color)}
                  className="h-4 w-4 rounded-full border border-zinc-800 hover:scale-110"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminSidebar({
  folders,
  ideas,
  activeStatus,
  changeStatusAction,
  renameFolderAction,
  changeFolderColorAction,
}: AdminSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [colorMenuId, setColorMenuId] = useState<string | null>(null);

  const getCountForFolder = (folderId: string) =>
    ideas.filter((idea) => idea.status === folderId).length;

  const startEditing = (folder: FolderConfig) => {
    setEditingId(folder.id as string);
    setDraftLabel(folder.label);
    setColorMenuId(null);
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
    setEditingId(null);
  };

  const handleColorChange = (id: string, color: string) => {
    changeFolderColorAction({ id, color });
    setColorMenuId(null);
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
              const count = getCountForFolder(folder.id as string);
              const isActive = activeStatus === folder.id;
              const isEditing = editingId === folder.id;
              const showColorMenu = colorMenuId === folder.id;

              return (
                <SidebarFolderItem
                  key={folder.id}
                  folder={folder}
                  ideaCount={count}
                  isActive={isActive}
                  isEditing={isEditing}
                  draftLabel={draftLabel}
                  onChangeStatus={() => changeStatusAction(folder.id)}
                  onStartEditing={() => startEditing(folder)}
                  onCommitEditing={commitEditing}
                  onDraftChange={setDraftLabel}
                  showColorMenu={showColorMenu}
                  onToggleColorMenu={() => toggleColorMenu(folder.id as string)}
                  onColorChange={(color) =>
                    handleColorChange(folder.id as string, color)
                  }
                />
              );
            })}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

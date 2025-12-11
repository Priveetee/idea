"use client";

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RiDragMove2Fill } from "react-icons/ri";
import type { AdminIdeaItem } from "../use-admin-ideas";

type IdeaListItemProps = {
  idea: AdminIdeaItem;
  isActive: boolean;
  isEditing: boolean;
  draftLabel: string;
  showActions: boolean;
  onSelect: () => void;
  onStartEditing: () => void;
  onChangeDraft: (_: string) => void;
  onCommitEditing: () => void;
  onCancelEditing: () => void;
  onToggleActions: () => void;
  onDelete: () => void;
};

export function IdeaListItem({
  idea,
  isActive,
  isEditing,
  draftLabel,
  showActions,
  onSelect,
  onStartEditing,
  onChangeDraft,
  onCommitEditing,
  onCancelEditing,
  onToggleActions,
  onDelete,
}: IdeaListItemProps) {
  const sortableId = `idea-${idea.id}`;
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition],
  );

  const cleanLabel = useMemo(() => {
    const idx = idea.label.indexOf(" (Impact:");
    if (idx === -1) return idea.label;
    return idea.label.slice(0, idx);
  }, [idea.label]);

  return (
    <div ref={setNodeRef} style={style} className="mb-2 last:mb-0">
      <div
        className={`group flex cursor-pointer items-center rounded-xl bg-[#111] px-3 py-3 transition ${
          isActive ? "bg-[#222]" : "hover:bg-[#171717]"
        } ${isDragging ? "cursor-grabbing opacity-80" : ""}`}
        onClick={onSelect}
      >
        <div className="flex-1">
          {isEditing ? (
            <input
              value={draftLabel}
              autoFocus
              onChange={(e) => onChangeDraft(e.target.value)}
              onBlur={onCommitEditing}
              onKeyDown={(e) => {
                if (e.key === "Enter") onCommitEditing();
                if (e.key === "Escape") onCancelEditing();
              }}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-[13px] text-zinc-100 outline-none focus:border-[#5227FF]"
            />
          ) : (
            <div
              className="text-[13px] text-zinc-100"
              onDoubleClick={(e) => {
                e.stopPropagation();
                onStartEditing();
              }}
            >
              {cleanLabel}
            </div>
          )}
        </div>

        <div className="ml-2 flex items-center gap-1">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-[11px] text-zinc-400 opacity-0 transition group-hover:opacity-100 hover:border-zinc-600 hover:text-zinc-100"
            onClick={(e) => e.stopPropagation()}
          >
            <RiDragMove2Fill className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleActions();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-[12px] text-zinc-400 opacity-0 transition group-hover:opacity-100 hover:border-zinc-600 hover:text-zinc-100"
          >
            ⋯
          </button>
        </div>
      </div>

      {showActions && (
        <div className="mt-1 w-full rounded-xl border border-zinc-800 bg-[#050509] px-3 py-2 text-[11px] text-zinc-200 shadow-lg">
          <button
            type="button"
            onClick={onStartEditing}
            className="flex w-full items-center justify-between py-1 text-left hover:text-zinc-50"
          >
            <span>Renommer</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="mt-1 flex w-full items-center justify-between py-1 text-left text-red-400 hover:text-red-300"
          >
            <span>Supprimer</span>
          </button>
        </div>
      )}
    </div>
  );
}

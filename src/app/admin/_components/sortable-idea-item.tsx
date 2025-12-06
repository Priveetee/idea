"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

type SortableIdeaItemProps = {
  id: string;
  label: string;
  index: number;
  onSelect: (_: { item: string; index: number }) => void;
};

export function SortableIdeaItem({
  id,
  label,
  index,
  onSelect,
}: SortableIdeaItemProps) {
  const sortableId = `idea-${id}`;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: sortableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
      onClick={() => onSelect({ item: label, index })}
    >
      <div className="mb-2 last:mb-0">
        <div className="rounded-xl bg-zinc-900 px-4 py-3 text-sm text-zinc-100 border-l-2 border-transparent hover:border-[#5227FF] transition-colors">
          {label}
        </div>
      </div>
    </div>
  );
}

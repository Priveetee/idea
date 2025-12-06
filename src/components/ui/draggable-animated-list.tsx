"use client";

import React, { useState, useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AnimatedList, { type AnimatedListItem } from "./animated-list";

type DraggableAnimatedListProps = {
  items: AnimatedListItem[];
  onReorder: (_: { orderedIds: string[] }) => void;
  onItemSelect?: (item: AnimatedListItem, index: number) => void;
  className?: string;
  itemClassName?: string;
};

type SortableWrapperProps = {
  id: string;
  children: React.ReactNode;
};

function SortableWrapper({ id, children }: SortableWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

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
    >
      {children}
    </div>
  );
}

const DraggableAnimatedList: React.FC<DraggableAnimatedListProps> = ({
  items,
  onReorder,
  onItemSelect,
  className = "",
  itemClassName = "",
}) => {
  const [order, setOrder] = useState<string[]>(items.map((i) => i.id));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const orderedItems = useMemo(() => {
    const byId = new Map(items.map((i) => [i.id, i]));
    const mapped = order
      .map((id) => byId.get(id))
      .filter((i): i is AnimatedListItem => i !== undefined);
    const rest = items.filter((i) => !order.includes(i.id));
    return [...mapped, ...rest];
  }, [items, order]);

  const handleReorder = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const activeIndex = order.indexOf(String(active.id));
    const overIndex = order.indexOf(String(over.id));
    if (activeIndex === -1 || overIndex === -1) return;

    const newOrder = arrayMove(order, activeIndex, overIndex);
    setOrder(newOrder);
    onReorder({ orderedIds: newOrder });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleReorder}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <AnimatedList
          items={orderedItems.map((item) => ({
            id: item.id,
            label: item.label,
          }))}
          onItemSelect={onItemSelect}
          showGradients
          enableArrowNavigation
          displayScrollbar
          className={className}
          itemClassName={itemClassName}
        />
      </SortableContext>
    </DndContext>
  );
};

export default DraggableAnimatedList;

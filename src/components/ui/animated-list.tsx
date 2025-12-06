"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  MouseEventHandler,
  UIEvent,
} from "react";
import { motion, useInView } from "motion/react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type AnimatedListItem = {
  id: string;
  label: string;
};

interface BaseAnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const BaseAnimatedItem: React.FC<BaseAnimatedItemProps> = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      className="mb-4 cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

type SortableWrapperProps = {
  id: string;
  children: ReactNode;
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

interface AnimatedListProps {
  items?: string[] | AnimatedListItem[];
  onItemSelect?: (item: AnimatedListItem, index: number) => void;
  onReorder?: (orderedIds: string[]) => void;
  enableDrag?: boolean;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  items = ["Item 1", "Item 2", "Item 3"],
  onItemSelect,
  onReorder,
  enableDrag = false,
  showGradients = true,
  enableArrowNavigation = true,
  className = "",
  itemClassName = "",
  displayScrollbar = true,
  initialSelectedIndex = -1,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] =
    useState<number>(initialSelectedIndex);
  const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1);

  const baseItems: AnimatedListItem[] = Array.isArray(items)
    ? typeof items[0] === "string"
      ? (items as string[]).map((label, index) => ({
          id: String(index),
          label,
        }))
      : (items as AnimatedListItem[])
    : [];

  const [order, setOrder] = useState<string[]>(baseItems.map((i) => i.id));

  const orderedItems = order
    .map((id) => baseItems.find((i) => i.id === id))
    .filter((i): i is AnimatedListItem => i !== undefined);

  const handleItemMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleItemClick = useCallback(
    (item: AnimatedListItem, index: number) => {
      setSelectedIndex(index);
      if (onItemSelect) onItemSelect(item, index);
    },
    [onItemSelect],
  );

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } =
      e.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1),
    );
  };

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, orderedItems.length - 1));
      } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0 && selectedIndex < orderedItems.length) {
          e.preventDefault();
          if (onItemSelect) {
            onItemSelect(orderedItems[selectedIndex], selectedIndex);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [orderedItems, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    if (selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(
      `[data-index="${selectedIndex}"]`,
    ) as HTMLElement | null;
    if (!selectedItem) return;

    const extraMargin = 50;
    const containerScrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const itemTop = selectedItem.offsetTop;
    const itemBottom = itemTop + selectedItem.offsetHeight;

    if (itemTop < containerScrollTop + extraMargin) {
      container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" });
    } else if (
      itemBottom >
      containerScrollTop + containerHeight - extraMargin
    ) {
      container.scrollTo({
        top: itemBottom - containerHeight + extraMargin,
      });
    }
  }, [selectedIndex]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const handleReorder = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const activeIndex = order.indexOf(String(active.id));
    const overIndex = order.indexOf(String(over.id));
    if (activeIndex === -1 || overIndex === -1) return;

    const newOrder = arrayMove(order, activeIndex, overIndex);
    setOrder(newOrder);
    if (onReorder) onReorder(newOrder);
  };

  const content = (
    <div
      ref={listRef}
      className={`max-h-[400px] overflow-y-auto p-4 ${
        displayScrollbar
          ? "[&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#060010] [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-thumb]:rounded-[4px]"
          : "scrollbar-hide"
      }`}
      onScroll={handleScroll}
      style={{
        scrollbarWidth: displayScrollbar ? "thin" : "none",
        scrollbarColor: "#222 #060010",
      }}
    >
      {orderedItems.map((item, index) => {
        const inner = (
          <BaseAnimatedItem
            key={item.id}
            index={index}
            delay={0.1}
            onMouseEnter={() => handleItemMouseEnter(index)}
            onClick={() => handleItemClick(item, index)}
          >
            <div
              className={`p-4 bg-[#111] rounded-lg ${
                selectedIndex === index ? "bg-[#222]" : ""
              } ${itemClassName}`}
            >
              <p className="m-0 text-white">{item.label}</p>
            </div>
          </BaseAnimatedItem>
        );

        if (!enableDrag) return inner;

        return (
          <SortableWrapper key={item.id} id={item.id}>
            {inner}
          </SortableWrapper>
        );
      })}
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {enableDrag ? (
        <DndContext sensors={sensors} onDragEnd={handleReorder}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            {content}
          </SortableContext>
        </DndContext>
      ) : (
        content
      )}
      {showGradients && (
        <>
          <div
            className="pointer-events-none absolute left-0 right-0 top-0 h-[50px] bg-gradient-to-b from-[#060010] to-transparent transition-opacity duration-300 ease"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-[#060010] to-transparent transition-opacity duration-300 ease"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  );
};

export default AnimatedList;

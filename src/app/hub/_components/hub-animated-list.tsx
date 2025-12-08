"use client";

import React, {
  useRef,
  useState,
  useCallback,
  ReactNode,
  MouseEventHandler,
  UIEvent,
  useMemo,
} from "react";
import { motion, useInView } from "motion/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RiDragMove2Fill } from "react-icons/ri";

export type HubAnimatedListItem = {
  id: string;
  label: string;
};

interface BaseAnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: MouseEventHandler<HTMLDivElement>;
}

const BaseAnimatedItem: React.FC<BaseAnimatedItemProps> = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
  onDoubleClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.1, once: true });

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      initial={{ y: 20, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
      transition={{
        duration: 0.3,
        delay,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      className="cursor-default"
    >
      {children}
    </motion.div>
  );
};

type SortableWrapperProps = {
  id: string;
  children: ReactNode;
  enabled: boolean;
};

function SortableWrapper({ id, children, enabled }: SortableWrapperProps) {
  const { setNodeRef, transform, transition } = useSortable({ id });

  if (!enabled) return <>{children}</>;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {children}
    </div>
  );
}

type DragHandleProps = {
  id: string;
  enabled: boolean;
};

function DragHandle({ id, enabled }: DragHandleProps) {
  const { attributes, listeners } = useSortable({ id });

  if (!enabled) return null;

  return (
    <button
      type="button"
      {...attributes}
      {...listeners}
      className="absolute right-3 top-3 z-10 cursor-grab rounded-md bg-zinc-900/50 p-1.5 text-zinc-400 opacity-0 backdrop-blur-sm transition hover:bg-zinc-800 hover:text-zinc-100 group-hover:opacity-100"
    >
      <RiDragMove2Fill className="h-4 w-4" />
    </button>
  );
}

interface HubAnimatedListProps {
  items?: string[] | HubAnimatedListItem[];
  onItemSelect?: (_item: HubAnimatedListItem, _index: number) => void;
  onItemDoubleClick?: (_item: HubAnimatedListItem, _index: number) => void;
  enableDrag?: boolean;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  layout?: "list" | "grid";
  renderItem?: (_item: HubAnimatedListItem, _index: number) => ReactNode;
}

export const HubAnimatedList: React.FC<HubAnimatedListProps> = ({
  items = [],
  onItemSelect,
  onItemDoubleClick,
  enableDrag = false,
  showGradients = true,
  enableArrowNavigation: _enableArrowNavigation,
  className = "",
  itemClassName = "",
  displayScrollbar = true,
  initialSelectedIndex: _initialSelectedIndex,
  layout = "list",
  renderItem,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1);

  const displayItems: HubAnimatedListItem[] = useMemo(() => {
    if (!Array.isArray(items)) return [];
    if (typeof items[0] === "string") {
      return (items as string[]).map((label, index) => ({
        id: String(index),
        label,
      }));
    }
    return items as HubAnimatedListItem[];
  }, [items]);

  const handleItemMouseEnter = useCallback((_index: number) => {
    //
  }, []);

  const handleItemClick = useCallback(
    (item: HubAnimatedListItem, index: number) => {
      if (onItemSelect) onItemSelect(item, index);
    },
    [onItemSelect],
  );

  const handleItemDouble = useCallback(
    (item: HubAnimatedListItem, index: number) => {
      if (onItemDoubleClick) onItemDoubleClick(item, index);
    },
    [onItemDoubleClick],
  );

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (layout === "grid") return;
    const { scrollTop, scrollHeight, clientHeight } =
      e.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1),
    );
  };

  const listStyles =
    layout === "list"
      ? `max-h-[600px] overflow-y-auto p-1 ${displayScrollbar ? "[&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full" : "scrollbar-hide"}`
      : "columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 pb-20";

  return (
    <div className={`relative ${className}`}>
      <div ref={listRef} className={listStyles} onScroll={handleScroll}>
        {displayItems.map((item, index) => (
          <SortableWrapper key={item.id} id={item.id} enabled={enableDrag}>
            <div
              className={`group relative ${layout === "grid" ? "break-inside-avoid mb-6" : "mb-3"}`}
            >
              <BaseAnimatedItem
                index={index}
                delay={0.05 * (index % 10)}
                onMouseEnter={() => handleItemMouseEnter(index)}
                onClick={() => handleItemClick(item, index)}
                onDoubleClick={() => handleItemDouble(item, index)}
              >
                <div className={`${itemClassName}`}>
                  {renderItem ? (
                    renderItem(item, index)
                  ) : (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-zinc-200">
                      {item.label}
                    </div>
                  )}
                </div>
              </BaseAnimatedItem>
              <DragHandle id={item.id} enabled={enableDrag} />
            </div>
          </SortableWrapper>
        ))}
      </div>

      {layout === "list" && showGradients && (
        <>
          <div
            className="pointer-events-none absolute left-0 right-0 top-0 h-12 bg-gradient-to-b from-[#050509] to-transparent transition-opacity duration-300"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050509] to-transparent transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  );
};

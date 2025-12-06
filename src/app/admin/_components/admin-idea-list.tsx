"use client";

import AnimatedList from "@/components/ui/animated-list";
import { FOLDERS, MOCK_IDEAS, type IdeaStatus } from "@/lib/mock-data";

type AdminIdeaListProps = {
  activeStatus: IdeaStatus;
  selectAction: (_: { item: string; index: number }) => void;
};

export function AdminIdeaList({
  activeStatus,
  selectAction,
}: AdminIdeaListProps) {
  const ideas = MOCK_IDEAS[activeStatus];

  const folder = FOLDERS.find((f) => f.id === activeStatus);
  const label = folder?.label ?? "Espace";
  const color = folder?.color ?? "#52525b";

  return (
    <div className="col-span-5 px-2">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <span
            className="inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          {label}
        </h2>
        <div className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] text-zinc-500">
          Filtre mock: aucun
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-900 bg-[#060010]">
        <AnimatedList
          items={ideas}
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

"use client";

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

type SidebarFolderColorMenuProps = {
  onColorChangeAction: (_: string) => void;
};

export function SidebarFolderColorMenu({
  onColorChangeAction,
}: SidebarFolderColorMenuProps) {
  return (
    <div className="mt-2 rounded-2xl border border-zinc-800 bg-[#050509] px-2 py-2 text-[9px] text-zinc-400 shadow-xl">
      <div className="mb-1 px-1 text-[9px] uppercase tracking-[0.16em] text-zinc-500">
        Palette
      </div>
      <div className="grid grid-cols-6 gap-1">
        {PALETTE_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorChangeAction(color)}
            className="h-4 w-4 rounded-full border border-zinc-800 hover:scale-110"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}

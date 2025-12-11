"use client";

import { FaPlus } from "react-icons/fa6";
import type { AdminIdeaBullet } from "../use-admin-ideas";

type IdeaBulletsEditorProps = {
  bullets: AdminIdeaBullet[];
  onChange: (_: AdminIdeaBullet[]) => void;
};

function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function IdeaBulletsEditor({
  bullets,
  onChange,
}: IdeaBulletsEditorProps) {
  const handleAdd = () => {
    onChange([...bullets, { id: genId("bullet"), text: "" }]);
  };

  const handleChange = (id: string, text: string) => {
    onChange(bullets.map((b) => (b.id === id ? { ...b, text } : b)));
  };

  const handleRemove = (id: string) => {
    onChange(bullets.filter((b) => b.id !== id));
  };

  return (
    <div className="rounded-2xl border border-zinc-900 bg-[#050012] px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Points clés
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1 text-[11px] text-zinc-200 transition hover:bg-zinc-800"
        >
          <FaPlus className="h-3 w-3" />
          <span>Ajouter un point</span>
        </button>
      </div>
      <div className="space-y-2">
        {bullets.map((bullet) => (
          <div key={bullet.id} className="flex items-center gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-zinc-500" />
            <input
              type="text"
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 focus:border-[#5227FF] focus:outline-none"
              value={bullet.text}
              onChange={(e) => handleChange(bullet.id, e.target.value)}
              placeholder="Point important, hypothèse, KPI, etc."
            />
            <button
              type="button"
              onClick={() => handleRemove(bullet.id)}
              className="rounded-full px-2 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100"
            >
              ×
            </button>
          </div>
        ))}
        {bullets.length === 0 && (
          <div className="text-[11px] text-zinc-500">
            Utilise ce bloc pour les bullets principaux à remonter à
            l&apos;équipe.
          </div>
        )}
      </div>
    </div>
  );
}

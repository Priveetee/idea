"use client";

import { useState } from "react";
import type { AdminIdeaStatus } from "../use-admin-ideas";

type IdeaCreationModalProps = {
  activeStatus: AdminIdeaStatus;
  closeAction: () => void;
  createAction: (_: { label: string; status: AdminIdeaStatus }) => void;
};

export function IdeaCreationModal({
  activeStatus,
  closeAction,
  createAction,
}: IdeaCreationModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [draftTitle, setDraftTitle] = useState("");
  const [impact, setImpact] = useState<"" | "faible" | "moyen" | "fort">("");
  const [complexity, setComplexity] = useState<
    "" | "faible" | "moyenne" | "forte"
  >("");
  const [tag, setTag] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setStep(1);
    setDraftTitle("");
    setImpact("");
    setComplexity("");
    setTag("");
    setError("");
    closeAction();
  };

  const handleNextFromTitle = () => {
    const raw = draftTitle.trim();
    if (!raw) {
      setError("Ajoute au moins un titre à ton idée.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleCreate = () => {
    const raw = draftTitle.trim();
    if (!raw) {
      setError("Ajoute au moins un titre à ton idée.");
      setStep(1);
      return;
    }

    const parts: string[] = [raw];

    const meta: string[] = [];
    if (impact) meta.push(`Impact: ${impact}`);
    if (complexity) meta.push(`Complexité: ${complexity}`);
    if (tag.trim()) meta.push(`Tag: ${tag.trim()}`);

    if (meta.length > 0) {
      parts.push(`(${meta.join(" · ")})`);
    }

    const base = parts.join(" ");
    let finalLabel = base;
    if (!raw.startsWith("[T")) {
      const tgiNumber = String(Math.floor(Math.random() * 9000000) + 1000000);
      finalLabel = `[T${tgiNumber}] ${base}`;
    }

    createAction({ label: finalLabel, status: activeStatus });
    reset();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-[#050509] px-8 py-7 text-sm text-zinc-100 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Nouvelle idée
          </span>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <span className={step === 1 ? "text-zinc-100" : ""}>1. Titre</span>
            <span>·</span>
            <span className={step === 2 ? "text-zinc-100" : ""}>
              2. Options
            </span>
          </div>
        </div>
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-[12px] text-zinc-300">Titre</div>
              <textarea
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Décris rapidement ton idée..."
                className="min-h-20 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-[13px] text-zinc-100 outline-none focus:border-[#5227FF]"
              />
              {error && <div className="text-[11px] text-red-400">{error}</div>}
              <p className="text-[11px] text-zinc-500">
                Exemple: &quot;Mettre en place un onboarding plus court et plus
                clair pour les nouveaux arrivants&quot;.
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={reset}
                className="rounded-md px-3 py-1 text-[11px] text-zinc-500 hover:text-zinc-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleNextFromTitle}
                className="rounded-md bg-[#5227FF] px-4 py-1 text-[11px] font-medium text-white"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 text-[11px] text-zinc-300">
              <div className="space-y-2">
                <div className="text-zinc-500">Impact (optionnel)</div>
                <div className="flex flex-wrap gap-2">
                  {["faible", "moyen", "fort"].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setImpact((prev) =>
                          prev === value ? "" : (value as typeof impact),
                        )
                      }
                      className={`rounded-full px-3 py-1 ${
                        impact === value
                          ? "bg-[#5227FF] text-white"
                          : "bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-zinc-500">Complexité (optionnel)</div>
                <div className="flex flex-wrap gap-2">
                  {["faible", "moyenne", "forte"].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setComplexity((prev) =>
                          prev === value ? "" : (value as typeof complexity),
                        )
                      }
                      className={`rounded-full px-3 py-1 ${
                        complexity === value
                          ? "bg-[#5227FF] text-white"
                          : "bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-[11px] text-zinc-500">
                Tag libre (optionnel)
              </div>
              <input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Ex: RH, Tech, Support..."
                className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-[12px] text-zinc-100 outline-none focus:border-[#5227FF]"
              />
            </div>
            <div className="mt-2 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="rounded-md px-3 py-1 text-[11px] text-zinc-500 hover:text-zinc-200"
              >
                Retour
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-md px-3 py-1 text-[11px] text-zinc-500 hover:text-zinc-200"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="rounded-md bg-[#5227FF] px-4 py-1 text-[11px] font-medium text-white"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

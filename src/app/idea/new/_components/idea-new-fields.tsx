"use client";

import type { KeyboardEvent } from "react";

type FieldErrors = {
  tgi?: string;
  title?: string;
};

type IdeaNewFieldsProps = {
  tgi: string;
  setTgi: (_: string) => void;
  title: string;
  setTitle: (_: string) => void;
  description: string;
  setDescription: (_: string) => void;
  impact: "" | "faible" | "moyen" | "fort";
  setImpact: (_: "" | "faible" | "moyen" | "fort") => void;
  complexity: "" | "faible" | "moyenne" | "forte";
  setComplexity: (_: "" | "faible" | "moyenne" | "forte") => void;
  tag: string;
  setTag: (_: string) => void;
  fieldError: FieldErrors;
  error: string | null;
  submitting: boolean;
  titleLength: number;
  titleTooLong: boolean;
  onSubmit: () => void;
  onTitleKeyDown: (_: KeyboardEvent<HTMLTextAreaElement>) => void;
  onDescriptionKeyDown: (_: KeyboardEvent<HTMLTextAreaElement>) => void;
};

export function IdeaNewFields({
  tgi,
  setTgi,
  title,
  setTitle,
  description,
  setDescription,
  impact,
  setImpact,
  complexity,
  setComplexity,
  tag,
  setTag,
  fieldError,
  error,
  submitting,
  titleLength,
  titleTooLong,
  onSubmit,
  onTitleKeyDown,
  onDescriptionKeyDown,
}: IdeaNewFieldsProps) {
  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Nouvelle idée TGI
          </div>
          <div className="mt-1 text-[13px] text-zinc-400">
            Décrivez votre idée en quelques minutes, le reste se fera dans
            l&apos;espace d&apos;administration.
          </div>
        </div>
        <div className="hidden items-center gap-2 text-[10px] text-zinc-500 md:flex">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
          <span>1. Identifiant &amp; titre</span>
          <span className="opacity-50">·</span>
          <span className="opacity-70">2. Détails (optionnel)</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-zinc-300">Identifiant TGI</div>
              {fieldError.tgi && (
                <span className="text-[10px] text-red-400">
                  {fieldError.tgi}
                </span>
              )}
            </div>
            <input
              value={tgi}
              onChange={(e) => setTgi(e.target.value.toUpperCase())}
              placeholder="T0000001"
              className={`h-9 w-full rounded-xl border bg-zinc-950 px-3 text-[13px] text-zinc-100 outline-none ${
                fieldError.tgi
                  ? "border-red-500 focus:border-red-500"
                  : "border-zinc-700 focus:border-[#5227FF]"
              }`}
            />
            <p className="text-[11px] text-zinc-500">
              Format&nbsp;: T + 7 chiffres. Si vous ne le connaissez pas, votre
              manager pourra le compléter plus tard.
            </p>
          </div>
          <div className="col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-zinc-300">Titre</div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] ${
                    titleTooLong ? "text-red-400" : "text-zinc-500"
                  }`}
                >
                  {titleLength}/200
                </span>
                {fieldError.title && (
                  <span className="text-[10px] text-red-400">
                    {fieldError.title}
                  </span>
                )}
              </div>
            </div>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={onTitleKeyDown}
              maxLength={250}
              placeholder="En une phrase : quelle est votre idée, pour qui et pourquoi ?"
              className={`h-[84px] w-full rounded-xl border bg-zinc-950 px-3 py-2 text-[13px] text-zinc-100 outline-none ${
                fieldError.title
                  ? "border-red-500 focus:border-red-500"
                  : "border-zinc-700 focus:border-[#5227FF]"
              }`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[12px] text-zinc-300">Détails (optionnel)</div>
          <textarea
            id="idea-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={onDescriptionKeyDown}
            placeholder="Ajoutez du contexte : pourquoi maintenant, quelles observations, quels exemples, quelles contraintes..."
            className="h-28 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-[13px] text-zinc-100 outline-none focus:border-[#5227FF]"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 text-[11px] text-zinc-300">
          <div className="space-y-2">
            <div className="text-zinc-400">Impact (optionnel)</div>
            <div className="flex flex-wrap gap-2">
              {["faible", "moyen", "fort"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setImpact(impact === value ? "" : (value as typeof impact))
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
            <div className="text-zinc-400">Complexité (optionnel)</div>
            <div className="flex flex-wrap gap-2">
              {["faible", "moyenne", "forte"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setComplexity(
                      complexity === value ? "" : (value as typeof complexity),
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
          <div className="space-y-2">
            <div className="text-zinc-400">Tag (optionnel)</div>
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Ex : RH, Tech, Support..."
              className="h-9 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-[12px] text-zinc-100 outline-none focus:border-[#5227FF]"
            />
          </div>
        </div>

        {error && <div className="text-[11px] text-red-400">{error}</div>}

        <div className="mt-2 flex justify-end gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-md px-3 py-1 text-zinc-500 hover:text-zinc-200"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className={`rounded-md px-4 py-1 font-medium text-white transition ${
              submitting
                ? "cursor-wait bg-[#3f21c9]"
                : "bg-[#5227FF] hover:bg-[#3f21c9]"
            }`}
          >
            Envoyer l&apos;idée
          </button>
        </div>
      </div>
    </>
  );
}

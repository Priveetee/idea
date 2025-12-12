"use client";

import type { KeyboardEvent, RefObject } from "react";
import { getLinkMeta } from "@/lib/link-icons";

type IdeaLink = {
  id: string;
  label: string;
  url: string;
};

type FieldErrors = {
  tgi?: string;
  title?: string;
};

type IdeaNewFieldsProps = {
  tgi: string;
  setTgi: (_value: string) => void;
  title: string;
  setTitle: (_value: string) => void;
  titleRef: RefObject<HTMLTextAreaElement | null>;
  description: string;
  setDescription: (_value: string) => void;
  impact: "" | "faible" | "moyen" | "fort";
  setImpact: (_value: "" | "faible" | "moyen" | "fort") => void;
  complexity: "" | "faible" | "moyenne" | "forte";
  setComplexity: (_value: "" | "faible" | "moyenne" | "forte") => void;
  tag: string;
  setTag: (_value: string) => void;
  links: IdeaLink[];
  linkDraft: string;
  setLinkDraft: (_value: string) => void;
  addLink: () => void;
  removeLink: (_id: string) => void;
  fieldError: FieldErrors;
  error: string | null;
  submitting: boolean;
  titleLength: number;
  titleTooLong: boolean;
  isFormRoughlyValid: boolean;
  onSubmit: () => void;
  onTitleKeyDown: (_event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onDescriptionKeyDown: (_event: KeyboardEvent<HTMLTextAreaElement>) => void;
};

export function IdeaNewFields({
  tgi,
  setTgi,
  title,
  setTitle,
  titleRef,
  description,
  setDescription,
  impact,
  setImpact,
  complexity,
  setComplexity,
  tag,
  setTag,
  links,
  linkDraft,
  setLinkDraft,
  addLink,
  removeLink,
  fieldError,
  error,
  submitting,
  titleLength,
  titleTooLong,
  isFormRoughlyValid,
  onSubmit,
  onTitleKeyDown,
  onDescriptionKeyDown,
}: IdeaNewFieldsProps) {
  return (
    <>
      <div className="mb-5">
        <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">
          Nouvelle idée
        </div>
        <div className="mt-1 text-[13px] text-zinc-400">
          Décrivez votre idée en quelques minutes, nous ferons le reste dans
          l&apos;espace d&apos;administration.
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 space-y-1.5">
            <div className="text-[12px] text-zinc-300">Identifiant TGI</div>
            <input
              value={tgi}
              onChange={(e) => setTgi(e.target.value)}
              placeholder="T0000001"
              className={`h-9 w-full rounded-xl border bg-zinc-950 px-3 text-[13px] text-zinc-100 outline-none ${
                fieldError.tgi
                  ? "border-red-500 focus:border-red-500"
                  : "border-zinc-700 focus:border-[#5227FF]"
              }`}
            />
            {fieldError.tgi ? (
              <div className="text-[10px] text-red-400">{fieldError.tgi}</div>
            ) : (
              <p className="text-[11px] text-zinc-500">
                Veuillez saisir votre identifiant TGI.
              </p>
            )}
          </div>

          <div className="col-span-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-zinc-300">Titre</div>
              <span
                className={`text-[10px] ${
                  titleTooLong ? "text-red-400" : "text-zinc-500"
                }`}
              >
                {titleLength}/200
              </span>
            </div>
            <textarea
              ref={titleRef}
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
            {fieldError.title && (
              <div className="text-[10px] text-red-400">{fieldError.title}</div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[12px] text-zinc-300">Détails (optionnel)</div>
          <textarea
            id="idea-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={onDescriptionKeyDown}
            placeholder="Par exemple : « Nous perdons 2 jours à chaque onboarding développeur. Voir ce guide interne https://intranet/guide-onboarding-dev et cette vidéo https://youtube.com/... »."
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

        <div className="space-y-2">
          <div className="text-[12px] text-zinc-300">Liens (optionnels)</div>
          <div className="flex gap-2">
            <input
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              placeholder="Collez un lien : GitHub, article, vidéo, outil..."
              className="h-9 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-[12px] text-zinc-100 outline-none focus:border-[#5227FF]"
            />
            <button
              type="button"
              onClick={addLink}
              className="h-9 rounded-xl bg-[#1f2937] px-3 text-[11px] text-zinc-100 hover:bg-[#111827]"
            >
              Ajouter
            </button>
          </div>

          {links.length > 0 && (
            <div className="mt-2 space-y-1 rounded-xl border border-zinc-800 bg-zinc-950/60 px-2 py-2">
              {links.map((link) => {
                const meta = getLinkMeta(link.url);
                const Icon = meta.icon;

                let host = "";
                try {
                  host = new URL(link.url).hostname.replace(/^www\./i, "");
                } catch {
                  host = link.url;
                }

                return (
                  <div
                    key={link.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1 text-[11px] text-zinc-200 hover:bg-zinc-900/80"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      <span className="shrink-0 text-zinc-100">
                        {meta.label}
                      </span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        title={link.url}
                        className="shrink-0 text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
                      >
                        {host}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLink(link.id)}
                      className="shrink-0 rounded-md px-2 py-0.5 text-[10px] text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100"
                    >
                      Retirer
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {error && <div className="text-[11px] text-zinc-400">{error}</div>}

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
                : isFormRoughlyValid
                  ? "bg-[#5227FF] hover:bg-[#3f21c9]"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            Envoyer l&apos;idée
          </button>
        </div>
      </div>
    </>
  );
}

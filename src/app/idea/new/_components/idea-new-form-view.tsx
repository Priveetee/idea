"use client";

import type { RefObject, KeyboardEvent } from "react";
import type { IdeaLink } from "@/lib/mock-data";
import { IdeaNewFields } from "./idea-new-fields";
import { RichPreviewText } from "./rich-preview-text";
import { getLinkMeta } from "@/lib/link-icons";

type IdeaNewFormViewProps = {
  tgi: string;
  title: string;
  description: string;
  impact: "" | "faible" | "moyen" | "fort";
  complexity: "" | "faible" | "moyenne" | "forte";
  tag: string;
  links: IdeaLink[];
  linkDraft: string;
  setTgi: (_value: string) => void;
  setTitle: (_value: string) => void;
  setDescription: (_value: string) => void;
  setImpact: (_value: "" | "faible" | "moyen" | "fort") => void;
  setComplexity: (_value: "" | "faible" | "moyenne" | "forte") => void;
  setTag: (_value: string) => void;
  setLinkDraft: (_value: string) => void;
  addLink: () => void;
  removeLink: (_id: string) => void;
  fieldError: { tgi?: string; title?: string };
  error: string | null;
  submitting: boolean;
  isFormRoughlyValid: boolean;
  titleLength: number;
  titleTooLong: boolean;
  onSubmit: () => void;
  onTitleKeyDown: (_e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onDescriptionKeyDown: (_e: KeyboardEvent<HTMLTextAreaElement>) => void;
  titleRef: RefObject<HTMLTextAreaElement | null>;
  previewTitle: string;
  previewMetaParts: string[];
  hasAnyMeta: boolean;
};

export function IdeaNewFormView(props: IdeaNewFormViewProps) {
  const {
    tgi,
    title,
    description,
    impact,
    complexity,
    tag,
    links,
    linkDraft,
    setTgi,
    setTitle,
    setDescription,
    setImpact,
    setComplexity,
    setTag,
    setLinkDraft,
    addLink,
    removeLink,
    fieldError,
    error,
    submitting,
    isFormRoughlyValid,
    titleLength,
    titleTooLong,
    onSubmit,
    onTitleKeyDown,
    onDescriptionKeyDown,
    titleRef,
    previewTitle,
    previewMetaParts,
    hasAnyMeta,
  } = props;

  const hasMeta = previewMetaParts.length > 0;

  return (
    <div className="flex w-full max-w-5xl gap-8 px-6 py-10">
      <div className="flex-1 rounded-3xl border border-zinc-900 bg-[#060010] px-8 py-7 text-sm shadow-[0_0_40px_rgba(0,0,0,0.45)]">
        <IdeaNewFields
          tgi={tgi}
          setTgi={setTgi}
          title={title}
          setTitle={setTitle}
          titleRef={titleRef}
          description={description}
          setDescription={setDescription}
          impact={impact}
          setImpact={setImpact}
          complexity={complexity}
          setComplexity={setComplexity}
          tag={tag}
          setTag={setTag}
          links={links}
          linkDraft={linkDraft}
          setLinkDraft={setLinkDraft}
          addLink={addLink}
          removeLink={removeLink}
          fieldError={fieldError}
          error={error}
          submitting={submitting}
          titleLength={titleLength}
          titleTooLong={titleTooLong}
          isFormRoughlyValid={isFormRoughlyValid}
          onSubmit={onSubmit}
          onTitleKeyDown={onTitleKeyDown}
          onDescriptionKeyDown={onDescriptionKeyDown}
        />
      </div>

      <div className="hidden w-[40%] flex-col rounded-3xl border border-zinc-900 bg-[#060010] px-6 py-5 text-[13px] text-zinc-200 shadow-[0_0_40px_rgba(0,0,0,0.5)] md:flex">
        <div className="mb-3 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
          Aperçu dans l&apos;Inbox
        </div>

        <div className="rounded-xl bg-[#111] px-3 py-3 text-[13px] text-zinc-100">
          <div>{previewTitle}</div>
          {hasMeta && (
            <div className="mt-2 max-w-full">
              <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full bg-zinc-900 px-3 py-1 text-[11px] text-zinc-300">
                {previewMetaParts.map((part, index) => (
                  <span key={`${part}-${index}`} className="flex items-center">
                    {index > 0 && (
                      <span className="mx-1 select-none text-zinc-600">·</span>
                    )}
                    <span className="max-w-[220px] truncate" title={part}>
                      {part}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {description.trim() ? (
            <RichPreviewText text={description} />
          ) : (
            <div className="text-[11px] text-zinc-500">
              Par exemple&nbsp;: « Nous perdons 2 jours à chaque onboarding
              développeur. Voir ce guide interne
              https://intranet/guide-onboarding-dev et cette vidéo
              https://youtube.com/... ».
            </div>
          )}
        </div>

        {links.length > 0 && (
          <div className="mt-4 space-y-1 rounded-xl border border-zinc-800 bg-zinc-950/60 px-2 py-2">
            <div className="mb-1 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
              Liens de support
            </div>
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
                  className="flex items-center gap-2 rounded-lg px-2 py-1 text-[11px] text-zinc-200"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  <span className="shrink-0 text-zinc-100">{meta.label}</span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    title={link.url}
                    className="max-w-[180px] truncate text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
                  >
                    {host}
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {!hasAnyMeta && (
          <div className="mt-4 text-[11px] text-zinc-500">
            Vous pouvez ajouter un impact, une complexité ou un tag pour aider
            votre manager à prioriser.
          </div>
        )}
        {hasAnyMeta && (
          <div className="mt-4 text-[11px] text-zinc-500">
            Ces informations seront visibles dans l&apos;Inbox admin.
          </div>
        )}
      </div>
    </div>
  );
}

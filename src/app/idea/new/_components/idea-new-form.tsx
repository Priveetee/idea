"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useIdeaStore } from "@/app/admin/_providers/idea-store";
import type { IdeaItem, IdeaLink } from "@/lib/mock-data";
import { IdeaNewFields } from "./idea-new-fields";
import { RichPreviewText } from "./rich-preview-text";
import { getLinkMeta } from "@/lib/link-icons";

const ideaFormSchema = z.object({
  tgi: z
    .string()
    .regex(/^T[0-9]{7}$/, "Format attendu : T + 7 chiffres, ex : T0000001"),
  title: z.string().min(1, "Ajoutez au moins un titre à votre idée."),
  description: z.string().optional(),
  impact: z.enum(["faible", "moyen", "fort"]).optional(),
  complexity: z.enum(["faible", "moyenne", "forte"]).optional(),
  tag: z.string().optional(),
});

type IdeaFormValues = z.infer<typeof ideaFormSchema>;

function generateIdeaId(existing: IdeaItem[]): string {
  let i = existing.length + 1;
  while (existing.some((idea) => idea.id === String(i))) i += 1;
  return String(i);
}

function generateLinkId(existing: IdeaLink[]): string {
  let i = existing.length + 1;
  while (existing.some((link) => link.id === String(i))) i += 1;
  return String(i);
}

export function IdeaNewForm() {
  const router = useRouter();
  const { ideas, setIdeas } = useIdeaStore();

  const [tgi, setTgi] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState<"" | "faible" | "moyen" | "fort">("");
  const [complexity, setComplexity] = useState<
    "" | "faible" | "moyenne" | "forte"
  >("");
  const [tag, setTag] = useState("");

  const [links, setLinks] = useState<IdeaLink[]>([]);
  const [linkDraft, setLinkDraft] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<{
    tgi?: string;
    title?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement | null>(null);

  const isTgiRoughlyValid = /^T[0-9]{7}$/.test(tgi.trim());
  const isTitleRoughlyValid = title.trim().length > 0;
  const isFormRoughlyValid = isTgiRoughlyValid && isTitleRoughlyValid;

  const validate = (): IdeaFormValues | null => {
    const formValues: IdeaFormValues = {
      tgi: tgi.trim(),
      title: title.trim(),
      description: description.trim() || undefined,
      impact: impact || undefined,
      complexity: complexity || undefined,
      tag: tag.trim() || undefined,
    };

    const result = ideaFormSchema.safeParse(formValues);

    if (!result.success) {
      const issues = result.error.issues;
      const byPath: { tgi?: string; title?: string } = {};

      issues.forEach((issue) => {
        const path = issue.path[0];
        if (path === "tgi") byPath.tgi = issue.message;
        if (path === "title") byPath.title = issue.message;
      });

      setFieldError(byPath);
      setError(null);
      return null;
    }

    setFieldError({});
    setError(null);
    return result.data;
  };

  const handleSubmit = () => {
    const data = validate();
    if (!data) return;

    setSubmitting(true);

    const newId = generateIdeaId(ideas);

    const idea: IdeaItem = {
      id: newId,
      status: "INBOX",
      label: `[${data.tgi}] ${data.title}`,
      managerSummary: "",
      managerContent: data.description ?? "",
      managerLinks: links,
      managerBullets: [],
      managerNote: "",
    };

    setIdeas((prev) => [...prev, idea]);
    router.push(`/idea/${newId}`);
  };

  const handleTgiChange = (value: string) => {
    const upper = value.toUpperCase();
    setTgi(upper);
    const trimmed = upper.trim();
    if (/^T[0-9]{7}$/.test(trimmed) && !title.trim() && titleRef.current) {
      titleRef.current.focus();
    }
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const next = document.getElementById("idea-description");
      if (next) next.focus();
    }
  };

  const handleDescriptionKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAddLink = () => {
    const raw = linkDraft.trim();
    if (!raw) return;
    try {
      const url = new URL(raw).toString();
      const host = new URL(url).hostname.replace(/^www\./i, "");
      const label = host;
      const newId = generateLinkId(links);
      const link: IdeaLink = { id: newId, label, url };
      setLinks((prev) => [...prev, link]);
      setLinkDraft("");
    } catch {
      setError("L’URL du lien n’est pas valide.");
    }
  };

  const handleRemoveLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const previewTitle = (() => {
    const safeTgi = tgi || "TXXXXXXX";
    const base = title || "Titre de votre idée";
    return `[${safeTgi}] ${base}`;
  })();

  const previewMetaParts: string[] = [];
  if (impact) previewMetaParts.push(`Impact : ${impact}`);
  if (complexity) previewMetaParts.push(`Complexité : ${complexity}`);
  if (tag.trim()) previewMetaParts.push(`Tag : ${tag.trim()}`);

  const hasMeta = previewMetaParts.length > 0;

  const hasAnyMeta = impact || complexity || tag.trim();
  const titleLength = title.trim().length;
  const titleTooLong = titleLength > 200;

  return (
    <div className="flex w-full max-w-5xl gap-8 px-6 py-10">
      <div className="flex-1 rounded-3xl border border-zinc-900 bg-[#060010] px-8 py-7 text-sm shadow-[0_0_40px_rgba(0,0,0,0.45)]">
        <IdeaNewFields
          tgi={tgi}
          setTgi={handleTgiChange}
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
          addLink={handleAddLink}
          removeLink={handleRemoveLink}
          fieldError={fieldError}
          error={error}
          submitting={submitting}
          titleLength={titleLength}
          titleTooLong={titleTooLong}
          isFormRoughlyValid={isFormRoughlyValid}
          onSubmit={handleSubmit}
          onTitleKeyDown={handleTitleKeyDown}
          onDescriptionKeyDown={handleDescriptionKeyDown}
        />
      </div>

      <div className="hidden w-[40%] flex-col rounded-3xl border border-zinc-900 bg-[#060010] px-6 py-5 text-[13px] text-zinc-200 shadow-[0_0_40px_rgba(0,0,0,0.5)] md:flex">
        <div className="mb-3 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
          Aperçu dans l&apos;Inbox
        </div>

        <div className="rounded-xl bg-[#111] px-3 py-3 text-[13px] text-zinc-100">
          <div>{previewTitle}</div>
          {hasMeta && (
            <div className="mt-2 inline-flex flex-wrap items-center gap-1 rounded-full bg-zinc-900 px-3 py-1 text-[11px] text-zinc-300">
              {previewMetaParts.map((part, index) => (
                <span key={part}>
                  {index > 0 && <span className="mx-1 text-zinc-600">·</span>}
                  <span>{part}</span>
                </span>
              ))}
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
                    className="truncate text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
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

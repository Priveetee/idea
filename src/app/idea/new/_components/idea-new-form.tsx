"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useIdeaStore } from "@/app/admin/_providers/idea-store";
import type { IdeaItem, IdeaLink } from "@/lib/mock-data";
import { IdeaNewFields } from "./idea-new-fields";
import { RichPreviewText } from "./rich-preview-text";

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

    const metaParts: string[] = [];
    if (data.impact) metaParts.push(`Impact: ${data.impact}`);
    if (data.complexity) metaParts.push(`Complexité: ${data.complexity}`);
    if (data.tag) metaParts.push(`Tag: ${data.tag}`);

    const labelParts: string[] = [data.title];
    if (metaParts.length > 0) labelParts.push(`(${metaParts.join(" · ")})`);

    const baseLabel = labelParts.join(" ");
    const finalLabel = `[${data.tgi}] ${baseLabel}`;

    const newId = generateIdeaId(ideas);

    const idea: IdeaItem = {
      id: newId,
      status: "INBOX",
      label: finalLabel,
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
    setTgi(value.toUpperCase());
    const trimmed = value.toUpperCase().trim();
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

  const previewLabel = (() => {
    if (!tgi && !title) return "[TXXXXXXX] Titre de votre idée";
    const safeTgi = tgi || "T0000001";
    const base = title || "Titre de votre idée";

    const meta: string[] = [];
    if (impact) meta.push(`Impact: ${impact}`);
    if (complexity) meta.push(`Complexité: ${complexity}`);
    if (tag.trim()) meta.push(`Tag: ${tag.trim()}`);

    const parts: string[] = [base];
    if (meta.length > 0) parts.push(`(${meta.join(" · ")})`);

    return `[${safeTgi}] ${parts.join(" ")}`;
  })();

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
          {previewLabel}
        </div>

        <div className="mt-4 space-y-2">
          {description.trim() ? (
            <RichPreviewText text={description} />
          ) : (
            <div className="text-[11px] text-zinc-500">
              Par exemple&nbsp;: &quot;Nous perdons 2 jours à chaque onboarding
              développeur. Voir ce guide interne
              https://intranet/guide-onboarding-dev et cette vidéo
              https://youtube.com/...&quot;.
            </div>
          )}
        </div>

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

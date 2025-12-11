"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { IdeaNewFormView } from "./idea-new-form-view";

export type IdeaNewFormPayload = {
  tgi: string;
  title: string;
  description?: string;
  impact?: "faible" | "moyen" | "fort";
  complexity?: "faible" | "moyenne" | "forte";
  tag?: string;
  links: IdeaLink[];
};

type IdeaLink = {
  id: string;
  label: string;
  url: string;
};

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

function generateLinkId(existing: IdeaLink[]): string {
  let i = existing.length + 1;
  while (existing.some((link) => link.id === String(i))) i += 1;
  return String(i);
}

type IdeaNewFormStateProps = {
  onValidSubmit: (_payload: IdeaNewFormPayload) => void;
  submitting: boolean;
  externalError: string | null;
};

export function IdeaNewFormState({
  onValidSubmit,
  submitting,
  externalError,
}: IdeaNewFormStateProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const createIdea = trpc.idea.create.useMutation({
    async onSuccess() {
      await utils.idea.listPublic.invalidate();
      router.push("/hub");
    },
  });

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

  const titleRef = useRef<HTMLTextAreaElement | null>(null);

  const submittingLocal = createIdea.isPending || submitting;

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

    const payload: IdeaNewFormPayload = {
      tgi: data.tgi,
      title: data.title,
      description: data.description ?? undefined,
      impact: data.impact ?? undefined,
      complexity: data.complexity ?? undefined,
      tag: data.tag ?? undefined,
      links,
    };

    onValidSubmit(payload);
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

  const hasAnyMeta = impact || complexity || tag.trim();

  const titleLength = title.trim().length;
  const titleTooLong = titleLength > 200;

  return (
    <IdeaNewFormView
      tgi={tgi}
      title={title}
      description={description}
      impact={impact}
      complexity={complexity}
      tag={tag}
      links={links}
      linkDraft={linkDraft}
      setTgi={handleTgiChange}
      setTitle={setTitle}
      setDescription={setDescription}
      setImpact={setImpact}
      setComplexity={setComplexity}
      setTag={setTag}
      setLinkDraft={setLinkDraft}
      addLink={handleAddLink}
      removeLink={handleRemoveLink}
      fieldError={fieldError}
      error={error ?? externalError ?? createIdea.error?.message ?? null}
      submitting={submittingLocal}
      isFormRoughlyValid={isFormRoughlyValid}
      titleLength={titleLength}
      titleTooLong={titleTooLong}
      onSubmit={handleSubmit}
      onTitleKeyDown={handleTitleKeyDown}
      onDescriptionKeyDown={handleDescriptionKeyDown}
      titleRef={titleRef}
      previewTitle={previewTitle}
      previewMetaParts={previewMetaParts}
      hasAnyMeta={Boolean(hasAnyMeta)}
    />
  );
}

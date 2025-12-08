"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useIdeaStore } from "@/app/admin/_providers/idea-store";
import type { IdeaItem } from "@/lib/mock-data";

const ideaFormSchema = z.object({
  tgi: z
    .string()
    .regex(/^T[0-9]{7}$/, "Format attendu: T + 7 chiffres, ex: T0000001"),
  title: z.string().min(1, "Ajoute au moins un titre à ton idée."),
  description: z.string().optional(),
  impact: z.enum(["faible", "moyen", "fort"]).optional(),
  complexity: z.enum(["faible", "moyenne", "forte"]).optional(),
  tag: z.string().optional(),
});

type IdeaFormValues = z.infer<typeof ideaFormSchema>;

function generateIdeaId(existing: IdeaItem[]): string {
  let i = existing.length + 1;
  while (existing.some((idea) => idea.id === String(i))) {
    i += 1;
  }
  return String(i);
}

export default function NewIdeaPage() {
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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
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
      const msg =
        result.error.issues[0]?.message ?? "Vérifie les champs du formulaire.";
      setError(msg);
      return;
    }

    setError(null);
    setSubmitting(true);

    const { tgi: finalTgi, title: finalTitle } = result.data;
    const metaParts: string[] = [];

    if (result.data.impact) {
      metaParts.push(`Impact: ${result.data.impact}`);
    }
    if (result.data.complexity) {
      metaParts.push(`Complexité: ${result.data.complexity}`);
    }
    if (result.data.tag) {
      metaParts.push(`Tag: ${result.data.tag}`);
    }

    const labelParts: string[] = [finalTitle];
    if (metaParts.length > 0) {
      labelParts.push(`(${metaParts.join(" · ")})`);
    }

    const baseLabel = labelParts.join(" ");
    const finalLabel = `[${finalTgi}] ${baseLabel}`;

    const newId = generateIdeaId(ideas);

    const idea: IdeaItem = {
      id: newId,
      status: "INBOX",
      label: finalLabel,
      managerSummary: "",
      managerContent: result.data.description ?? "",
      managerLinks: [],
      managerBullets: [],
      managerNote: "",
    };

    setIdeas((prev) => [...prev, idea]);
    router.push(`/idea/${newId}`);
  };

  const previewLabel = (() => {
    if (!tgi && !title) return "[TXXXXXXX] Titre de ton idée";
    const safeTgi = tgi || "T0000001";
    const base = title || "Titre de ton idée";

    const meta: string[] = [];
    if (impact) meta.push(`Impact: ${impact}`);
    if (complexity) meta.push(`Complexité: ${complexity}`);
    if (tag.trim()) meta.push(`Tag: ${tag.trim()}`);

    const parts: string[] = [base];
    if (meta.length > 0) parts.push(`(${meta.join(" · ")})`);

    return `[${safeTgi}] ${parts.join(" ")}`;
  })();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050509] text-white">
      <div className="flex w-full max-w-5xl gap-8 px-6 py-10">
        <div className="flex-1 rounded-3xl border border-zinc-900 bg-[#060010] px-8 py-7 text-sm shadow-[0_0_40px_rgba(0,0,0,0.45)]">
          <div className="mb-5 text-xs uppercase tracking-[0.16em] text-zinc-500">
            Nouvelle idée TGI
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 space-y-2">
                <div className="text-[12px] text-zinc-300">Identifiant TGI</div>
                <input
                  value={tgi}
                  onChange={(e) => setTgi(e.target.value.toUpperCase())}
                  placeholder="T0000001"
                  className="h-9 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-[13px] text-zinc-100 outline-none focus:border-[#5227FF]"
                />
                <p className="text-[11px] text-zinc-500">
                  Format: T + 7 chiffres. Si tu ne le connais pas, laisse ton
                  manager le compléter plus tard.
                </p>
              </div>
              <div className="col-span-2 space-y-2">
                <div className="text-[12px] text-zinc-300">Titre</div>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="En une phrase: quelle est ton idée, pour qui, et pourquoi ?"
                  className="h-[84px] w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-[13px] text-zinc-100 outline-none focus:border-[#5227FF]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[12px] text-zinc-300">
                Détails (optionnel)
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Donne un peu plus de contexte: pourquoi maintenant, observations, exemples, contraintes..."
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
                <div className="text-zinc-400">Complexité (optionnel)</div>
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
              <div className="space-y-2">
                <div className="text-zinc-400">Tag (optionnel)</div>
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Ex: RH, Tech, Support..."
                  className="h-9 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-[12px] text-zinc-100 outline-none focus:border-[#5227FF]"
                />
              </div>
            </div>

            {error && <div className="text-[11px] text-red-400">{error}</div>}

            <div className="mt-2 flex justify-end gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-md px-3 py-1 text-zinc-500 hover:text-zinc-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className={`rounded-md px-4 py-1 font-medium text-white ${
                  submitting
                    ? "cursor-wait bg-[#3f21c9]"
                    : "bg-[#5227FF] hover:bg-[#3f21c9]"
                }`}
              >
                Envoyer l&apos;idée
              </button>
            </div>
          </div>
        </div>

        <div className="hidden w-[40%] flex-col rounded-3xl border border-zinc-900 bg-[#060010] px-6 py-5 text-[13px] text-zinc-200 shadow-[0_0_40px_rgba(0,0,0,0.5)] md:flex">
          <div className="mb-3 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
            Aperçu dans l&apos;Inbox
          </div>
          <div className="rounded-xl bg-[#111] px-3 py-3 text-[13px] text-zinc-100">
            {previewLabel}
          </div>
          <div className="mt-4 text-[11px] text-zinc-500">
            C&apos;est ainsi que ton idée apparaîtra dans l&apos;Inbox admin
            TGI.
          </div>
        </div>
      </div>
    </div>
  );
}

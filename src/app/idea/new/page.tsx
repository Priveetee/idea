"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useIdeaStore } from "@/app/admin/_providers/idea-store";
import type { IdeaItem } from "@/lib/mock-data";

const schema = z.object({
  tgi: z
    .string()
    .regex(/^T[0-9]{7}$/, "Format attendu: T + 7 chiffres, ex: T0000001"),
  title: z.string().min(1, "Ajoute au moins un titre à ton idée."),
});

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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const result = schema.safeParse({ tgi: tgi.trim(), title: title.trim() });
    if (!result.success) {
      const msg =
        result.error.issues[0]?.message ?? "Vérifie les champs du formulaire.";
      setError(msg);
      return;
    }

    const { tgi: tgiValue, title: titleValue } = result.data;

    const newId = generateIdeaId(ideas);
    const finalLabel = `[${tgiValue}] ${titleValue}`;

    const idea: IdeaItem = {
      id: newId,
      status: "INBOX",
      label: finalLabel,
      managerSummary: "",
      managerContent: "",
      managerLinks: [],
      managerBullets: [],
      managerNote: "",
    };

    setIdeas((prev) => [...prev, idea]);
    router.push(`/idea/${newId}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050509] text-white">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#050509] px-8 py-7 text-sm text-zinc-100 shadow-xl">
        <div className="mb-4 text-xs uppercase tracking-[0.16em] text-zinc-500">
          Proposer une nouvelle idée
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-[12px] text-zinc-300">Identifiant TGI</div>
            <input
              value={tgi}
              onChange={(e) => setTgi(e.target.value.toUpperCase())}
              placeholder="T0000001"
              className="h-9 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-[13px] text-zinc-100 outline-none focus:border-[#5227FF]"
            />
            <p className="text-[11px] text-zinc-500">
              Format: T + 7 chiffres. Cet identifiant est utilisé en interne.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] text-zinc-300">
              Titre de l&apos;idée
            </div>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Décris rapidement ton idée..."
              className="min-h-24 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-[13px] text-zinc-100 outline-none focus:border-[#5227FF]"
            />
          </div>

          {error && <div className="text-[11px] text-red-400">{error}</div>}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-md px-3 py-1 text-[11px] text-zinc-500 hover:text-zinc-200"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-md bg-[#5227FF] px-4 py-1 text-[11px] font-medium text-white hover:bg-[#3f21c9]"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

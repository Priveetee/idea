"use client";

import { notFound, useParams } from "next/navigation";
import { useIdeaStore } from "@/app/admin/_providers/idea-store";
import type { IdeaStatus } from "@/lib/mock-data";
import { IdeaReadView } from "@/app/admin/_components/idea-read-view";

export default function PublicIdeaPage() {
  const params = useParams<{ id: string }>();
  const { ideas } = useIdeaStore();

  const idea = ideas.find((i) => i.id === params.id);
  if (!idea) {
    notFound();
  }

  const label = idea.label;
  const end = label.indexOf("]");
  const tgiLabel = end === -1 ? null : label.slice(0, end + 1);
  const titleLabel = end === -1 ? label : label.slice(end + 1).trim();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050509] text-white">
      <div className="w-full max-w-3xl rounded-3xl border border-zinc-900 bg-[#060010] px-8 py-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <IdeaReadView
          titleLabel={titleLabel}
          tgiLabel={tgiLabel}
          activeStatus={idea.status as IdeaStatus}
          managerSummary={idea.managerSummary ?? ""}
          managerContent={idea.managerContent ?? ""}
          managerBullets={idea.managerBullets ?? []}
          managerLinks={idea.managerLinks ?? []}
          managerNote={""}
        />
      </div>
    </div>
  );
}

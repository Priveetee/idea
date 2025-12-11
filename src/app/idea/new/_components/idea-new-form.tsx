"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import {
  IdeaNewFormState,
  type IdeaNewFormPayload,
} from "./idea-new-form-state";

export function IdeaNewForm() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const createIdea = trpc.idea.create.useMutation({
    async onSuccess() {
      await utils.idea.list.invalidate();
      router.push("/hub");
    },
  });

  const handleValidSubmit = (payload: IdeaNewFormPayload) => {
    createIdea.mutate({
      label: `[${payload.tgi}] ${payload.title}`,
      status: "INBOX",
      managerSummary: "",
      managerContent: payload.description ?? "",
      managerNote: "",
      links: payload.links.map((l) => ({
        label: l.label,
        url: l.url,
      })),
      bullets: [],
    });
  };

  return (
    <IdeaNewFormState
      onValidSubmit={handleValidSubmit}
      submitting={createIdea.isPending}
      externalError={createIdea.error?.message ?? null}
    />
  );
}

import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

const SYSTEM_FOLDERS = [
  { id: "INBOX", label: "Inbox général", color: "#5227FF", position: 0 },
  { id: "ARCHIVE", label: "Archives", color: "#64748b", position: 1 },
] as const;

async function ensureSystemFolders() {
  const existing = await prisma.adminFolder.findMany({
    where: { id: { in: SYSTEM_FOLDERS.map((f) => f.id) } },
    select: { id: true },
  });

  const existingIds = new Set(existing.map((f) => f.id));
  const missing = SYSTEM_FOLDERS.filter((f) => !existingIds.has(f.id));

  if (missing.length > 0) {
    await prisma.adminFolder.createMany({
      data: missing.map((f) => ({
        id: f.id,
        label: f.label,
        color: f.color,
        position: f.position,
      })),
    });
  }
}

export const folderRouter = router({
  list: publicProcedure.query(async () => {
    await ensureSystemFolders();
    const folders = await prisma.adminFolder.findMany({
      orderBy: { position: "asc" },
    });
    return folders;
  }),

  create: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        color: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const last = await prisma.adminFolder.findFirst({
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const folder = await prisma.adminFolder.create({
        data: {
          id: input.id,
          label: input.label,
          color: input.color,
          position: (last?.position ?? -1) + 1,
        },
      });

      return folder;
    }),

  duplicate: publicProcedure
    .input(
      z.object({
        sourceId: z.string().min(1),
        newId: z.string().min(1),
        newLabel: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const source = await prisma.adminFolder.findUnique({
        where: { id: input.sourceId },
      });

      if (!source) {
        return { success: false, createdIdeas: 0 };
      }

      const last = await prisma.adminFolder.findFirst({
        orderBy: { position: "desc" },
        select: { position: true },
      });

      await prisma.adminFolder.create({
        data: {
          id: input.newId,
          label: input.newLabel,
          color: source.color,
          position: (last?.position ?? -1) + 1,
        },
      });

      const ideas = await prisma.idea.findMany({
        where: { status: input.sourceId },
        include: { links: true, bullets: true },
      });

      if (ideas.length === 0) {
        return { success: true, createdIdeas: 0 };
      }

      await prisma.$transaction(
        ideas.map((idea) =>
          prisma.idea.create({
            data: {
              label: idea.label,
              status: input.newId,
              managerSummary: idea.managerSummary,
              managerContent: idea.managerContent,
              managerNote: idea.managerNote,
              isPublic: false,
              links: {
                create: idea.links.map((l) => ({
                  label: l.label,
                  url: l.url,
                })),
              },
              bullets: {
                create: idea.bullets.map((b) => ({
                  text: b.text,
                })),
              },
            },
          }),
        ),
      );

      return { success: true, createdIdeas: ideas.length };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1).optional(),
        color: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const folder = await prisma.adminFolder.update({
        where: { id: input.id },
        data: {
          label: input.label,
          color: input.color,
        },
      });
      return folder;
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.id === "INBOX" || input.id === "ARCHIVE") {
        return { success: false };
      }

      await prisma.adminFolder.delete({
        where: { id: input.id },
      });

      await prisma.idea.updateMany({
        where: { status: input.id },
        data: { status: "INBOX" },
      });

      return { success: true };
    }),

  reorder: publicProcedure
    .input(
      z.object({
        orderedIds: z.array(z.string().min(1)),
      }),
    )
    .mutation(async ({ input }) => {
      const updates = input.orderedIds.map((id, idx) =>
        prisma.adminFolder.update({
          where: { id },
          data: { position: idx },
        }),
      );

      await prisma.$transaction(updates);
      return { success: true };
    }),
});

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

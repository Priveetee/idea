import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export const ideaRouter = router({
  listPublic: publicProcedure.query(async () => {
    const ideas = await prisma.idea.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      include: {
        links: true,
        bullets: true,
        reactions: true,
        comments: true,
      },
    });
    return ideas;
  }),

  byIdPublic: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const idea = await prisma.idea.findFirst({
        where: { id: input.id, isPublic: true },
        include: {
          links: true,
          bullets: true,
          reactions: true,
          comments: true,
        },
      });
      return idea;
    }),

  list: protectedProcedure.query(async () => {
    const ideas = await prisma.idea.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        links: true,
        bullets: true,
      },
    });
    return ideas;
  }),

  byId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const idea = await prisma.idea.findUnique({
        where: { id: input.id },
        include: {
          links: true,
          bullets: true,
          reactions: true,
          comments: true,
        },
      });
      return idea;
    }),

  create: protectedProcedure
    .input(
      z.object({
        label: z.string().min(1),
        status: z.string().min(1),
        managerSummary: z.string().optional(),
        managerContent: z.string().optional(),
        managerNote: z.string().optional(),
        links: z
          .array(
            z.object({
              label: z.string(),
              url: z.string().url(),
            }),
          )
          .optional(),
        bullets: z
          .array(
            z.object({
              text: z.string().min(1),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const idea = await prisma.idea.create({
        data: {
          label: input.label,
          status: input.status,
          managerSummary: input.managerSummary ?? "",
          managerContent: input.managerContent ?? "",
          managerNote: input.managerNote ?? "",
          isPublic: false,
          links: input.links
            ? {
                create: input.links.map((l) => ({
                  label: l.label,
                  url: l.url,
                })),
              }
            : undefined,
          bullets: input.bullets
            ? {
                create: input.bullets.map((b) => ({
                  text: b.text,
                })),
              }
            : undefined,
        },
        include: {
          links: true,
          bullets: true,
        },
      });
      return idea;
    }),

  rename: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        label: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const idea = await prisma.idea.update({
        where: { id: input.id },
        data: { label: input.label },
      });
      return idea;
    }),

  updateDetails: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        managerSummary: z.string(),
        managerContent: z.string(),
        managerNote: z.string(),
        links: z.array(
          z.object({
            id: z.string().optional(),
            label: z.string(),
            url: z.string().url(),
          }),
        ),
        bullets: z.array(
          z.object({
            id: z.string().optional(),
            text: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const idea = await prisma.idea.update({
        where: { id: input.id },
        data: {
          managerSummary: input.managerSummary,
          managerContent: input.managerContent,
          managerNote: input.managerNote,
          links: {
            deleteMany: { ideaId: input.id },
            create: input.links.map((l) => ({
              label: l.label,
              url: l.url,
            })),
          },
          bullets: {
            deleteMany: { ideaId: input.id },
            create: input.bullets.map((b) => ({
              text: b.text,
            })),
          },
        },
        include: {
          links: true,
          bullets: true,
        },
      });
      return idea;
    }),

  moveToFolder: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const idea = await prisma.idea.update({
        where: { id: input.id },
        data: { status: input.status },
      });
      return idea;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await prisma.idea.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),

  setVisibility: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isPublic: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const idea = await prisma.idea.update({
        where: { id: input.id },
        data: { isPublic: input.isPublic },
      });
      return idea;
    }),

  addReaction: publicProcedure
    .input(
      z.object({
        ideaId: z.string(),
        emoji: z.string().min(1).max(10),
        fingerprint: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const reaction = await prisma.ideaReaction.upsert({
        where: {
          ideaId_emoji_fingerprint: {
            ideaId: input.ideaId,
            emoji: input.emoji,
            fingerprint: input.fingerprint,
          },
        },
        update: {},
        create: {
          ideaId: input.ideaId,
          emoji: input.emoji,
          fingerprint: input.fingerprint,
        },
      });

      return reaction;
    }),

  clearReactionsForEmoji: publicProcedure
    .input(
      z.object({
        ideaId: z.string(),
        emoji: z.string().min(1).max(10),
        fingerprint: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      await prisma.ideaReaction.deleteMany({
        where: {
          ideaId: input.ideaId,
          emoji: input.emoji,
          fingerprint: input.fingerprint,
        },
      });

      return { success: true };
    }),

  addComment: publicProcedure
    .input(
      z.object({
        ideaId: z.string(),
        text: z.string().min(1).max(2000),
        fingerprint: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const comment = await prisma.ideaComment.create({
        data: {
          ideaId: input.ideaId,
          text: input.text,
          fingerprint: input.fingerprint ?? null,
        },
      });
      return comment;
    }),
});

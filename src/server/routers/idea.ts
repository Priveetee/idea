import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export const ideaRouter = router({
  list: publicProcedure.query(async () => {
    const ideas = await prisma.idea.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        links: true,
        bullets: true,
      },
    });
    return ideas;
  }),

  byId: publicProcedure
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
        },
      });
      return idea;
    }),

  create: publicProcedure
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

  rename: publicProcedure
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

  updateDetails: publicProcedure
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

  delete: publicProcedure
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
});

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
});

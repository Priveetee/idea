import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export const configRouter = router({
  get: protectedProcedure.query(async () => {
    const cfg =
      (await prisma.appConfig.findUnique({ where: { id: "main" } })) ??
      (await prisma.appConfig.create({
        data: { id: "main", registrationsOpen: true },
      }));
    return cfg;
  }),

  setRegistrationsOpen: protectedProcedure
    .input(
      z.object({
        open: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const cfg = await prisma.appConfig.upsert({
        where: { id: "main" },
        update: { registrationsOpen: input.open },
        create: { id: "main", registrationsOpen: input.open },
      });
      return cfg;
    }),
});

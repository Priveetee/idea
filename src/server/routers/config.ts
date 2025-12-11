import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export const configRouter = router({
  get: publicProcedure.query(async () => {
    const cfg =
      (await prisma.appConfig.findUnique({ where: { id: "main" } })) ??
      (await prisma.appConfig.create({
        data: { id: "main", registrationsOpen: true },
      }));
    return cfg;
  }),

  setRegistrationsOpen: publicProcedure
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

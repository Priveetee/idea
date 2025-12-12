import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

function registrationsClosedResponse(): Response {
  return Response.json(
    {
      code: "REGISTRATIONS_CLOSED",
      message: "Les Inscriptions sont fermer 👾 !",
    },
    { status: 422 },
  );
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const cfg =
            (await prisma.appConfig.findUnique({ where: { id: "main" } })) ??
            (await prisma.appConfig.create({
              data: { id: "main", registrationsOpen: true },
            }));

          if (!cfg.registrationsOpen) {
            throw registrationsClosedResponse();
          }

          return { data: user };
        },
      },
    },
  },
});

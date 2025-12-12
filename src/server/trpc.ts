import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { auth } from "@/auth";

export type TRPCContext = {
  session: unknown | null;
};

export const createTRPCContext = async (opts: {
  req: Request;
}): Promise<TRPCContext> => {
  const session = await auth.api.getSession({
    headers: opts.req.headers,
  });

  return { session: session ?? null };
};

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new Error("UNAUTHORIZED");
  }
  return next();
});

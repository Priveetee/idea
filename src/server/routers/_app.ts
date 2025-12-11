import { router } from "../trpc";
import { ideaRouter } from "./idea";

export const appRouter = router({
  idea: ideaRouter,
});

export type AppRouter = typeof appRouter;

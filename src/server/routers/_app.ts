import { router } from "../trpc";
import { ideaRouter } from "./idea";
import { configRouter } from "./config";

export const appRouter = router({
  idea: ideaRouter,
  config: configRouter,
});

export type AppRouter = typeof appRouter;

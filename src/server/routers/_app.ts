import { router } from "../trpc";
import { ideaRouter } from "./idea";
import { configRouter } from "./config";
import { folderRouter } from "./folder";

export const appRouter = router({
  idea: ideaRouter,
  config: configRouter,
  folder: folderRouter,
});

export type AppRouter = typeof appRouter;

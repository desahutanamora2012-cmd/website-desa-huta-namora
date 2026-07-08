import { authRouter } from "./auth-router.ts";
import { desaRouter } from "./desa-router.ts";
import { sotkRouter } from "./sotk-router.ts";
import { createRouter, publicQuery } from "./middleware.ts";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  desa: desaRouter,
  sotk: sotkRouter,
});

export type AppRouter = typeof appRouter;

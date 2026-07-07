import { authRouter } from "./auth-router.js";
import { desaRouter } from "./desa-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  desa: desaRouter,
});

export type AppRouter = typeof appRouter;

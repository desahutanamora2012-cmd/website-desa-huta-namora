import { authRouter } from "./auth-router.js";
import { desaRouter } from "./desa-router.js";
import { sotkRouter } from "./sotk-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  desa: desaRouter,
  sotk: sotkRouter,
});

export type AppRouter = typeof appRouter;

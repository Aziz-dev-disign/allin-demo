import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { coachesRoutes } from "./routes/coaches.js";
import { membersRoutes } from "./routes/members.js";
import type { Store } from "./store/types.js";

export interface AppDeps {
  store: Store;
  /** Secret partagé avec le fournisseur de paiement pour signer les webhooks. */
  webhookSecret: string;
}

/** Construit l'application. Les dépendances sont injectées pour pouvoir tester. */
export function createApp(deps: AppDeps) {
  const app = new Hono();

  app.use("*", logger());
  app.use("*", cors({ origin: "http://localhost:5173" }));

  app.get("/health", (c) => c.json({ ok: true }));
  app.route("/members", membersRoutes(deps.store));
  app.route("/coaches", coachesRoutes(deps.store));

  // TODO(issue #1) : POST /webhooks/payments
  // TODO(issue #2) : attribution d'un coach après paiement

  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "internal_error" }, 500);
  });

  return app;
}

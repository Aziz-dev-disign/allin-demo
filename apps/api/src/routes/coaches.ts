import { Hono } from "hono";
import type { Store } from "../store/types.js";

export function coachesRoutes(store: Store) {
  const app = new Hono();

  app.get("/", async (c) => {
    const coaches = await store.listCoaches();
    return c.json(coaches.filter((coach) => coach.active));
  });

  return app;
}

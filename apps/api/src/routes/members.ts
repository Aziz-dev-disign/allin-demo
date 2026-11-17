import { Hono } from "hono";
import type { Store } from "../store/types.js";

export function membersRoutes(store: Store) {
  const app = new Hono();

  app.get("/:id", async (c) => {
    const member = await store.getMember(c.req.param("id"));
    if (!member) return c.json({ error: "member_not_found" }, 404);
    return c.json(member);
  });

  return app;
}

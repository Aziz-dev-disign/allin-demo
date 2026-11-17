import { describe, expect, it } from "vitest";
import { coach, makeApp } from "./helpers.js";

describe("socle de l'API", () => {
  it("GET /health répond ok", async () => {
    const { app } = makeApp();
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("GET /members/:id renvoie 404 pour un membre inconnu", async () => {
    const { app } = makeApp();
    const res = await app.request("/members/inconnu");
    expect(res.status).toBe(404);
  });

  it("GET /members/:id renvoie le membre existant", async () => {
    const { app, store } = makeApp();
    const m = await store.createMember({ email: "A@Test.com ", fullName: "A", status: "paid" });
    const res = await app.request(`/members/${m.id}`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ email: "a@test.com", status: "paid" });
  });

  it("GET /coaches ne renvoie que les coachs actifs", async () => {
    const { app } = makeApp({
      coaches: [coach(), coach({ id: "coach-2", active: false })],
    });
    const res = await app.request("/coaches");
    const body = (await res.json()) as { id: string }[];
    expect(body.map((c) => c.id)).toEqual(["coach-1"]);
  });
});

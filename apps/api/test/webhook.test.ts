import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { DuplicateEmailError } from "../src/store/types.js";
import { makeApp, TEST_WEBHOOK_SECRET } from "./helpers.js";

const sign = (body: string, secret = TEST_WEBHOOK_SECRET) =>
  createHmac("sha256", secret).update(body).digest("hex");

const payload = (over: Record<string, unknown> = {}) => ({
  eventId: "evt_1",
  type: "payment.succeeded",
  data: { email: "Jeanne@Exemple.com", fullName: "Jeanne Tremblay", amountCents: 49900 },
  ...over,
});

function post(app: ReturnType<typeof makeApp>["app"], body: string, headers: Record<string, string> = {}) {
  return app.request("/webhooks/payments", { method: "POST", body, headers });
}

const postSigned = (app: ReturnType<typeof makeApp>["app"], obj: unknown) => {
  const body = JSON.stringify(obj);
  return post(app, body, { "x-signature": sign(body) });
};

describe("POST /webhooks/payments", () => {
  it("401 sans signature, rien n'est écrit", async () => {
    const { app, store } = makeApp();
    const res = await post(app, JSON.stringify(payload()));
    expect(res.status).toBe(401);
    expect(await store.getMemberByEmail("jeanne@exemple.com")).toBeNull();
  });

  it("401 avec signature invalide, rien n'est écrit", async () => {
    const { app, store } = makeApp();
    const body = JSON.stringify(payload());
    for (const sig of [sign(body, "mauvais-secret"), "abc", "zz".repeat(32)]) {
      const res = await post(app, body, { "x-signature": sig });
      expect(res.status).toBe(401);
    }
    expect(await store.getMemberByEmail("jeanne@exemple.com")).toBeNull();
  });

  it("400 si le corps n'est pas du JSON valide signé", async () => {
    const { app } = makeApp();
    const body = "pas du json";
    const res = await post(app, body, { "x-signature": sign(body) });
    expect(res.status).toBe(400);
  });

  it("400 si le corps ne respecte pas le schéma", async () => {
    const { app } = makeApp();
    const res = await postSigned(app, payload({ data: { email: "pas-un-email" } }));
    expect(res.status).toBe(400);
  });

  it("crée un nouveau membre avec le statut paid", async () => {
    const { app, store } = makeApp();
    const res = await postSigned(app, payload());
    expect(res.status).toBe(200);
    expect(await store.getMemberByEmail("jeanne@exemple.com")).toMatchObject({
      status: "paid",
      fullName: "Jeanne Tremblay",
    });
  });

  it("passe un membre pending_payment à paid", async () => {
    const { app, store } = makeApp();
    const m = await store.createMember({ email: "jeanne@exemple.com", fullName: "J", status: "pending_payment" });
    const res = await postSigned(app, payload());
    expect(res.status).toBe(200);
    expect((await store.getMember(m.id))?.status).toBe("paid");
  });

  it("le même eventId reçu deux fois ne produit qu'un seul effet", async () => {
    const { app, store } = makeApp();
    expect((await postSigned(app, payload())).status).toBe(200);
    const m = (await store.getMemberByEmail("jeanne@exemple.com"))!;
    await store.updateMember(m.id, { status: "onboarded" });
    // Rejeu du même événement : aucun effet, 200.
    expect((await postSigned(app, payload())).status).toBe(200);
    expect((await store.getMember(m.id))?.status).toBe("onboarded");
  });

  it("type d'événement inconnu : 200 sans effet", async () => {
    const { app, store } = makeApp();
    const res = await postSigned(app, payload({ type: "refund.created" }));
    expect(res.status).toBe(200);
    expect(await store.getMemberByEmail("jeanne@exemple.com")).toBeNull();
  });

  it.each([0, -100])("400 si le montant est %i (un paiement doit être > 0), rien n'est écrit", async (amountCents) => {
    const { app, store } = makeApp();
    const res = await postSigned(
      app,
      payload({ data: { email: "Jeanne@Exemple.com", fullName: "Jeanne Tremblay", amountCents } }),
    );
    expect(res.status).toBe(400);
    expect(await store.getMemberByEmail("jeanne@exemple.com")).toBeNull();
  });

  it("le store refuse deux membres avec le même email (casse ignorée)", async () => {
    const { store } = makeApp();
    await store.createMember({ email: "jeanne@exemple.com", fullName: "J", status: "paid" });
    await expect(
      store.createMember({ email: "JEANNE@exemple.com", fullName: "J2", status: "paid" }),
    ).rejects.toBeInstanceOf(DuplicateEmailError);
  });

  it("deux événements simultanés pour le même email : 200 partout, un seul membre", async () => {
    const { app, store } = makeApp();
    const results = await Promise.all([
      postSigned(app, payload({ eventId: "evt_a" })),
      postSigned(app, payload({ eventId: "evt_b" })),
    ]);
    expect(results.map((r) => r.status)).toEqual([200, 200]);
    expect(await store.getMemberByEmail("jeanne@exemple.com")).toMatchObject({ status: "paid" });
  });

  it.each(["onboarded", "active"] as const)("un membre %s ne redescend jamais à paid", async (status) => {
    const { app, store } = makeApp();
    const m = await store.createMember({ email: "jeanne@exemple.com", fullName: "J", status });
    const res = await postSigned(app, payload({ eventId: "evt_2" }));
    expect(res.status).toBe(200);
    expect((await store.getMember(m.id))?.status).toBe(status);
  });
});

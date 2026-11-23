import { createHmac, timingSafeEqual } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import { DuplicateEmailError, type Store } from "../store/types.js";

const eventSchema = z.object({
  eventId: z.string().min(1),
  type: z.string().min(1),
  data: z.unknown(),
});

const paymentSucceededSchema = z.object({
  email: z.email(),
  fullName: z.string().min(1),
  // > 0 : un paiement à 0 n'est pas un paiement. Le min/max exact reste à confirmer (voir PR).
  amountCents: z.number().int().positive(),
});

/** Vérifie en temps constant le HMAC-SHA256 hexadécimal du corps brut. */
function validSignature(rawBody: string, header: string | undefined, secret: string): boolean {
  if (!header) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const received = Buffer.from(header, "hex");
  // Un hex invalide ou de mauvaise longueur donne un buffer de taille différente.
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}

export function webhooksRoutes(store: Store, webhookSecret: string) {
  const app = new Hono();

  app.post("/payments", async (c) => {
    // La signature porte sur le corps brut : on le lit avant tout parsing.
    const rawBody = await c.req.text();
    if (!validSignature(rawBody, c.req.header("x-signature"), webhookSecret)) {
      return c.json({ error: "invalid_signature" }, 401);
    }

    let json: unknown;
    try {
      json = JSON.parse(rawBody);
    } catch {
      return c.json({ error: "invalid_body" }, 400);
    }
    const event = eventSchema.safeParse(json);
    if (!event.success) return c.json({ error: "invalid_body" }, 400);

    if (event.data.type !== "payment.succeeded") return c.json({ received: true });

    const data = paymentSucceededSchema.safeParse(event.data.data);
    if (!data.success) return c.json({ error: "invalid_body" }, 400);

    // Idempotence : un eventId déjà traité n'a plus d'effet.
    if (await store.hasProcessedEvent(event.data.eventId)) {
      return c.json({ received: true, duplicate: true });
    }

    let member = await store.getMemberByEmail(data.data.email);
    if (!member) {
      try {
        await store.createMember({ email: data.data.email, fullName: data.data.fullName, status: "paid" });
      } catch (err) {
        if (!(err instanceof DuplicateEmailError)) throw err;
        // Course : un autre événement a créé ce membre entre-temps. On le relit et on applique la règle normale.
        member = await store.getMemberByEmail(data.data.email);
      }
    }
    if (member?.status === "pending_payment") {
      // Un membre onboarded/active ne redescend jamais à paid.
      await store.updateMember(member.id, { status: "paid" });
    }

    await store.markEventProcessed(event.data.eventId);
    return c.json({ received: true });
  });

  return app;
}

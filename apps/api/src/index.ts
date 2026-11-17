import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { InMemoryStore } from "./store/memory.js";
import { SupabaseStore } from "./store/supabase.js";
import type { Store } from "./store/types.js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, WEBHOOK_SECRET, PORT } = process.env;

if (!WEBHOOK_SECRET) {
  throw new Error("WEBHOOK_SECRET manquant (voir .env.example)");
}

// Sans Supabase configuré, on démarre avec des données de démo en mémoire.
const store: Store =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? new SupabaseStore(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : new InMemoryStore({
        coaches: [
          { id: "coach-1", fullName: "Coach Alpha", capacity: 2, active: true },
          { id: "coach-2", fullName: "Coach Beta", capacity: 3, active: true },
          { id: "coach-3", fullName: "Coach Inactif", capacity: 10, active: false },
        ],
      });

const port = Number(PORT ?? 8787);
serve({ fetch: createApp({ store, webhookSecret: WEBHOOK_SECRET }).fetch, port });
console.log(`API sur http://localhost:${port}`);

import { createApp } from "../src/app.js";
import { InMemoryStore } from "../src/store/memory.js";
import type { Coach, Member } from "../src/store/types.js";

export const TEST_WEBHOOK_SECRET = "test-secret";

export function makeApp(seed: { coaches?: Coach[]; members?: Member[] } = {}) {
  const store = new InMemoryStore(seed);
  const app = createApp({ store, webhookSecret: TEST_WEBHOOK_SECRET });
  return { app, store };
}

export const coach = (over: Partial<Coach> = {}): Coach => ({
  id: "coach-1",
  fullName: "Coach Alpha",
  capacity: 2,
  active: true,
  ...over,
});

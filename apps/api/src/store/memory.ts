import { randomUUID } from "node:crypto";
import type { Coach, Member, Store } from "./types.js";

/** Store en mémoire : utilisé par les tests et le développement sans Supabase. */
export class InMemoryStore implements Store {
  private members = new Map<string, Member>();
  private coaches = new Map<string, Coach>();

  constructor(seed: { coaches?: Coach[]; members?: Member[] } = {}) {
    for (const c of seed.coaches ?? []) this.coaches.set(c.id, c);
    for (const m of seed.members ?? []) this.members.set(m.id, m);
  }

  async getMember(id: string) {
    return this.members.get(id) ?? null;
  }

  async getMemberByEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    for (const m of this.members.values()) if (m.email === normalized) return m;
    return null;
  }

  async createMember(input: Pick<Member, "email" | "fullName" | "status">) {
    const member: Member = {
      id: randomUUID(),
      email: input.email.trim().toLowerCase(),
      fullName: input.fullName,
      status: input.status,
      coachId: null,
      createdAt: new Date().toISOString(),
    };
    this.members.set(member.id, member);
    return member;
  }

  async updateMember(id: string, patch: Partial<Pick<Member, "status" | "coachId">>) {
    const current = this.members.get(id);
    if (!current) throw new Error(`member ${id} not found`);
    const next = { ...current, ...patch };
    this.members.set(id, next);
    return next;
  }

  async listCoaches() {
    return [...this.coaches.values()];
  }

  async countMembersByCoach(coachId: string) {
    let n = 0;
    for (const m of this.members.values()) if (m.coachId === coachId) n++;
    return n;
  }
}

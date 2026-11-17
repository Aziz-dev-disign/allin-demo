import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Coach, Member, Store } from "./types.js";

type MemberRow = {
  id: string;
  email: string;
  full_name: string;
  status: Member["status"];
  coach_id: string | null;
  created_at: string;
};

type CoachRow = { id: string; full_name: string; capacity: number; active: boolean };

const toMember = (r: MemberRow): Member => ({
  id: r.id,
  email: r.email,
  fullName: r.full_name,
  status: r.status,
  coachId: r.coach_id,
  createdAt: r.created_at,
});

const toCoach = (r: CoachRow): Coach => ({
  id: r.id,
  fullName: r.full_name,
  capacity: r.capacity,
  active: r.active,
});

/**
 * Store branché sur Supabase/Postgres.
 * Utilise la clé service_role : à n'utiliser QUE côté serveur, jamais dans apps/web.
 */
export class SupabaseStore implements Store {
  private db: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.db = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  }

  async getMember(id: string) {
    const { data, error } = await this.db.from("members").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? toMember(data as MemberRow) : null;
  }

  async getMemberByEmail(email: string) {
    const { data, error } = await this.db
      .from("members")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();
    if (error) throw error;
    return data ? toMember(data as MemberRow) : null;
  }

  async createMember(input: Pick<Member, "email" | "fullName" | "status">) {
    const { data, error } = await this.db
      .from("members")
      .insert({ email: input.email.trim().toLowerCase(), full_name: input.fullName, status: input.status })
      .select("*")
      .single();
    if (error) throw error;
    return toMember(data as MemberRow);
  }

  async updateMember(id: string, patch: Partial<Pick<Member, "status" | "coachId">>) {
    const row: Partial<MemberRow> = {};
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.coachId !== undefined) row.coach_id = patch.coachId;
    const { data, error } = await this.db.from("members").update(row).eq("id", id).select("*").single();
    if (error) throw error;
    return toMember(data as MemberRow);
  }

  async listCoaches() {
    const { data, error } = await this.db.from("coaches").select("*");
    if (error) throw error;
    return (data as CoachRow[]).map(toCoach);
  }

  async countMembersByCoach(coachId: string) {
    const { count, error } = await this.db
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("coach_id", coachId);
    if (error) throw error;
    return count ?? 0;
  }
}

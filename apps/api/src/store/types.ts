// Modèle de domaine partagé par toutes les implémentations du store.
// Les noms de champs suivent le schéma SQL (supabase/migrations) en camelCase.

export type MemberStatus = "pending_payment" | "paid" | "onboarded" | "active";

export interface Member {
  id: string;
  email: string;
  fullName: string;
  status: MemberStatus;
  coachId: string | null;
  createdAt: string;
}

export interface Coach {
  id: string;
  fullName: string;
  /** Nombre maximal de membres actifs que le coach peut suivre. */
  capacity: number;
  active: boolean;
}

/**
 * Accès aux données. L'API ne parle jamais directement à Supabase :
 * elle passe par cette interface, ce qui permet de tester avec InMemoryStore.
 */
export interface Store {
  getMember(id: string): Promise<Member | null>;
  getMemberByEmail(email: string): Promise<Member | null>;
  createMember(input: Pick<Member, "email" | "fullName" | "status">): Promise<Member>;
  updateMember(id: string, patch: Partial<Pick<Member, "status" | "coachId">>): Promise<Member>;
  listCoaches(): Promise<Coach[]>;
  countMembersByCoach(coachId: string): Promise<number>;
}

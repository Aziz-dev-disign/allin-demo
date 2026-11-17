-- Schéma initial : coachs et membres.

create table public.coaches (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  capacity   int  not null check (capacity > 0),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create type public.member_status as enum ('pending_payment', 'paid', 'onboarded', 'active');

create table public.members (
  id         uuid primary key default gen_random_uuid(),
  -- Lien vers auth.users pour le portail membre (issue #3).
  user_id    uuid unique references auth.users (id) on delete set null,
  email      text not null unique check (email = lower(email)),
  full_name  text not null,
  status     public.member_status not null default 'pending_payment',
  coach_id   uuid references public.coaches (id),
  created_at timestamptz not null default now()
);

create index members_coach_id_idx on public.members (coach_id);

-- RLS activée dès le départ : sans politique, personne n'accède aux données
-- depuis le client. L'API serveur utilise la clé service_role.
alter table public.coaches enable row level security;
alter table public.members enable row level security;

-- TODO(issue #3) : politique permettant à un membre connecté de lire SA ligne uniquement.

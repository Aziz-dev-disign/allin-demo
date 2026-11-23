-- Idempotence des webhooks de paiement : un eventId n'est traité qu'une fois.

create table public.processed_events (
  event_id     text primary key,
  processed_at timestamptz not null default now()
);

-- RLS activée sans politique : accessible uniquement via service_role (API serveur).
alter table public.processed_events enable row level security;

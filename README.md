# allin-demo

Parcours d'un membre, du premier paiement à l'attribution d'un coach, sur une stack
TypeScript · Hono · React/Vite · Supabase/Postgres.

Projet de démonstration pour montrer un flux de travail avec des agents de programmation :
contexte partagé (`CLAUDE.md`), tickets découpés (`docs/issues`), agents en parallèle,
tests d'abord, petites PR vérifiées par la CI.

## Démarrer

```bash
npm install
cp .env.example .env      # puis renseigner WEBHOOK_SECRET
npm run check             # types + tests
npm run dev:api           # http://localhost:8787
npm run dev:web           # http://localhost:5173
```

Sans variables Supabase, l'API démarre avec des données de démo en mémoire.

## Tickets

| # | Ticket | Statut |
|---|--------|--------|
| 1 | [Webhook de paiement](docs/issues/01-webhook-paiement.md) | à faire |
| 2 | [Attribution d'un coach](docs/issues/02-attribution-coach.md) | à faire |
| 3 | [Portail membre](docs/issues/03-portail-membre.md) | à faire |

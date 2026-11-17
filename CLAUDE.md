# Contexte pour les agents

Mini-plateforme de démo : un membre paie, il est inscrit, on lui attribue un coach,
il voit son statut dans un portail. Stack : TypeScript, Hono (API), React + Vite (web),
Supabase/Postgres (données), Vitest (tests).

## Structure

- `apps/api` — API Hono. `src/app.ts` construit l'app avec ses dépendances injectées.
- `apps/api/src/store` — accès aux données via l'interface `Store`.
  `InMemoryStore` pour les tests, `SupabaseStore` pour la vraie base.
- `apps/web` — portail membre React. Appelle l'API via le proxy `/api`.
- `supabase/migrations` — schéma SQL. Une nouvelle migration par changement, jamais
  de modification d'une migration existante.
- `docs/issues` — tickets à réaliser.

## Commandes

- `npm test` — tests de l'API
- `npm run typecheck` — vérification des types (api + web)
- `npm run check` — les deux, c'est ce que lance la CI

## Règles

1. **Tests d'abord.** Pour toute nouvelle règle métier, écrire le test qui échoue,
   le montrer échouer, puis implémenter. Ne jamais modifier un test existant pour
   le faire passer sans le signaler explicitement.
2. **Les routes ne parlent qu'à `Store`.** Pas d'import de Supabase dans `routes/`.
   Une méthode manquante s'ajoute à l'interface ET aux deux implémentations.
3. **Valider toute entrée externe avec zod** (corps de requête, webhooks).
4. **Secrets.** Ne jamais lire, afficher ni commiter `.env`. La clé `service_role`
   ne doit jamais apparaître dans `apps/web`.
5. **Argent et paiements.** Les webhooks peuvent arriver en double, en désordre ou
   être falsifiés : vérifier la signature, rendre le traitement idempotent.
6. **Petites PR.** Une PR = un ticket. Lancer `npm run check` avant de conclure.
7. En cas d'ambiguïté métier, s'arrêter et poser la question plutôt que deviner.

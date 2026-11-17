# #2 — Attribuer un coach après le paiement

Dépend de #1.

## Objectif

Après un paiement réussi, attribuer automatiquement un coach au membre et le passer
au statut `onboarded`.

## Règles

- Seuls les coachs `active` sont éligibles.
- Un coach ne peut pas dépasser sa `capacity`.
- On choisit le coach le **moins chargé** (proportionnellement à sa capacité).
- En cas d'égalité, ordre stable (par `id`) pour que le résultat soit prévisible.
- Si aucun coach n'a de place : le membre reste `paid`, sans coach, et l'API le signale
  (log + champ dans la réponse) pour qu'un humain intervienne.
- Un membre qui a déjà un coach n'est jamais réattribué.

## Critères d'acceptation

- [ ] Tests unitaires de la fonction de choix (pure, sans I/O).
- [ ] Test d'intégration : webhook → membre `onboarded` avec un coach.
- [ ] Test : tous les coachs pleins → membre `paid`, `coachId = null`.
- [ ] Test : rejouer le webhook ne change pas de coach.

## Question ouverte (à trancher par le produit)

Deux paiements simultanés peuvent-ils dépasser la capacité d'un coach ?
Proposer une option (contrainte SQL, verrou, fonction Postgres) et la documenter.

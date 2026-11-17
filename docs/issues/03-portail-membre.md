# #3 — Portail membre : statut et coach

## Objectif

Un membre connecté voit où il en est : statut, nom de son coach, prochaine étape.

## Critères d'acceptation

- [ ] `GET /me` renvoie le membre lié à l'utilisateur connecté (jeton Supabase Auth).
- [ ] Sans jeton ou jeton invalide → `401`.
- [ ] **Un membre ne peut jamais lire les données d'un autre membre**, même en
      changeant un identifiant dans l'URL.
- [ ] Politique RLS sur `members` : lecture de sa propre ligne uniquement (nouvelle migration).
- [ ] Page React : états chargement / erreur / vide, lisible sur mobile.
- [ ] Message clair pour chaque statut (`paid` sans coach : « on vous attribue un coach »).

## Points d'attention

- Ne pas exposer `GET /members/:id` publiquement en production : le restreindre ou le retirer.
- Aucune clé `service_role` côté web.

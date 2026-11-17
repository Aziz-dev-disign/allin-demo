# #1 — Recevoir le webhook de paiement

## Objectif

Quand le fournisseur de paiement confirme un paiement, créer (ou mettre à jour) le
membre avec le statut `paid`.

## Contrat

`POST /webhooks/payments`

En-tête `x-signature` : HMAC-SHA256 hexadécimal du corps brut, avec `WEBHOOK_SECRET`.

```json
{
  "eventId": "evt_123",
  "type": "payment.succeeded",
  "data": { "email": "membre@exemple.com", "fullName": "Jeanne Tremblay", "amountCents": 49900 }
}
```

## Critères d'acceptation

- [ ] Signature absente ou invalide → `401`, rien n'est écrit.
- [ ] Corps invalide (zod) → `400`.
- [ ] `payment.succeeded` pour un nouvel email → membre créé avec `status = paid` → `200`.
- [ ] Email déjà connu en `pending_payment` → passe à `paid`.
- [ ] **Le même `eventId` reçu deux fois ne produit qu'un seul effet** → `200` les deux fois.
- [ ] Type d'événement inconnu → `200` sans effet (on accuse réception).
- [ ] Un membre déjà `onboarded` ou `active` ne redescend jamais à `paid`.

## Points d'attention

- La comparaison de signature doit se faire en temps constant.
- La signature porte sur le corps **brut** : le lire avant de le parser.
- Il faudra probablement ajouter au `Store` de quoi mémoriser les `eventId` déjà traités
  (et une migration pour la table correspondante).

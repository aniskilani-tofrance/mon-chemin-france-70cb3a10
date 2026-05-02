---
name: Statut admin fin (CIR/OFII/BPI)
description: Modèle DB + orientation engine intègrent CIR, OFII, BPI, logement bloquant, Alpha distinct, garde, préférence formatrice
type: feature
---

## Champs profiles ajoutés
- `admin_status_detailed` : cir_signed | cir_in_progress | bpi_refugie | bpi_subsidiaire | demandeur_asile | titre_sejour | sans_papiers | ue | autre
- `cir_signed`, `cir_signed_at`, `ofii_hours_remaining`
- `housing_blocking` : domiciliation absente = bloquant absolu (priorité 0)
- `prefers_female_trainer`, `childcare_status`
- `needs_diploma_recognition` : déclenche ENIC-NARIC

## Parcours orientationEngine ajoutés
- LOGEMENT (priorité 0, avant tout)
- BPI (AGIR/HOPE/Accelair pour réfugiés)
- OFII (heures gratuites avant FLE payant)
- Alpha distingué de A0/A1 dans NiveauFrancais

## Question decisionTree ajoutée
- `cir_status` après `admin_status` : signed_hours_left | signed_used | in_progress | not_signed | not_concerned | dont_know

## Actions ajoutées
- CONTACT_OFII, CONTACT_DOMICILIATION, CONTACT_AGIR, CONTACT_SANTE_MENTALE, CONTACT_ENIC_NARIC

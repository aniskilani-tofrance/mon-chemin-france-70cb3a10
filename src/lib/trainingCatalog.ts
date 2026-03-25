export interface TrainingCatalogItem {
  id: string;
  label: string;
  certification_type: "language" | "cqp" | "tp";
  training_type: "language" | "professional" | "both";
  sectors: string[]; // référentiel ToFrance sectors
}

export interface TrainingCatalogCategory {
  id: string;
  label: string;
  items: TrainingCatalogItem[];
}

// Référentiel secteurs ToFrance
export const SECTORS = [
  "Logistique / Entrepôt",
  "Transport / Livraison / Mobilité",
  "BTP / Travaux publics / Réseaux",
  "Propreté / Hygiène",
  "Hôtellerie – Restauration",
  "Santé – Médico-social / Aide à la personne",
  "Commerce / Vente / Relation client",
  "Administration / Accueil / Secrétariat",
  "Industrie / Production / Maintenance",
  "Sécurité / Sûreté",
  "Transversal (tous secteurs)",
] as const;

export const trainingCatalog: TrainingCatalogCategory[] = [
  {
    id: "fle_general",
    label: "1. Français langue étrangère (FLE) – général",
    items: [
      { id: "alpha", label: "Alpha / non lecteur-scripteur", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "post_alpha", label: "Post-alpha", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "a1_1", label: "A1.1", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "a1", label: "A1", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "a2", label: "A2", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "b1", label: "B1", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "b2", label: "B2", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "c1", label: "C1", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "atelier_conversation", label: "Atelier conversation (oral)", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "prononciation", label: "Prononciation / phonétique", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "francais_ecrit", label: "Français écrit (rédaction, orthographe)", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "francais_formulaires", label: "Français formulaires / démarches", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "francais_integration", label: "Français d'intégration / vie quotidienne", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
    ],
  },
  {
    id: "prep_tests",
    label: "2. Préparation aux tests et diplômes de français",
    items: [
      { id: "dilf", label: "DILF (préparation)", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "delf_a1", label: "DELF A1 (préparation)", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "delf_a2", label: "DELF A2 (préparation)", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "delf_b1", label: "DELF B1 (préparation)", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "delf_b2", label: "DELF B2 (préparation)", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "dalf_c1", label: "DALF C1 (préparation)", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "dalf_c2", label: "DALF C2 (préparation)", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "tcf", label: "TCF (préparation)", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "tef", label: "TEF (préparation)", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "dcl_fle", label: "DCL FLE (préparation)", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "examens_blancs", label: "Examens blancs + coaching examens", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
    ],
  },
  {
    id: "fos_emploi",
    label: "3. Français professionnel (FOS / FLE-Emploi)",
    items: [
      { id: "fp_logistique", label: "Français pro – Logistique / entrepôt", certification_type: "language", training_type: "both", sectors: ["Logistique / Entrepôt"] },
      { id: "fp_transport", label: "Français pro – Transport / livraison", certification_type: "language", training_type: "both", sectors: ["Transport / Livraison / Mobilité"] },
      { id: "fp_btp", label: "Français pro – BTP / chantier", certification_type: "language", training_type: "both", sectors: ["BTP / Travaux publics / Réseaux"] },
      { id: "fp_proprete", label: "Français pro – Propreté / hygiène", certification_type: "language", training_type: "both", sectors: ["Propreté / Hygiène"] },
      { id: "fp_hotel_resto", label: "Français pro – Hôtellerie / restauration", certification_type: "language", training_type: "both", sectors: ["Hôtellerie – Restauration"] },
      { id: "fp_sante", label: "Français pro – Médico-social / aide à la personne", certification_type: "language", training_type: "both", sectors: ["Santé – Médico-social / Aide à la personne"] },
      { id: "fp_commerce", label: "Français pro – Commerce / vente / caisse", certification_type: "language", training_type: "both", sectors: ["Commerce / Vente / Relation client"] },
      { id: "fp_admin", label: "Français pro – Administratif / accueil", certification_type: "language", training_type: "both", sectors: ["Administration / Accueil / Secrétariat"] },
      { id: "fp_entreprise", label: "Français en entreprise (mails, réunions, consignes, sécurité)", certification_type: "language", training_type: "both", sectors: ["Transversal (tous secteurs)"] },
    ],
  },
  {
    id: "remise_niveau",
    label: "4. Compétences de base (remise à niveau)",
    items: [
      { id: "savoirs_base", label: "Savoirs de base (lire/écrire/compter)", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "competences_cles", label: "Compétences clés / autonomie", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
      { id: "communication_orale", label: "Communication orale (soft skills)", certification_type: "language", training_type: "language", sectors: ["Transversal (tous secteurs)"] },
    ],
  },
  {
    id: "numerique",
    label: "5. Numérique & bureautique",
    items: [
      { id: "inclusion_num", label: "Inclusion numérique (mail, internet, smartphone)", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
      { id: "demarches_ligne", label: "Démarches en ligne (CAF, Préfecture, France Travail, Ameli)", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
      { id: "bureautique", label: "Bureautique (Word/Excel/PPT)", certification_type: "cqp", training_type: "professional", sectors: ["Administration / Accueil / Secrétariat", "Transversal (tous secteurs)"] },
      { id: "pix", label: "PIX", certification_type: "cqp", training_type: "professional", sectors: ["Administration / Accueil / Secrétariat", "Transversal (tous secteurs)"] },
      { id: "tosa", label: "TOSA", certification_type: "cqp", training_type: "professional", sectors: ["Administration / Accueil / Secrétariat", "Transversal (tous secteurs)"] },
      { id: "icdl", label: "ICDL", certification_type: "cqp", training_type: "professional", sectors: ["Administration / Accueil / Secrétariat", "Transversal (tous secteurs)"] },
      { id: "recherche_emploi_ligne", label: "Recherche d'emploi en ligne (FT, Indeed, LinkedIn)", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
    ],
  },
  {
    id: "insertion",
    label: "6. Insertion socio-professionnelle (emploi)",
    items: [
      { id: "atelier_cv", label: "Atelier CV", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
      { id: "lettre_pro", label: "Lettre / messages professionnels", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
      { id: "prep_entretien", label: "Préparation entretien (simulations)", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
      { id: "projet_pro", label: "Projet professionnel / orientation", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
      { id: "tre", label: "Techniques de recherche d'emploi (TRE)", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
      { id: "codes_entreprise", label: "Codes de l'entreprise", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
      { id: "soft_skills", label: "Soft skills (communication, travail en équipe)", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
    ],
  },
  {
    id: "prequalification",
    label: "7. Pré-qualification / passerelles",
    items: [
      { id: "prepa_apprentissage", label: "Prépa apprentissage / alternance", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
      { id: "prepa_qualifiante", label: "Prépa entrée en formation qualifiante", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
      { id: "decouverte_metiers", label: "Découverte métiers / immersion / plateaux techniques", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
      { id: "prep_tests_entree", label: "Préparation tests d'entrée", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
    ],
  },
  {
    id: "qualifiantes",
    label: "8. Formations qualifiantes métier (par filières)",
    items: [
      { id: "q_logistique", label: "Formation qualifiante – Logistique", certification_type: "tp", training_type: "professional", sectors: ["Logistique / Entrepôt"] },
      { id: "q_proprete", label: "Formation qualifiante – Propreté", certification_type: "tp", training_type: "professional", sectors: ["Propreté / Hygiène"] },
      { id: "q_aide_personne", label: "Formation qualifiante – Aide à la personne (ADVF…)", certification_type: "tp", training_type: "professional", sectors: ["Santé – Médico-social / Aide à la personne"] },
      { id: "q_hotel_resto", label: "Formation qualifiante – Hôtellerie / restauration", certification_type: "tp", training_type: "professional", sectors: ["Hôtellerie – Restauration"] },
      { id: "q_btp", label: "Formation qualifiante – BTP", certification_type: "tp", training_type: "professional", sectors: ["BTP / Travaux publics / Réseaux"] },
      { id: "q_commerce", label: "Formation qualifiante – Commerce / vente", certification_type: "tp", training_type: "professional", sectors: ["Commerce / Vente / Relation client"] },
      { id: "q_admin_accueil", label: "Formation qualifiante – Accueil / administratif / secrétariat", certification_type: "tp", training_type: "professional", sectors: ["Administration / Accueil / Secrétariat"] },
      { id: "q_securite", label: "Formation qualifiante – Sécurité", certification_type: "tp", training_type: "professional", sectors: ["Sécurité / Sûreté"] },
      { id: "q_industrie", label: "Formation qualifiante – Industrie / production", certification_type: "tp", training_type: "professional", sectors: ["Industrie / Production / Maintenance"] },
      { id: "q_numerique_it", label: "Formation qualifiante – Numérique / IT", certification_type: "tp", training_type: "professional", sectors: ["Administration / Accueil / Secrétariat", "Industrie / Production / Maintenance"] },
    ],
  },
  {
    id: "habilitations",
    label: "9. Habilitations / certifications courtes",
    items: [
      { id: "sst", label: "SST", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
      { id: "gestes_postures", label: "Gestes & postures / TMS", certification_type: "cqp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
      { id: "habilitations_elec", label: "Habilitation électrique (H0B0, BS/BE…)", certification_type: "cqp", training_type: "professional", sectors: ["BTP / Travaux publics / Réseaux", "Industrie / Production / Maintenance"] },
      { id: "caces", label: "CACES", certification_type: "cqp", training_type: "professional", sectors: ["Logistique / Entrepôt", "BTP / Travaux publics / Réseaux", "Industrie / Production / Maintenance"] },
      { id: "haccp", label: "HACCP", certification_type: "cqp", training_type: "professional", sectors: ["Hôtellerie – Restauration"] },
      { id: "aipr", label: "AIPR", certification_type: "cqp", training_type: "professional", sectors: ["BTP / Travaux publics / Réseaux"] },
      { id: "securite_incendie", label: "Sécurité incendie", certification_type: "cqp", training_type: "professional", sectors: ["Sécurité / Sûreté", "Hôtellerie – Restauration", "Industrie / Production / Maintenance"] },
      { id: "eco_conduite", label: "Éco-conduite / éco-mobilité", certification_type: "cqp", training_type: "professional", sectors: ["Transport / Livraison / Mobilité"] },
    ],
  },
  {
    id: "vae",
    label: "10. VAE / accompagnements",
    items: [
      { id: "accompagnement_vae", label: "Accompagnement VAE (dossier + oral)", certification_type: "tp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
      { id: "coaching_certification", label: "Coaching certification / dossier pro / oral jury", certification_type: "tp", training_type: "professional", sectors: ["Transversal (tous secteurs)"] },
    ],
  },
];

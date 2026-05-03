import { describe, it, expect } from "vitest";
import {
  computeOrientation,
  ACTIONS_LABELS,
  ACTIONS_LINKS,
  getActionContact,
  type ActionId,
  type UserResponses,
} from "../orientationEngine";

const baseResponses = (overrides: Partial<UserResponses> = {}): UserResponses => ({
  q1_interet: "travail",
  q2_droit_travailler: "oui",
  q3_france_travail: "oui",
  q4_niveau_francais: "B1plus",
  q5_objectif: "rapide",
  q6_secteur: "logistique",
  q7_contraintes: ["aucune"],
  q8_competences: ["aucune"],
  ...overrides,
});

describe("Orientation — labels & liens des contacts", () => {
  it("chaque ActionId a un label non vide et un lien https valide", () => {
    const ids = Object.keys(ACTIONS_LABELS) as ActionId[];
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      expect(ACTIONS_LABELS[id]).toBeTruthy();
      expect(ACTIONS_LINKS[id]).toMatch(/^https:\/\//);
      const c = getActionContact(id);
      expect(c.label).toBe(ACTIONS_LABELS[id]);
      expect(c.url).toBe(ACTIONS_LINKS[id]);
    }
  });

  it("LOGEMENT bloquant → contacts domiciliation + social + RDV", () => {
    const r = computeOrientation(baseResponses({ q_housing_blocking: true }));
    expect(r.parcours).toBe("LOGEMENT");
    expect(r.actions).toEqual(
      expect.arrayContaining(["CONTACT_DOMICILIATION", "CONTACT_SOCIAL", "RDV_CONSEILLER"])
    );
    expect(r.actionsLabels).toEqual(
      expect.arrayContaining([
        ACTIONS_LABELS.CONTACT_DOMICILIATION,
        ACTIONS_LABELS.CONTACT_SOCIAL,
      ])
    );
    expect(ACTIONS_LINKS.CONTACT_DOMICILIATION).toContain("service-public.fr");
  });

  it("BPI réfugié → AGIR en premier contact + lien officiel", () => {
    const r = computeOrientation(
      baseResponses({ q_statut_admin: "bpi_refugie", q4_niveau_francais: "A2" })
    );
    expect(r.parcours).toBe("BPI");
    expect(r.actions).toContain("CONTACT_AGIR");
    expect(ACTIONS_LINKS.CONTACT_AGIR).toContain("interieur.gouv.fr");
  });

  it("BPI subsidiaire + diplôme étranger → ajoute ENIC-NARIC", () => {
    const r = computeOrientation(
      baseResponses({ q_statut_admin: "bpi_subsidiaire", q_recognize_diploma: true })
    );
    expect(r.parcours).toBe("BPI");
    expect(r.actions).toContain("CONTACT_ENIC_NARIC");
    expect(ACTIONS_LINKS.CONTACT_ENIC_NARIC).toContain("enic-naric");
  });

  it("CIR signé + niveau A1 → CONTACT_OFII en tête, parcours OFII", () => {
    const r = computeOrientation(
      baseResponses({
        q1_interet: "francais",
        q4_niveau_francais: "A0A1",
        q_statut_admin: "cir_signed",
        q_ofii_hours_remaining: 200,
      })
    );
    expect(r.actions[0]).toBe("CONTACT_OFII");
    expect(r.parcours).toBe("OFII");
    expect(ACTIONS_LINKS.CONTACT_OFII).toContain("ofii.fr");
  });

  it("Besoin santé mentale → CONTACT_SANTE_MENTALE avec lien COMEDE", () => {
    const r = computeOrientation(baseResponses({ q9_besoins: ["sante_mentale"] }));
    expect(r.actions).toContain("CONTACT_SANTE_MENTALE");
    expect(ACTIONS_LINKS.CONTACT_SANTE_MENTALE).toContain("comede.org");
  });

  it("Pas de droit au travail → parcours ADMIN avec RDV + accompagnement social", () => {
    const r = computeOrientation(baseResponses({ q2_droit_travailler: "non" }));
    expect(r.parcours).toBe("ADMIN");
    expect(r.actions).toEqual(expect.arrayContaining(["RDV_CONSEILLER", "CONTACT_SOCIAL"]));
  });

  it("Toutes les actions retournées ont un label et un lien", () => {
    const cases: Partial<UserResponses>[] = [
      { q_housing_blocking: true },
      { q_statut_admin: "bpi_refugie" },
      { q_statut_admin: "cir_signed", q4_niveau_francais: "A0A1" },
      { q1_interet: "formation" },
      { q1_interet: "francais", q4_niveau_francais: "Alpha" },
      { q1_interet: "nsp" },
      { q9_besoins: ["sante_mentale"] },
      { q_recognize_diploma: true },
    ];
    for (const c of cases) {
      const r = computeOrientation(baseResponses(c));
      for (const a of r.actions) {
        expect(ACTIONS_LABELS[a], `label manquant pour ${a}`).toBeTruthy();
        expect(ACTIONS_LINKS[a], `lien manquant pour ${a}`).toMatch(/^https:\/\//);
      }
      expect(r.actionsLabels.length).toBe(r.actions.length);
    }
  });
});

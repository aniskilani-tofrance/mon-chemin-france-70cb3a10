import { describe, it, expect } from "vitest";
import { computeOrientation, type UserResponses } from "@/lib/orientationEngine";

const baseResponses = (overrides: Partial<UserResponses> = {}): UserResponses => ({
  q1_interet: "travail",
  q2_droit_travailler: "oui",
  q3_france_travail: "oui",
  q4_niveau_francais: "A2",
  q5_objectif: "rapide",
  q6_secteur: "logistique",
  q7_contraintes: ["aucune"],
  q8_competences: ["manutention"],
  ...overrides,
});

describe("orientationEngine — BPI", () => {
  it("statut bpi_refugie ⇒ parcours BPI + action CONTACT_AGIR", () => {
    const r = computeOrientation(baseResponses({ q_statut_admin: "bpi_refugie" }));
    expect(r.parcours).toBe("BPI");
    expect(r.actions).toContain("CONTACT_AGIR");
    expect(r.alertes.join(" ")).toMatch(/BPI|AGIR/);
  });

  it("statut bpi_subsidiaire ⇒ parcours BPI", () => {
    const r = computeOrientation(baseResponses({ q_statut_admin: "bpi_subsidiaire" }));
    expect(r.parcours).toBe("BPI");
    expect(r.actions).toContain("CONTACT_AGIR");
  });

  it("BPI + reconnaissance diplôme ⇒ ajoute CONTACT_ENIC_NARIC", () => {
    const r = computeOrientation(
      baseResponses({ q_statut_admin: "bpi_refugie", q_recognize_diploma: true })
    );
    expect(r.parcours).toBe("BPI");
    expect(r.actions).toContain("CONTACT_ENIC_NARIC");
  });
});

describe("orientationEngine — OFII / CIR", () => {
  it("CIR signé + niveau A2 ⇒ priorité OFII (CONTACT_OFII en tête)", () => {
    const r = computeOrientation(
      baseResponses({
        q1_interet: "francais",
        q_statut_admin: "cir_signed",
        q4_niveau_francais: "A2",
      })
    );
    expect(r.actions).toContain("CONTACT_OFII");
    expect(r.parcours).toBe("OFII");
    expect(r.alertes.join(" ")).toMatch(/OFII/);
  });

  it("Heures OFII restantes (>0) + niveau A0A1 ⇒ CONTACT_OFII", () => {
    const r = computeOrientation(
      baseResponses({
        q1_interet: "francais",
        q_ofii_hours_remaining: 200,
        q4_niveau_francais: "A0A1",
      })
    );
    expect(r.actions).toContain("CONTACT_OFII");
  });

  it("CIR en cours + niveau Alpha ⇒ alphabétisation prioritaire mais CONTACT_OFII présent", () => {
    const r = computeOrientation(
      baseResponses({
        q1_interet: "francais",
        q_statut_admin: "cir_in_progress",
        q4_niveau_francais: "Alpha",
      })
    );
    expect(r.actions).toContain("CONTACT_OFII");
    expect(r.actions).toContain("TEST_FRANCAIS");
  });

  it("Pas de CIR + niveau B1+ ⇒ pas de CONTACT_OFII", () => {
    const r = computeOrientation(
      baseResponses({
        q_statut_admin: "titre_sejour",
        q4_niveau_francais: "B1plus",
      })
    );
    expect(r.actions).not.toContain("CONTACT_OFII");
  });
});

describe("orientationEngine — priorités croisées", () => {
  it("Logement bloquant l'emporte sur BPI", () => {
    const r = computeOrientation(
      baseResponses({ q_statut_admin: "bpi_refugie", q_housing_blocking: true })
    );
    expect(r.parcours).toBe("LOGEMENT");
  });

  it("Demandeur d'asile sans droit travail ⇒ pas bloqué en ADMIN (exception asile)", () => {
    const r = computeOrientation(
      baseResponses({
        q_statut_admin: "demandeur_asile",
        q2_droit_travailler: "non",
      })
    );
    expect(r.parcours).not.toBe("ADMIN");
  });

  it("Sans-papiers + pas de droit travail ⇒ parcours ADMIN", () => {
    const r = computeOrientation(
      baseResponses({
        q_statut_admin: "sans_papiers",
        q2_droit_travailler: "non",
      })
    );
    expect(r.parcours).toBe("ADMIN");
  });
});

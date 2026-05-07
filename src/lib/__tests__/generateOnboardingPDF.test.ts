import { describe, it, expect } from "vitest";
import { buildOnboardingPDFHtml } from "../generateOnboardingPDF";

const ROUTES = [
  { route: "route_a", label: "Parcours FLE" },
  { route: "route_b", label: "Parcours Formation" },
  { route: "route_c", label: "Parcours Emploi" },
  { route: "sas", label: "Accompagnement personnalisé" },
];

const LEVELS = [
  { key: "alpha", label: "Ne parle pas français" },
  { key: "a1", label: "Débutant (A1)" },
  { key: "a2", label: "Se débrouille (A2)" },
  { key: "b1", label: "Intermédiaire (B1)" },
];

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("generateOnboardingPDF — rendu complet par scénario", () => {
  for (const r of ROUTES) {
    for (const lvl of LEVELS) {
      it(`${r.route} + niveau ${lvl.key} : route, CECRL et tags badges présents`, () => {
        const html = buildOnboardingPDFHtml({
          leadRoute: r.route,
          french_level_cecrl: lvl.key,
          tags: ["status_refugie", "needs_housing", "ready_to_work"],
          contact_firstname: "Test",
          contact_email: "t@t.fr",
        });
        const doc = parse(html);

        // Bloc parcours
        const routeBox = doc.querySelector('[data-testid="pdf-route"]');
        expect(routeBox).not.toBeNull();
        expect(routeBox?.getAttribute("data-route")).toBe(r.route);
        expect(routeBox?.textContent).toContain(r.label);

        // Bloc CECRL toujours présent + label humain
        const cecrl = doc.querySelector('[data-testid="pdf-cecrl"]');
        expect(cecrl).not.toBeNull();
        const value = cecrl?.querySelector(".cecrl-value");
        expect(value?.getAttribute("data-level")).toBe(lvl.key);
        expect(value?.textContent).toBe(lvl.label);

        // Tags : 3 badges, libellés humains, clés brutes préservées dans data-key
        const tagsBlock = doc.querySelector('[data-testid="pdf-tags"]');
        expect(tagsBlock).not.toBeNull();
        const badges = tagsBlock!.querySelectorAll(".tag-badge");
        expect(badges.length).toBe(3);
        const keys = Array.from(badges).map((b) => b.getAttribute("data-key"));
        expect(keys).toEqual(["status_refugie", "needs_housing", "ready_to_work"]);
        const labels = Array.from(badges).map((b) => b.textContent);
        expect(labels).toEqual(["Statut réfugié", "Besoin de logement", "Prêt à travailler"]);
      });
    }
  }

  it("affiche 'Non renseigné' quand le niveau CECRL est absent", () => {
    const html = buildOnboardingPDFHtml({ leadRoute: "route_a" });
    const doc = parse(html);
    const value = doc.querySelector('[data-testid="pdf-cecrl"] .cecrl-value');
    expect(value?.textContent).toBe("Non renseigné");
  });

  it("affiche 'Aucun tag' quand tags absent / vide / null", () => {
    for (const tags of [undefined, null, [], ""]) {
      const html = buildOnboardingPDFHtml({ leadRoute: "route_b", tags });
      const doc = parse(html);
      const tagsBlock = doc.querySelector('[data-testid="pdf-tags"]');
      expect(tagsBlock?.querySelector(".tag-empty")?.textContent).toBe("Aucun tag");
      expect(tagsBlock?.querySelectorAll(".tag-badge").length).toBe(0);
    }
  });

  it("supporte les tags en CSV string (préserve les clés HubSpot)", () => {
    const html = buildOnboardingPDFHtml({
      leadRoute: "route_c",
      tags: "status_refugie,needs_housing",
    });
    const doc = parse(html);
    const badges = doc.querySelectorAll('[data-testid="pdf-tags"] .tag-badge');
    expect(badges.length).toBe(2);
    expect(badges[0].getAttribute("data-key")).toBe("status_refugie");
    expect(badges[1].getAttribute("data-key")).toBe("needs_housing");
  });

  it("ne fait pas fuiter de clé snake_case brute dans les libellés visibles des tags connus", () => {
    const html = buildOnboardingPDFHtml({
      leadRoute: "route_a",
      tags: ["status_refugie", "needs_housing", "ready_to_work"],
    });
    const doc = parse(html);
    const labels = Array.from(
      doc.querySelectorAll('[data-testid="pdf-tags"] .tag-badge')
    ).map((b) => b.textContent || "");
    for (const l of labels) {
      expect(l).not.toMatch(/_/);
    }
  });

  it("sections obligatoires présentes pour chaque scénario (aucun élément manquant)", () => {
    for (const r of ROUTES) {
      const html = buildOnboardingPDFHtml({ leadRoute: r.route, tags: ["status_refugie"] });
      const doc = parse(html);
      expect(doc.querySelector('[data-testid="pdf-route"]')).not.toBeNull();
      expect(doc.querySelector('[data-testid="pdf-cecrl"]')).not.toBeNull();
      expect(doc.querySelector('[data-testid="pdf-tags"]')).not.toBeNull();
      // 3 prochaines étapes par parcours
      expect(html).toContain("Prochaines étapes");
      // Footer marque
      expect(html).toContain("contact@tofrance.life");
    }
  });

  it("traduit en français les valeurs du profil (pas de valeurs brutes en anglais)", () => {
    const html = buildOnboardingPDFHtml({
      leadRoute: "route_a",
      contact_firstname: "Salim",
      contact_email: "salim@test.fr",
      main_goal: "learn_french",
      french_level_cecrl: "a1",
      work_right: "no",
      target_sector: "hotellerie",
      mobility: ["bike"],
      literacy: "partial",
      barriers: ["childcare"],
      contact_48h: "yes",
    });
    const doc = parse(html);
    const text = doc.body.textContent || "";

    expect(text).toContain("Hôtellerie-restauration");
    expect(text).toContain("Vélo");
    expect(text).toContain("Lecture/écriture partielle");
    expect(text).toContain("Garde d'enfants");

    const cells = Array.from(doc.querySelectorAll("td")).map((c) => c.textContent || "");
    for (const raw of ["bike", "childcare", "partial", "hotellerie"]) {
      for (const cell of cells) {
        expect(cell).not.toBe(raw);
      }
    }
  });
});

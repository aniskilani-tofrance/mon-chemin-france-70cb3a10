import { describe, it, expect } from "vitest";
import {
  ONBOARDING_TREE,
  getNextQuestion,
  type OnboardingAnswers,
} from "@/lib/decisionTree";

const baseAnswers = (overrides: Partial<OnboardingAnswers> = {}): OnboardingAnswers => ({
  tags: [],
  ...overrides,
});

describe("decisionTree — BPI / OFII / CIR options", () => {
  it("admin_status question expose toutes les options BPI / OFPRA / asile", () => {
    const q = ONBOARDING_TREE.questions["admin_status"];
    expect(q).toBeDefined();
    const ids = q.choices?.map((c) => c.id) ?? [];
    expect(ids).toEqual(
      expect.arrayContaining([
        "titre_sejour",
        "bpi_refugie",
        "bpi_subsidiaire",
        "demandeur_asile",
        "sans_papiers",
        "ne_sait_pas",
      ])
    );
  });

  it("cir_status question expose toutes les options OFII (heures restantes / épuisées / en cours)", () => {
    const q = ONBOARDING_TREE.questions["cir_status"];
    expect(q).toBeDefined();
    const ids = q.choices?.map((c) => c.id) ?? [];
    expect(ids).toEqual(
      expect.arrayContaining([
        "signed_hours_left",
        "signed_used",
        "in_progress",
        "not_signed",
        "not_concerned",
        "dont_know",
      ])
    );
  });

  it("les choix BPI portent le tag 'bpi'", () => {
    const q = ONBOARDING_TREE.questions["admin_status"];
    const refugie = q.choices?.find((c) => c.id === "bpi_refugie");
    const subsidiaire = q.choices?.find((c) => c.id === "bpi_subsidiaire");
    expect(refugie?.tags).toContain("bpi");
    expect(subsidiaire?.tags).toContain("bpi");
  });

  it("CIR signed_hours_left porte le tag 'ofii_hours_available'", () => {
    const q = ONBOARDING_TREE.questions["cir_status"];
    const choice = q.choices?.find((c) => c.id === "signed_hours_left");
    expect(choice?.tags).toEqual(
      expect.arrayContaining(["cir_signed", "ofii_hours_available"])
    );
  });
});

describe("decisionTree — navigation admin_status → cir_status → work_right", () => {
  it("real_comprehension_test enchaîne sur admin_status", () => {
    const next = getNextQuestion("real_comprehension_test", "yes", baseAnswers());
    expect(next).toBe("admin_status");
  });

  it("admin_status (BPI réfugié) enchaîne sur cir_status", () => {
    const next = getNextQuestion(
      "admin_status",
      "bpi_refugie",
      baseAnswers({ admin_status: "bpi_refugie" })
    );
    expect(next).toBe("cir_status");
  });

  it("admin_status (titre de séjour) enchaîne aussi sur cir_status", () => {
    const next = getNextQuestion(
      "admin_status",
      "titre_sejour",
      baseAnswers({ admin_status: "titre_sejour" })
    );
    expect(next).toBe("cir_status");
  });

  it("cir_status (signed_hours_left) enchaîne sur work_right", () => {
    const next = getNextQuestion(
      "cir_status",
      "signed_hours_left",
      baseAnswers({ admin_status: "titre_sejour", cir_status: "signed_hours_left" })
    );
    expect(next).toBe("work_right");
  });

  it("cir_status (not_concerned) enchaîne sur work_right", () => {
    const next = getNextQuestion(
      "cir_status",
      "not_concerned",
      baseAnswers({ admin_status: "titre_sejour", cir_status: "not_concerned" })
    );
    expect(next).toBe("work_right");
  });

  it("scénario BPI complet : real_comprehension → admin → cir → work_right", () => {
    const path: string[] = ["real_comprehension_test"];
    const answers = baseAnswers();

    let next = getNextQuestion("real_comprehension_test", "yes", answers);
    expect(next).toBe("admin_status");
    path.push(next!);

    answers.admin_status = "bpi_refugie";
    next = getNextQuestion("admin_status", "bpi_refugie", answers);
    expect(next).toBe("cir_status");
    path.push(next!);

    answers.cir_status = "signed_hours_left";
    next = getNextQuestion("cir_status", "signed_hours_left", answers);
    expect(next).toBe("work_right");
    path.push(next!);

    expect(path).toEqual([
      "real_comprehension_test",
      "admin_status",
      "cir_status",
      "work_right",
    ]);
  });
});

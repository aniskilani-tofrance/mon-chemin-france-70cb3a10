import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ConfirmationPage from "../ConfirmationPage";
import { LanguageProvider } from "@/hooks/useLanguage";

// Mock heavy/irrelevant deps
vi.mock("@/lib/generateOnboardingPDF", () => ({
  generateOnboardingPDF: vi.fn(),
}));
vi.mock("@/components/Header", () => ({ Header: () => <header /> }));

function renderPage() {
  return render(
    <HelmetProvider>
      <LanguageProvider>
        <MemoryRouter>
          <ConfirmationPage />
        </MemoryRouter>
      </LanguageProvider>
    </HelmetProvider>
  );
}

describe("ConfirmationPage — Discover my path", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders without crashing when localStorage is empty (all values missing)", () => {
    renderPage();
    // Default route = sas → "Accompagnement personnalisé"
    expect(screen.getByText(/Accompagnement personnalisé/i)).toBeInTheDocument();
  });

  it("renders when main_goal is an ARRAY (multi-select) without throwing", () => {
    localStorage.setItem(
      "onboarding_answers",
      JSON.stringify({
        main_goal: ["learn_french", "find_job"],
        french_level_cecrl: "a2",
        contact_firstname: "Amine",
        contact_email: "amine@example.com",
        leadRoute: "route_a",
      })
    );
    renderPage();
    expect(screen.getAllByText(/Amine/).length).toBeGreaterThan(0);
    expect(screen.getByText(/amine@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/Parcours FLE/)).toBeInTheDocument();
    // multi-goal rendered as comma-joined labels
    expect(
      screen.getByText(/Apprendre le français.*Trouver un emploi/)
    ).toBeInTheDocument();
    // level mapped
    expect(screen.getByText(/Se débrouille \(A2\)/)).toBeInTheDocument();
  });

  it("renders when main_goal is a CSV string", () => {
    localStorage.setItem(
      "onboarding_answers",
      JSON.stringify({
        main_goal: "learn_french,find_job",
        leadRoute: "route_b",
      })
    );
    renderPage();
    expect(screen.getByText(/Parcours Formation/)).toBeInTheDocument();
    expect(
      screen.getByText(/Apprendre le français.*Trouver un emploi/)
    ).toBeInTheDocument();
  });

  it("handles unknown route gracefully (fallback to sas)", () => {
    localStorage.setItem(
      "onboarding_answers",
      JSON.stringify({ leadRoute: "unknown_route" })
    );
    renderPage();
    expect(screen.getByText(/Accompagnement personnalisé/)).toBeInTheDocument();
  });

  it("handles tags as array and as CSV string without crashing", () => {
    localStorage.setItem(
      "onboarding_answers",
      JSON.stringify({
        leadRoute: "route_c",
        contact_email: "x@y.fr",
        tags: ["status_refugie", "needs_housing"],
      })
    );
    const { unmount } = renderPage();
    expect(screen.getByText("status refugie")).toBeInTheDocument();
    expect(screen.getByText("needs housing")).toBeInTheDocument();
    unmount();
    localStorage.clear();

    localStorage.setItem(
      "onboarding_answers",
      JSON.stringify({
        leadRoute: "route_c",
        contact_email: "x@y.fr",
        tags: "status_refugie,needs_housing",
      })
    );
    renderPage();
    expect(screen.getByText("status refugie")).toBeInTheDocument();
  });

  it("ignores null / undefined fields without throwing", () => {
    localStorage.setItem(
      "onboarding_answers",
      JSON.stringify({
        main_goal: null,
        french_level_cecrl: undefined,
        work_right: null,
        leadRoute: "route_a",
      })
    );
    expect(() => renderPage()).not.toThrow();
    expect(screen.getByText(/Parcours FLE/)).toBeInTheDocument();

  // ─── Robustness fuzz: multi-select fields must NEVER crash the page ───
  describe("robustness — multi-select fields never crash", () => {
    const multiSelectFields = [
      "main_goal",
      "barriers",
      "tags",
      "target_sector",
      "fle_type",
    ];

    const weirdValues: Array<{ name: string; value: unknown }> = [
      { name: "null", value: null },
      { name: "undefined", value: undefined },
      { name: "empty string", value: "" },
      { name: "empty array", value: [] },
      { name: "array of strings", value: ["learn_french", "find_job"] },
      { name: "array with null/empty entries", value: [null, "", "find_job", undefined] },
      { name: "CSV string", value: "learn_french,find_job" },
      { name: "single string", value: "learn_french" },
      { name: "number", value: 42 },
      { name: "boolean", value: true },
      { name: "nested array", value: [["a", "b"], "c"] },
      { name: "object", value: { a: 1 } },
    ];

    for (const field of multiSelectFields) {
      for (const { name, value } of weirdValues) {
        it(`does not crash when ${field} is ${name}`, () => {
          localStorage.setItem(
            "onboarding_answers",
            JSON.stringify({ [field]: value, leadRoute: "route_a" })
          );
          expect(() => renderPage()).not.toThrow();
          // Page sentinel renders → no white screen
          expect(screen.getByText(/Parcours FLE/)).toBeInTheDocument();
        });
      }
    }

    it("does not crash when ALL multi-select fields are arrays simultaneously", () => {
      localStorage.setItem(
        "onboarding_answers",
        JSON.stringify({
          main_goal: ["learn_french", "find_job"],
          barriers: ["transport", "childcare"],
          tags: ["status_refugie", "needs_housing"],
          target_sector: ["logistique"],
          fle_type: ["intensive"],
          leadRoute: "route_b",
        })
      );
      expect(() => renderPage()).not.toThrow();
      expect(screen.getByText(/Parcours Formation/)).toBeInTheDocument();
    });

    it("does not crash when ALL multi-select fields are null", () => {
      localStorage.setItem(
        "onboarding_answers",
        JSON.stringify({
          main_goal: null,
          barriers: null,
          tags: null,
          target_sector: null,
          fle_type: null,
          leadRoute: "route_c",
        })
      );
      expect(() => renderPage()).not.toThrow();
      expect(screen.getByText(/Parcours Emploi/)).toBeInTheDocument();
    });
  });
});


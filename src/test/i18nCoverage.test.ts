import { describe, it, expect } from "vitest";
import fr from "@/i18n/locales/fr.json";
import en from "@/i18n/locales/en.json";
import ar from "@/i18n/locales/ar.json";
import es from "@/i18n/locales/es.json";
import pt from "@/i18n/locales/pt.json";
import ru from "@/i18n/locales/ru.json";
import { ONBOARDING_TREE } from "@/lib/decisionTree";

const SUPPORTED = ["fr", "en", "ar", "es", "pt", "ru"] as const;
type Lang = (typeof SUPPORTED)[number];

const LOCALES: Record<Lang, any> = { fr, en, ar, es, pt, ru };

type Leaf = { path: string; value: string };

function walk(obj: any, prefix = ""): Leaf[] {
  const out: Leaf[] = [];
  for (const [k, v] of Object.entries(obj || {})) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") out.push(...walk(v, path));
    else if (typeof v === "string") out.push({ path, value: v });
  }
  return out;
}

function getByPath(obj: any, path: string): unknown {
  return path.split(".").reduce<any>((acc, key) => (acc == null ? acc : acc[key]), obj);
}

// Paths whose value may legitimately match FR (proper nouns, brand, units, very short)
const ALLOW_SAME_AS_FR = (path: string, value: string): boolean => {
  const v = value.trim();
  if (v.length <= 2) return true; // single chars / digits
  if (/^[\p{Emoji}\s\d.,:/-]+$/u.test(v)) return true; // emoji-only / numeric
  if (/^[A-Z0-9]{1,5}$/.test(v)) return true; // codes (CIR, BPI, etc.)
  // Numeric ranges with units (km, m, h, €, %) shared across languages
  if (/^[<>≤≥]?\s*\d+([.,]\d+)?(\s*[-–]\s*\d+([.,]\d+)?)?\s*(km|m|h|€|%)?$/i.test(v)) return true;
  // Brand / proper nouns commonly identical across languages
  if (/^(ToFrance|France|Marianne|Lyon|Paris|Marseille|Stripe|WhatsApp|HubSpot|Email|OK)$/i.test(v)) return true;
  return false;
};

describe("i18n locale files — full key coverage (no missing translations)", () => {
  const frLeaves = walk(fr);

  for (const lang of SUPPORTED) {
    if (lang === "fr") continue;
    it(`${lang}.json contains every key present in fr.json`, () => {
      const missing: string[] = [];
      for (const { path } of frLeaves) {
        const v = getByPath(LOCALES[lang], path);
        if (typeof v !== "string" || v.trim() === "") missing.push(path);
      }
      expect(missing, `Missing/empty keys in ${lang}: ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? "…" : ""}`).toEqual([]);
    });
  }
});

describe("i18n locale files — no FR fallback strings leaking into other languages", () => {
  const frLeaves = walk(fr);

  for (const lang of SUPPORTED) {
    if (lang === "fr") continue;
    it(`${lang}.json values differ from fr.json for translated content`, () => {
      const leaks: string[] = [];
      for (const { path, value: frValue } of frLeaves) {
        const v = getByPath(LOCALES[lang], path);
        if (typeof v !== "string") continue;
        if (v === frValue && !ALLOW_SAME_AS_FR(path, frValue)) {
          leaks.push(`${path} = "${frValue}"`);
        }
      }
      expect(leaks, `FR leaking in ${lang}: ${leaks.slice(0, 5).join(" | ")}${leaks.length > 5 ? "…" : ""}`).toEqual([]);
    });
  }
});

describe("Decision tree — every question, subtitle and choice is translated for all supported languages", () => {
  for (const lang of SUPPORTED) {
    it(`all questions have a non-empty ${lang} translation`, () => {
      const missing: string[] = [];
      for (const [qid, q] of Object.entries(ONBOARDING_TREE.questions)) {
        const qText = q.question?.[lang];
        if (typeof qText !== "string" || qText.trim() === "") missing.push(`${qid}.question`);
        if (q.subtitle) {
          const sub = q.subtitle[lang];
          if (typeof sub !== "string" || sub.trim() === "") missing.push(`${qid}.subtitle`);
        }
        if (q.choices) {
          for (const choice of q.choices) {
            const cl = choice.label?.[lang];
            if (typeof cl !== "string" || cl.trim() === "") {
              missing.push(`${qid}.choices.${choice.id}.label`);
            }
          }
        }
        if (q.scaleLabels) {
          const sl = q.scaleLabels[lang];
          if (!sl || !sl.min || !sl.max) missing.push(`${qid}.scaleLabels`);
        }
      }
      expect(missing, `Missing decision-tree translations in ${lang}: ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? "…" : ""}`).toEqual([]);
    });

    if (lang === "fr") continue;
    it(`question texts in ${lang} are not identical to fr (no fallback)`, () => {
      const fallbacks: string[] = [];
      for (const [qid, q] of Object.entries(ONBOARDING_TREE.questions)) {
        const frText = q.question?.fr;
        const langText = q.question?.[lang];
        if (frText && langText && frText === langText && !ALLOW_SAME_AS_FR(qid, frText)) {
          fallbacks.push(`${qid}.question`);
        }
        if (q.subtitle?.fr && q.subtitle?.[lang] === q.subtitle.fr && !ALLOW_SAME_AS_FR(qid, q.subtitle.fr)) {
          fallbacks.push(`${qid}.subtitle`);
        }
        if (q.choices) {
          for (const c of q.choices) {
            if (c.label?.fr && c.label?.[lang] === c.label.fr && !ALLOW_SAME_AS_FR(c.id, c.label.fr)) {
              fallbacks.push(`${qid}.choices.${c.id}.label`);
            }
          }
        }
      }
      expect(fallbacks, `FR fallback in ${lang}: ${fallbacks.slice(0, 5).join(", ")}${fallbacks.length > 5 ? "…" : ""}`).toEqual([]);
    });
  }
});

describe("Validation & error strings — translated in every supported language", () => {
  // Critical user-facing validation/error paths used during the onboarding parcours
  const REQUIRED_ERROR_PATHS = [
    "onboardingVisual.postal_code.error",
    "onboardingVisual.postal_code.label",
    "onboardingVisual.postal_code.question",
    "onboardingVisual.email.question",
    "onboardingVisual.email.consent_lead",
    "onboardingVisual.actions.next",
    "onboardingVisual.actions.previous",
    "onboardingVisual.actions.skip",
    "onboardingVisual.actions.replay",
    "completion.profileCreated",
    "completion.discoverPath",
    "completion.score",
    "completion.summary",
    "completion.nextSteps",
    "completion.legalAlert",
    "completion.finalizing",
    "completion.copyWhatsapp",
  ];

  for (const lang of SUPPORTED) {
    it(`${lang} has every required validation/UI string`, () => {
      const missing: string[] = [];
      for (const path of REQUIRED_ERROR_PATHS) {
        const v = getByPath(LOCALES[lang], path);
        if (typeof v !== "string" || v.trim() === "") missing.push(path);
      }
      expect(missing).toEqual([]);
    });

    if (lang === "fr") continue;
    it(`${lang} validation/UI strings are not FR fallbacks`, () => {
      const leaks: string[] = [];
      for (const path of REQUIRED_ERROR_PATHS) {
        const frVal = getByPath(LOCALES.fr, path) as string;
        const v = getByPath(LOCALES[lang], path) as string;
        if (typeof v === "string" && typeof frVal === "string" && v === frVal && !ALLOW_SAME_AS_FR(path, frVal)) {
          leaks.push(path);
        }
      }
      expect(leaks).toEqual([]);
    });
  }
});

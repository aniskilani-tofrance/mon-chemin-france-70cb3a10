import { describe, expect, it } from "vitest";
import { isValidMarianneAccessCodeFormat, normalizeMarianneAccessCode } from "./marianneAccessCode";

describe("normalizeMarianneAccessCode", () => {
  it("supprime les espaces et met le code en majuscules", () => {
    expect(normalizeMarianneAccessCode(" ab 12 cd ")).toBe("AB12CD");
  });

  it("supprime la ponctuation et conserve uniquement lettres/chiffres", () => {
    expect(normalizeMarianneAccessCode("ma-ri.an_ne! 42")).toBe("MARIANNE42");
  });

  it("valide la longueur après normalisation", () => {
    expect(isValidMarianneAccessCodeFormat(" A-2 B!4 ")).toBe(true);
    expect(isValidMarianneAccessCodeFormat(" A-2 ")).toBe(false);
  });
});
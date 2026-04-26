import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { calculateQualificationScore } from "../_shared/hubspot-score.ts";

Deno.test("calculateQualificationScore returns 100 for a fully qualified lead", () => {
  assertEquals(calculateQualificationScore({
    phone: "0612345678",
    consentement_rappel: true,
    consentement_transmission: true,
    besoin_principal: "formation",
    niveau_francais: "a2",
  }), 100);
});

Deno.test("calculateQualificationScore handles missing optional fields", () => {
  assertEquals(calculateQualificationScore({
    phone: "",
    consentement_rappel: false,
    consentement_transmission: true,
    besoin_principal: "emploi",
    niveau_francais: null,
  }), 40);
});

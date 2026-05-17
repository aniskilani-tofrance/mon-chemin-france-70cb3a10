// Translates short diagnostic answers between French and the learner's native language.
// Uses Lovable AI Gateway (no API key needed, LOVABLE_API_KEY auto-provisioned).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TranslateRequest {
  text: string;
  source_lang: string; // 'fr' | 'ar' | 'en' | 'es' | 'pt' | 'ru'
  target_lang: string;
}

const LANG_NAMES: Record<string, string> = {
  fr: "French",
  ar: "Arabic",
  en: "English",
  es: "Spanish",
  pt: "Portuguese",
  ru: "Russian",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, source_lang, target_lang } =
      (await req.json()) as TranslateRequest;

    if (!text || !source_lang || !target_lang) {
      return new Response(
        JSON.stringify({ error: "Missing text/source_lang/target_lang" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Cap input size to limit abuse of paid AI credits
    if (typeof text !== "string" || text.length > 2000) {
      return new Response(JSON.stringify({ error: "Text too long (max 2000 chars)" }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (source_lang === target_lang) {
      return new Response(JSON.stringify({ translation: text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const sourceName = LANG_NAMES[source_lang] || source_lang;
    const targetName = LANG_NAMES[target_lang] || target_lang;

    const systemPrompt = `You are a professional translator specialized in social work and integration in France (CIP context). Translate from ${sourceName} to ${targetName}. 
Rules:
- Output ONLY the translation, no explanation, no quotes.
- Keep the tone simple, warm, respectful — the user may have low literacy.
- Preserve proper nouns and numbers.
- If text is already in the target language, return it unchanged.`;

    const resp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
        }),
      }
    );

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessayez dans un instant." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA épuisés sur l'espace de travail." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await resp.text();
      console.error("Gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "Translation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const translation =
      data?.choices?.[0]?.message?.content?.trim() ?? text;

    return new Response(JSON.stringify({ translation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate-diagnostic error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

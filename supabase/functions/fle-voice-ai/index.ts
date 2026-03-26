import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const { action, user_answer, expected_answer, prompt_text, exercise_type, user_level, language } = await req.json();

    let systemPrompt = "";
    let userMessage = "";

    if (action === "feedback") {
      systemPrompt = `Tu es Marianne, une assistante pédagogique FLE (Français Langue Étrangère) bienveillante et encourageante.
Tu aides des apprenants primo-arrivants en France de niveau ${user_level || "A1"}.

RÈGLES STRICTES :
- Réponds TOUJOURS en JSON valide avec cette structure : {"score": number 0-100, "feedback": "string", "correction": "string|null", "encouragement": "string", "pronunciation_tip": "string|null"}
- Le feedback doit être COURT (1-2 phrases max), SIMPLE, ENCOURAGEANT
- Utilise un ton chaleureux, jamais jugeant
- Si la réponse est bonne : félicite avec enthousiasme ("Bravo !", "Très bien !", "Excellent !")
- Si la réponse est approximative : encourage et corrige doucement
- Si la réponse est incorrecte : reste positif, donne la bonne réponse, encourage à réessayer
- Les tips de prononciation doivent être concrets et simples
- Adapte la complexité de tes réponses au niveau de l'apprenant
- N'utilise JAMAIS de jargon linguistique complexe`;

      userMessage = `Type d'exercice : ${exercise_type}
Consigne : "${prompt_text}"
Réponse attendue : "${expected_answer}"
Réponse de l'apprenant : "${user_answer}"
Langue maternelle de l'apprenant : ${language || "inconnue"}

Évalue la réponse et donne un feedback bienveillant en JSON.`;
    } else if (action === "dialogue") {
      systemPrompt = `Tu es Marianne, une assistante conversationnelle FLE pour des apprenants de niveau ${user_level || "A1"}.
Tu simules des dialogues de la vie quotidienne en France.

RÈGLES :
- Parle SIMPLEMENT avec des phrases courtes
- Pose UNE question à la fois
- Utilise du vocabulaire de base
- Sois patiente et encourageante
- Reformule si l'apprenant ne comprend pas
- Réponds en JSON : {"response": "string", "suggestion": "string|null", "is_end": boolean}
- "suggestion" est une aide pour l'apprenant s'il ne sait pas quoi répondre
- Reste dans le contexte de la situation donnée`;

      userMessage = `Situation : ${prompt_text}
L'apprenant dit : "${user_answer}"

Continue le dialogue en JSON.`;
    } else if (action === "generate_exercise") {
      systemPrompt = `Tu es un expert en pédagogie FLE. Génère un exercice adapté au niveau ${user_level || "A1"}.

Réponds TOUJOURS en JSON valide :
{
  "prompt_text": "string - la consigne en français simple",
  "correct_answer": "string - la réponse attendue", 
  "choices": ["string array - 3-4 choix si QCM, sinon vide"],
  "hint_text": "string - un indice pour aider",
  "difficulty": number 1-5
}`;

      userMessage = `Génère un exercice de type "${exercise_type}" sur le thème "${prompt_text}".
Niveau : ${user_level}
Langue de l'apprenant : ${language || "inconnue"}`;
    } else {
      throw new Error("Action non reconnue : " + action);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans quelques secondes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits épuisés. Veuillez recharger votre compte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      throw new Error(`AI Gateway error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse as JSON, fallback to raw content
    let parsed;
    try {
      // Remove markdown code blocks if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { raw: content };
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("FLE voice AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

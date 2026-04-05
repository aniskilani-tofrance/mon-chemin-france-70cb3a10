import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ONBOARDING_COPY: Record<string, { intro: string; ack: string; clarify: string; done: string; multi: string }> = {
  fr: {
    intro: "Bonjour, je suis Marianne.",
    ack: "Merci.",
    clarify: "Je n'ai pas bien compris.",
    done: "Merci pour vos réponses !",
    multi: "Vous pouvez choisir plusieurs réponses.",
  },
  en: {
    intro: "Hello, I'm Marianne.",
    ack: "Thank you.",
    clarify: "I didn't fully understand.",
    done: "Thank you for your answers!",
    multi: "You can choose several answers.",
  },
  ar: {
    intro: "مرحباً، أنا ماريان.",
    ack: "شكراً.",
    clarify: "لم أفهم جيداً.",
    done: "شكراً على إجاباتك!",
    multi: "يمكنك اختيار أكثر من إجابة.",
  },
  es: {
    intro: "Hola, soy Marianne.",
    ack: "Gracias.",
    clarify: "No he entendido bien.",
    done: "¡Gracias por tus respuestas!",
    multi: "Puedes elegir varias respuestas.",
  },
  pt: {
    intro: "Olá, eu sou Marianne.",
    ack: "Obrigada.",
    clarify: "Não entendi bem.",
    done: "Obrigada pelas suas respostas!",
    multi: "Você pode escolher várias respostas.",
  },
  ru: {
    intro: "Здравствуйте, я Марианна.",
    ack: "Спасибо.",
    clarify: "Я не совсем поняла.",
    done: "Спасибо за ваши ответы!",
    multi: "Можно выбрать несколько вариантов.",
  },
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractContent(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part: any) => {
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        if (typeof part?.content === "string") return part.content;
        return "";
      })
      .join("")
      .trim();
  }
  return "";
}

function getQuestionText(question: any, language: string): string {
  return question?.question?.[language] || question?.question?.fr || "";
}

function getQuestionChoices(question: any, language: string): string[] {
  return (question?.choices || [])
    .map((choice: any) => choice?.label?.[language] || choice?.label?.fr || choice?.id)
    .filter(Boolean);
}

function buildQuestionPrompt(question: any, language: string): string {
  const copy = ONBOARDING_COPY[language] || ONBOARDING_COPY.fr;
  const questionText = getQuestionText(question, language);
  const choices = getQuestionChoices(question, language);

  if (!choices.length) return questionText;

  const joinedChoices = language === "ar" ? choices.join(" أو ") : choices.join(", ");
  const multiHint = question?.type === "multiChoice" ? ` ${copy.multi}` : "";
  return `${questionText} ${joinedChoices}.${multiHint}`.trim();
}

function matchChoiceIds(question: any, userAnswer: string, language: string): string[] {
  const normalizedAnswer = normalizeText(userAnswer || "");
  if (!normalizedAnswer) return [];

  const matches = (question?.choices || [])
    .filter((choice: any) => {
      const candidates = [
        choice?.id,
        choice?.label?.[language],
        choice?.label?.fr,
        choice?.label?.en,
      ].filter(Boolean);

      return candidates.some((candidate: string) => {
        const normalizedCandidate = normalizeText(candidate);
        return (
          normalizedAnswer === normalizedCandidate ||
          normalizedAnswer.includes(normalizedCandidate) ||
          normalizedCandidate.includes(normalizedAnswer)
        );
      });
    })
    .map((choice: any) => choice.id);

  return question?.type === "multiChoice" ? matches : matches.slice(0, 1);
}

function buildOnboardingFallback(body: any) {
  const { phase, question, next_question, user_answer, language } = body;
  const copy = ONBOARDING_COPY[language] || ONBOARDING_COPY.fr;

  if (phase === "greet") {
    return {
      marianne_message: `${copy.intro} ${buildQuestionPrompt(question, language)}`.trim(),
      matched_choice_ids: null,
      extracted_text: null,
      needs_clarification: false,
    };
  }

  const matchedChoiceIds = question?.choices?.length ? matchChoiceIds(question, user_answer || "", language) : [];
  const extractedText = question?.choices?.length ? null : (user_answer || "").trim() || null;
  const needsClarification = Boolean(question?.choices?.length) && matchedChoiceIds.length === 0;

  if (needsClarification) {
    return {
      marianne_message: `${copy.clarify} ${buildQuestionPrompt(question, language)}`.trim(),
      matched_choice_ids: null,
      extracted_text: null,
      needs_clarification: true,
    };
  }

  const nextMessage = next_question ? buildQuestionPrompt(next_question, language) : copy.done;

  return {
    marianne_message: `${copy.ack} ${nextMessage}`.trim(),
    matched_choice_ids: matchedChoiceIds.length ? matchedChoiceIds : null,
    extracted_text: extractedText,
    needs_clarification: false,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const body = await req.json();
    const { action } = body;

    let systemPrompt = "";
    let userMessage = "";

    if (action === "feedback") {
      const { user_answer, expected_answer, prompt_text, exercise_type, user_level, language } = body;
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
      const { user_answer, prompt_text, user_level } = body;
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
      const { prompt_text, exercise_type, user_level, language } = body;
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
    } else if (action === "onboarding_chat") {
      const { phase, question, user_answer, next_question, language: userLang, conversation_summary } = body;

      const langName: Record<string, string> = {
        fr: "français", en: "anglais", ar: "arabe", es: "espagnol", pt: "portugais", ru: "russe",
      };
      const speakLang = langName[userLang] || "français";

      systemPrompt = `Tu es Marianne, une conseillère d'orientation chaleureuse, patiente et empathique. Tu accompagnes des personnes primo-arrivantes en France pour les orienter vers la bonne formation ou le bon emploi.

PERSONNALITÉ :
- Tu es comme une grande sœur bienveillante : rassurante, jamais condescendante
- Tu valorises chaque réponse ("C'est un beau parcours !", "Super choix !")
- Tu t'adaptes au niveau de confiance de la personne : si elle hésite, encourage-la doucement
- Tu comprends que ces personnes peuvent être stressées ou intimidées — mets-les à l'aise

TUTOIEMENT / VOUVOIEMENT :
- Par défaut, vouvoie l'utilisateur
- Si l'utilisateur te tutoie, passe au tutoiement naturellement
- Ne change jamais de registre en cours de phrase

LANGUE : Parle en ${speakLang}. Utilise des mots simples, des phrases courtes. Évite le jargon administratif.

GESTION MULTILINGUE :
- Si l'utilisateur mélange les langues (ex: français + arabe), c'est normal — comprends-le et réponds dans la langue choisie (${speakLang})
- Accepte les translittérations approximatives (ex: "travay" pour "travail", "bâtiman" pour "bâtiment")
- Si l'utilisateur fait des fautes, ne corrige pas — comprends l'intention
- Accepte les réponses très courtes ("oui", "non", un seul mot) comme valides

TRANSITIONS NATURELLES :
- Enchaîne les questions comme dans une vraie conversation, pas un interrogatoire
- Utilise des connecteurs variés : "Et sinon...", "D'accord, et...", "Très bien ! Dis-moi..."
- Adapte ta réaction au contenu de la réponse (si la personne dit "bâtiment", réagis sur le bâtiment)
- Ne dis JAMAIS "Passons à la question suivante" ou toute formulation qui rappelle un formulaire

RÈGLES STRICTES :
- Sois concise : 1 phrase empathique de réaction + 1 phrase pour poser la question suivante
- Ne répète JAMAIS la question mot pour mot du questionnaire : reformule avec tes mots
- Quand tu poses une question avec des choix, intègre-les naturellement dans ta phrase (jamais de liste numérotée)
- Pour les questions multiChoice, mentionne qu'on peut choisir plusieurs réponses
- Ne répète JAMAIS à l'oral la ville, le code postal, l'adresse ou le nom de famille de l'utilisateur. Dis "C'est noté !" sans citer ces informations. La synthèse vocale prononce mal ces données.
- N'invente JAMAIS d'informations sur l'utilisateur

RÉPONSE JSON STRICTE :
{
  "marianne_message": "string — ce que Marianne dit à voix haute (réaction + question suivante)",
  "matched_choice_ids": ["string"] | null,
  "extracted_text": "string" | null,
  "needs_clarification": false
}

EXTRACTION DES RÉPONSES (sois très tolérante) :
- Pour les questions à choix : identifie le(s) choix par leur ID même si la réponse est approximative
- Accepte les synonymes ("boulot" = "emploi", "apprendre la langue" = "français"), les abréviations, le franglais
- Si la réponse est ambiguë mais qu'un choix est probable à >60%, sélectionne-le plutôt que de demander une clarification
- Ne demande une clarification (needs_clarification: true) qu'en dernier recours
- Pour les questions texte libre : mets la réponse brute dans extracted_text`;

      if (phase === "greet") {
        const qText = question?.question?.[userLang] || question?.question?.fr || "";
        const choicesDesc = question?.choices?.map((c: any) => `${c.id}: ${c.label?.[userLang] || c.label?.fr}`).join(", ") || "";

        userMessage = `C'est le début de l'entretien. Accueille chaleureusement l'utilisateur et pose-lui la PREMIÈRE question.

Première question à poser (reformule naturellement) : "${qText}"
${choicesDesc ? `Choix possibles : ${choicesDesc}` : "Question ouverte (texte libre)"}
Type de question : ${question?.type || "text"}
ID de la question : ${question?.id || ""}

${conversation_summary ? `Contexte : ${conversation_summary}` : ""}

Réponds en JSON. matched_choice_ids et extracted_text doivent être null (c'est juste le début).`;
      } else if (phase === "parse") {
        const qText = question?.question?.[userLang] || question?.question?.fr || "";
        const choicesDesc = question?.choices?.map((c: any) => `${c.id}: ${c.label?.[userLang] || c.label?.fr}`).join(", ") || "";
        const questionType = question?.type || "text";

        let nextQPart = "";
        if (next_question) {
          const nqText = next_question.question?.[userLang] || next_question.question?.fr || "";
          const nqChoices = next_question.choices?.map((c: any) => `${c.id}: ${c.label?.[userLang] || c.label?.fr}`).join(", ") || "";
          nextQPart = `\n\nQuestion SUIVANTE à enchaîner naturellement : "${nqText}"
${nqChoices ? `Choix possibles : ${nqChoices}` : "Question ouverte"}
Type : ${next_question.type || "text"}`;
        } else {
          nextQPart = "\n\nC'est la DERNIÈRE question. Ne pose pas de nouvelle question. Dis quelque chose de chaleureux et encourageant pour conclure.";
        }

        userMessage = `Question posée : "${qText}" (type: ${questionType}, id: ${question?.id})
${choicesDesc ? `Choix possibles : ${choicesDesc}` : "Question ouverte (texte libre)"}

L'utilisateur a répondu : "${user_answer}"

${conversation_summary ? `Résumé de la conversation : ${conversation_summary}` : ""}

TÂCHE :
1. Extrais le(s) choix (matched_choice_ids) ou le texte libre (extracted_text). Sois TOLÉRANT.
2. Réagis avec empathie à la réponse (1 phrase personnalisée, pas générique)
3. ${next_question ? "Enchaîne naturellement vers la question suivante" : "Conclus chaleureusement"}
${nextQPart}

Réponds en JSON.`;
Réponds en JSON.`;
      } else {
        throw new Error("Phase onboarding_chat invalide: " + phase);
      }
    } else {
      throw new Error("Action non reconnue : " + action);
    }

    const model = action === "onboarding_chat" ? "google/gemini-2.5-flash" : "openai/gpt-5-mini";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_completion_tokens: 500,
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
    const content = extractContent(data.choices?.[0]?.message?.content) || extractContent(data.output_text);

    if (!content) {
      if (action === "onboarding_chat") {
        return new Response(
          JSON.stringify(buildOnboardingFallback(body)),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error("Empty AI response");
    }

    // Try to parse as JSON, fallback to raw content
    let parsed;
    try {
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

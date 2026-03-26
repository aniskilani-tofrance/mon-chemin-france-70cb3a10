import { supabase } from "@/integrations/supabase/client";

export interface FLEFeedbackRequest {
  action: "feedback" | "dialogue" | "generate_exercise";
  user_answer?: string;
  expected_answer?: string;
  prompt_text?: string;
  exercise_type?: string;
  user_level?: string;
  language?: string;
}

export interface FLEFeedbackResponse {
  score?: number;
  feedback?: string;
  correction?: string | null;
  encouragement?: string;
  pronunciation_tip?: string | null;
  // dialogue
  response?: string;
  suggestion?: string | null;
  is_end?: boolean;
  // generate
  prompt_text?: string;
  correct_answer?: string;
  choices?: string[];
  hint_text?: string;
  difficulty?: number;
  // error
  error?: string;
}

export async function callFLEVoiceAI(request: FLEFeedbackRequest): Promise<FLEFeedbackResponse> {
  const { data, error } = await supabase.functions.invoke("fle-voice-ai", {
    body: request,
  });

  if (error) {
    throw new Error(error.message || "Erreur lors de l'appel IA");
  }

  return data as FLEFeedbackResponse;
}

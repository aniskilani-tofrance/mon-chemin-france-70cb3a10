import { supabase } from "@/integrations/supabase/client";
import { LanguageCode } from "@/lib/translations";

export interface OnboardingChatRequest {
  action: "onboarding_chat";
  phase: "greet" | "parse";
  question?: any;
  user_answer?: string;
  next_question?: any | null;
  language: LanguageCode;
  conversation_summary?: string;
}

export interface OnboardingChatResponse {
  marianne_message: string;
  matched_choice_ids: string[] | null;
  extracted_text: string | null;
  needs_clarification: boolean;
  error?: string;
}

export async function callOnboardingChat(request: OnboardingChatRequest): Promise<OnboardingChatResponse> {
  const { data, error } = await supabase.functions.invoke("fle-voice-ai", {
    body: request,
  });

  if (error) {
    throw new Error(error.message || "Erreur lors de l'appel IA");
  }

  // Normalize response
  return {
    marianne_message: data?.marianne_message || data?.raw || "Je suis désolée, pouvez-vous répéter ?",
    matched_choice_ids: data?.matched_choice_ids || null,
    extracted_text: data?.extracted_text || null,
    needs_clarification: data?.needs_clarification || false,
  };
}

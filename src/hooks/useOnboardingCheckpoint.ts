import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LanguageCode } from "@/lib/translations";

const SESSION_KEY = "onboarding_session_id";

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export interface CheckpointPayload {
  step: string;
  answers: Record<string, any>;
  email?: string;
  language: LanguageCode;
}

export interface CheckpointData {
  id: string;
  current_step: string;
  partial_answers: Record<string, any>;
  email: string | null;
  language: string;
  completed: boolean;
}

/**
 * Sauvegarde + reprise de l'onboarding.
 * - Stocke un session_id local pour identifier l'utilisateur anonyme
 * - Upsert dans onboarding_checkpoints (debounced 600ms)
 * - Charge le dernier checkpoint via email ou user_id
 */
export function useOnboardingCheckpoint() {
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const currentIdRef = useRef<string | null>(null);

  const saveCheckpoint = useCallback((payload: CheckpointPayload) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id || null;

        // On enregistre côté DB uniquement si on a un user_id (auth requise pour RLS)
        // OU si on a un email (utilisé comme clé de reprise après magic link).
        // Sinon on stocke en localStorage seulement.
        if (!userId && !payload.email) {
          localStorage.setItem(
            "onboarding_checkpoint_local",
            JSON.stringify({
              ...payload,
              session_id: getOrCreateSessionId(),
              updated_at: new Date().toISOString(),
            })
          );
          return;
        }

        // Si user_id : upsert via user_id
        if (userId) {
          const { data: existing } = await supabase
            .from("onboarding_checkpoints")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

          if (existing?.id) {
            await supabase
              .from("onboarding_checkpoints")
              .update({
                current_step: payload.step,
                partial_answers: payload.answers,
                email: payload.email ?? null,
                language: payload.language,
              })
              .eq("id", existing.id);
            currentIdRef.current = existing.id;
          } else {
            const { data: inserted } = await supabase
              .from("onboarding_checkpoints")
              .insert({
                user_id: userId,
                current_step: payload.step,
                partial_answers: payload.answers,
                email: payload.email ?? null,
                language: payload.language,
              })
              .select("id")
              .single();
            currentIdRef.current = inserted?.id ?? null;
          }
        }

        // Toujours faire un backup localStorage
        localStorage.setItem(
          "onboarding_checkpoint_local",
          JSON.stringify({
            ...payload,
            session_id: getOrCreateSessionId(),
            updated_at: new Date().toISOString(),
          })
        );
      } catch (err) {
        console.error("[checkpoint] save error", err);
      }
    }, 600);
  }, []);

  const loadCheckpoint = useCallback(async (
    opts: { email?: string } = {}
  ): Promise<CheckpointData | null> => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      // 1. Si user connecté : chercher par user_id
      if (userId) {
        const { data } = await supabase
          .from("onboarding_checkpoints")
          .select("id, current_step, partial_answers, email, language, completed")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) {
          currentIdRef.current = data.id;
          return data as CheckpointData;
        }
      }

      // 2. Sinon (ou pas trouvé), tenter par email
      const email = opts.email || userData.user?.email;
      if (email) {
        const { data } = await supabase
          .from("onboarding_checkpoints")
          .select("id, current_step, partial_answers, email, language, completed")
          .eq("email", email)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) {
          currentIdRef.current = data.id;
          return data as CheckpointData;
        }
      }

      // 3. Fallback localStorage
      const local = localStorage.getItem("onboarding_checkpoint_local");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          return {
            id: "local",
            current_step: parsed.step,
            partial_answers: parsed.answers || {},
            email: parsed.email ?? null,
            language: parsed.language || "fr",
            completed: false,
          };
        } catch {}
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const markCompleted = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (userId) {
        await supabase
          .from("onboarding_checkpoints")
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq("user_id", userId);
      }
      localStorage.removeItem("onboarding_checkpoint_local");
    } catch (err) {
      console.error("[checkpoint] markCompleted error", err);
    }
  }, []);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { saveCheckpoint, loadCheckpoint, markCompleted, loading };
}

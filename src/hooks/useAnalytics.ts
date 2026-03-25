import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Generate a session ID that persists for the browser session
function getSessionId(): string {
  let id = sessionStorage.getItem("tf_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("tf_session_id", id);
  }
  return id;
}

type EventData = Record<string, string | number | boolean | null>;

export function useAnalytics() {
  const sessionId = useRef(getSessionId());

  const track = useCallback(
    async (eventType: string, eventData?: EventData, page?: string, language?: string) => {
      try {
        await supabase.from("analytics_events").insert({
          session_id: sessionId.current,
          event_type: eventType,
          event_data: eventData ?? {},
          page: page ?? window.location.pathname,
          language: language ?? null,
        });
      } catch (e) {
        // Silent fail — analytics should never break UX
        console.warn("[analytics]", e);
      }
    },
    []
  );

  return { track, sessionId: sessionId.current };
}

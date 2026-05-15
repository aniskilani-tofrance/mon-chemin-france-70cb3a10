import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserEstablishment {
  id: string;
  name: string;
  city?: string | null;
}

/**
 * Returns the establishment (training_provider) the current user belongs to,
 * either as owner (training_providers.user_id) or as member (provider_members).
 */
export function useUserEstablishment() {
  const { user } = useAuth();
  const [establishment, setEstablishment] = useState<UserEstablishment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setEstablishment(null);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);

      // 1) Owner
      const { data: owned } = await supabase
        .from("training_providers")
        .select("id, name, city")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cancelled && owned) {
        setEstablishment(owned);
        setLoading(false);
        return;
      }

      // 2) Member (via provider_members)
      const { data: membership } = await supabase
        .from("provider_members")
        .select("provider_id, training_providers:provider_id (id, name, city)")
        .or(`user_id.eq.${user.id},email.eq.${user.email ?? ""}`)
        .neq("status", "disabled")
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        const tp = (membership as any)?.training_providers ?? null;
        setEstablishment(tp);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.email]);

  return { establishment, loading };
}

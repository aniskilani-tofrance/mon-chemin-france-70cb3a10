import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingUserId, setPendingUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setPendingUserId(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setLoading(true);
      setPendingUserId(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (pendingUserId === undefined) return;

    let cancelled = false;

    const check = async () => {
      setLoading(true);

      if (!pendingUserId) {
        if (cancelled) return;
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("has_role", {
        _user_id: pendingUserId,
        _role: "admin",
      });

      if (cancelled) return;
      setIsAdmin(!error && !!data);
      setLoading(false);
    };

    void check();

    return () => {
      cancelled = true;
    };
  }, [pendingUserId]);

  return { isAdmin, loading };
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async (userId?: string | null) => {
      setLoading(true);

      if (!userId) {
        if (!mounted) return;
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });

      if (!mounted) return;
      setIsAdmin(!error && !!data);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      void check(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void check(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, loading };
}

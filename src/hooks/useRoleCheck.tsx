import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export function useRoleCheck(role: AppRole) {
  const [hasRole, setHasRole] = useState(false);
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
        setHasRole(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase.rpc("has_role", {
        _user_id: pendingUserId,
        _role: role,
      });

      if (cancelled) return;
      setHasRole(!!data);
      setLoading(false);
    };

    void check();

    return () => {
      cancelled = true;
    };
  }, [pendingUserId, role]);

  return { hasRole, loading };
}

/**
 * Detect the primary role of the current user for redirect purposes.
 * Priority: admin > directeur > formateur > default
 */
export async function detectUserRole(userId: string): Promise<string> {
  const roles: AppRole[] = ["admin", "directeur", "conseiller", "cip", "formateur", "benevole"];
  for (const role of roles) {
    const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: role });
    if (data) return role;
  }
  return "user";
}

export function getRoleDashboardPath(role: string): string {
  switch (role) {
    case "admin": return "/admin";
    case "directeur": return "/directeur";
    case "conseiller": return "/conseiller";
    case "cip": return "/cip";
    case "formateur": return "/formateur";
    case "benevole": return "/partner-dashboard";
    default: return "/dashboard";
  }
}

export function isStaffRole(role: string): boolean {
  return ["admin", "directeur", "conseiller", "cip", "formateur", "benevole"].includes(role);
}

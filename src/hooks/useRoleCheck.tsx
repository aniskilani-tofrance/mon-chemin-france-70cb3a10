import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export function useRoleCheck(role: AppRole) {
  const [hasRole, setHasRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasRole(false);
        setLoading(false);
        return;
      }
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: role,
      });
      setHasRole(!!data);
      setLoading(false);
    };
    check();
  }, [role]);

  return { hasRole, loading };
}

/**
 * Detect the primary role of the current user for redirect purposes.
 * Priority: admin > directeur > formateur > default
 */
export async function detectUserRole(userId: string): Promise<string> {
  const roles: AppRole[] = ["admin", "directeur", "formateur"];
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
    case "formateur": return "/formateur";
    default: return "/dashboard";
  }
}

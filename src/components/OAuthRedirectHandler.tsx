import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { detectUserRole, getRoleDashboardPath } from "@/hooks/useRoleCheck";

export function OAuthRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const handled = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session && !handled.current) {
          // Only redirect from root or login page (OAuth callback lands here)
          if (location.pathname !== "/" && location.pathname !== "/login") return;
          handled.current = true;

          const redirect = sessionStorage.getItem("postLoginRedirect");
          if (redirect?.startsWith("/") && !redirect.startsWith("//")) {
            sessionStorage.removeItem("postLoginRedirect");
            navigate(redirect, { replace: true });
            return;
          }

          const role = await detectUserRole(session.user.id);
          navigate(getRoleDashboardPath(role), { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return null;
}

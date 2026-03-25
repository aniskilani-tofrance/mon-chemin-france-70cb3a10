import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

          const { data: isAdmin } = await supabase.rpc("has_role", {
            _user_id: session.user.id,
            _role: "admin",
          });

          navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return null;
}

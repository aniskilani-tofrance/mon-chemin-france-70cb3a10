import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Loader2 } from "lucide-react";

interface FormateurRouteProps {
  children: React.ReactNode;
}

export function FormateurRoute({ children }: FormateurRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, loading: roleLoading } = useRoleCheck("formateur");

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!hasRole) return <Navigate to="/" replace />;

  return <>{children}</>;
}

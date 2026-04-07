import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingResult } from "@/hooks/useOnboardingResult";
import { FLEOnboardingGate } from "@/components/FLEOnboardingGate";
import { LoadingScreen } from "@/components/LoadingScreen";

export function FLEGatedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { data: onboardingResult, isLoading: obLoading } = useOnboardingResult();
  const [gateOpen, setGateOpen] = useState(false);
  const navigate = useNavigate();

  const isLoading = authLoading || (user && obLoading);
  const hasCompleted = !!onboardingResult;

  useEffect(() => {
    if (isLoading) return;
    // Not logged in or no onboarding → show gate
    if (!user || !hasCompleted) {
      setGateOpen(true);
    }
  }, [isLoading, user, hasCompleted]);

  if (isLoading) return <LoadingScreen />;

  // Not authenticated → show gate only (no children)
  if (!user) {
    return (
      <FLEOnboardingGate
        open={gateOpen}
        onOpenChange={(v) => {
          setGateOpen(v);
          if (!v) navigate("/");
        }}
      />
    );
  }

  // Authenticated but no onboarding
  return (
    <>
      <FLEOnboardingGate
        open={gateOpen}
        onOpenChange={(v) => {
          setGateOpen(v);
          if (!v && !hasCompleted) navigate("/");
        }}
      />
      {hasCompleted ? children : null}
    </>
  );
}

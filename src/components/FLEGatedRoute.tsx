import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingResult } from "@/hooks/useOnboardingResult";
import { FLEOnboardingGate } from "@/components/FLEOnboardingGate";

export function FLEGatedRoute({ children }: { children: React.ReactNode }) {
  const { data: onboardingResult, isLoading } = useOnboardingResult();
  const [gateOpen, setGateOpen] = useState(false);
  const navigate = useNavigate();
  const hasCompleted = !!onboardingResult;

  useEffect(() => {
    if (!isLoading && !hasCompleted) setGateOpen(true);
  }, [isLoading, hasCompleted]);

  return (
    <>
      <FLEOnboardingGate
        open={gateOpen}
        onOpenChange={(v) => {
          setGateOpen(v);
          if (!v && !hasCompleted) navigate("/");
        }}
      />
      {children}
    </>
  );
}

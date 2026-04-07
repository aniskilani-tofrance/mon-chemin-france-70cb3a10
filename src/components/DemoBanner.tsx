import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const DEMO_EMAILS = [
  "apprenant1@tofrance.fr",
  "apprenant2@tofrance.fr",
  "formateur@tofrance.fr",
  "directeur@tofrance.fr",
  "demo@tofrance.fr",
];

export function DemoBanner() {
  const { user } = useAuth();
  const isDemo = user?.email && DEMO_EMAILS.includes(user.email);

  if (!isDemo) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>
        <strong>Compte démo</strong> — Les données affichées sont fictives et à titre de démonstration uniquement.
      </span>
    </div>
  );
}

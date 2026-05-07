import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardList, GraduationCap, KeyRound, ArrowRight, Mic, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizeMarianneAccessCode } from "@/lib/marianneAccessCode";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/hooks/useAuth";

export function AccessCodeSection() {
  const navigate = useNavigate();
  const { isAdmin } = useAdminCheck();
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [pilotCode, setPilotCode] = useState<string | null>(null);
  const [showCodeForm, setShowCodeForm] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("marianne_access_codes")
        .select("code")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.code) setPilotCode(data.code);
    })();
  }, [isAdmin]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = normalizeMarianneAccessCode(code);
    if (cleaned.length < 4 || cleaned.length > 12) {
      toast.error("Le code doit contenir entre 4 et 12 caractères");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc("validate_marianne_access_code", {
        _code: cleaned,
        _ip_address: null,
        _user_agent: window.navigator.userAgent,
      });
      if (error) throw error;
      if ((data as any)?.valid) {
        sessionStorage.setItem(`marianne_access_granted_${cleaned}`, "true");
        navigate(`/onboarding?code=${cleaned}`);
        return;
      }
      toast.error("Code invalide ou expiré");
    } catch (err: any) {
      toast.error("Erreur lors de la vérification du code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="access-code" className="py-20 bg-muted/30 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Commencez avec Marianne
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Marianne vous écoute et vous oriente. C'est simple et gratuit.
          </p>
        </div>

        {/* Big primary CTA */}
        <Card className="mx-auto mb-6 max-w-xl border-primary/20 bg-card">
          <CardContent className="p-6">
            <Button
              type="button"
              size="lg"
              className="h-16 w-full text-lg font-semibold"
              onClick={() => navigate("/onboarding")}
            >
              <Mic className="mr-2 h-6 w-6" />
              Commencer avec Marianne
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {(isAdmin || user) && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {isAdmin ? "Accès admin direct" : "Accès direct (compte connecté)"}
              </p>
            )}

            {/* Collapsible code form */}
            <button
              type="button"
              onClick={() => setShowCodeForm((v) => !v)}
              className="mx-auto mt-5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <KeyRound className="h-3.5 w-3.5" />
              J'ai un code d'accès
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showCodeForm ? "rotate-180" : ""}`} />
            </button>

            {showCodeForm && (
              <div className="mt-4 border-t border-border/60 pt-4">
                {isAdmin && pilotCode && (
                  <button
                    type="button"
                    onClick={() => setCode(pilotCode)}
                    className="mb-3 w-full rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-xs text-primary hover:bg-primary/10 transition-colors"
                  >
                    Code pilote (démo) : <span className="font-mono font-semibold tracking-wider">{pilotCode}</span>
                  </button>
                )}
                <form onSubmit={handleJoin} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Input
                      value={code}
                      onChange={(e) => setCode(normalizeMarianneAccessCode(e.target.value).slice(0, 12))}
                      placeholder="EX : A2B4D6"
                      maxLength={16}
                      className="h-12 font-mono text-lg tracking-widest uppercase"
                      autoComplete="off"
                    />
                  </div>
                  <Button type="submit" disabled={loading || code.length < 4} size="lg">
                    {loading ? "Vérification…" : "Valider"}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="flex h-full flex-col p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                Marianne — orientation immédiate
              </h3>
              <p className="mb-6 flex-1 text-muted-foreground">
                Parcours multilingue en accès contrôlé pendant la phase pilote. Demandez votre code à l'équipe ToFrance.
              </p>
              <Button
                variant="ghost"
                className="w-fit gap-2 px-0 text-primary hover:bg-transparent hover:text-primary/80"
                onClick={() => document.getElementById("access-code")?.scrollIntoView({ behavior: "smooth" })}
              >
                Saisir un code
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="flex h-full flex-col p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                Diagnostic partagé
              </h3>
              <p className="mb-6 flex-1 text-muted-foreground">
                Entretien guidé en deux langues, ouvert uniquement depuis une connexion formateur.
              </p>
              <Button
                variant="ghost"
                className="w-fit gap-2 px-0 text-primary hover:bg-transparent hover:text-primary/80"
                onClick={() => navigate("/login?redirect=/diagnostic-partage")}
              >
                Connexion formateur
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

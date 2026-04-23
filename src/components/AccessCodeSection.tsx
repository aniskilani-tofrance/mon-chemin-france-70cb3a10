import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardList, GraduationCap, KeyRound, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AccessCodeSection() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleaned.length !== 6) {
      toast.error("Le code doit contenir 6 caractères");
      return;
    }
    setLoading(true);
    try {
      // Try diagnostic first
      const { data: diag } = await supabase
        .from("shared_diagnostics")
        .select("id")
        .eq("access_code", cleaned)
        .maybeSingle();

      if (diag) {
        navigate(`/diagnostic-partage?code=${cleaned}`);
        return;
      }

      // Try placement test
      const { data: placement } = await supabase
        .from("placement_test_sessions")
        .select("id")
        .eq("access_code", cleaned)
        .maybeSingle();

      if (placement) {
        navigate(`/placement-test?code=${cleaned}`);
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
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Accès formation
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Vous avez rendez-vous avec un formateur ou un conseiller ? Saisissez votre code
            d'accès ou découvrez nos évaluations.
          </p>
        </div>

        {/* Code input */}
        <Card className="mx-auto mb-10 max-w-xl border-primary/20 bg-card">
          <CardContent className="p-6">
            <form onSubmit={handleJoin} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <KeyRound className="h-4 w-4 text-primary" />
                  J'ai un code d'accès
                </label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="EX : A2B4D6"
                  maxLength={8}
                  className="font-mono text-lg tracking-widest uppercase"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" disabled={loading || code.length < 6} size="lg">
                {loading ? "Vérification…" : "Rejoindre"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="flex h-full flex-col p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                Diagnostic partagé
              </h3>
              <p className="mb-6 flex-1 text-muted-foreground">
                Entretien guidé avec votre formateur ou CIP, dans votre langue maternelle
                et en français. Validation conjointe de chaque réponse.
              </p>
              <Button
                variant="ghost"
                className="w-fit gap-2 px-0 text-primary hover:bg-transparent hover:text-primary/80"
                onClick={() => navigate("/diagnostic-partage")}
              >
                En savoir plus
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
                Test de positionnement
              </h3>
              <p className="mb-6 flex-1 text-muted-foreground">
                Évaluez gratuitement votre niveau de français (A1 → C2) en environ 30
                minutes. 71 questions, indicatif CECRL.
              </p>
              <Button
                variant="ghost"
                className="w-fit gap-2 px-0 text-primary hover:bg-transparent hover:text-primary/80"
                onClick={() => navigate("/placement-test")}
              >
                Démarrer le test
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

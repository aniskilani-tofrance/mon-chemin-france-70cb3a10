import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Mic } from "lucide-react";

export function AccessCodeSection() {
  const navigate = useNavigate();

  return (
    <section id="access-code" className="py-20 bg-muted/30 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Votre boussole pour avancer en France
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Un diagnostic simple et gratuit pour trouver votre direction, vos rendez-vous et vos prochaines étapes.
          </p>
        </div>

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
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Gratuit • Sans inscription préalable
            </p>
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
                Parcours multilingue ouvert à tous. Lancez l'échange en quelques secondes.
              </p>
              <Button
                variant="ghost"
                className="w-fit gap-2 px-0 text-primary hover:bg-transparent hover:text-primary/80"
                onClick={() => navigate("/onboarding")}
              >
                Démarrer maintenant
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

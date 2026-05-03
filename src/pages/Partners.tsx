import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PartnerMap } from "@/components/PartnerMap";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, TrendingUp, ArrowRight } from "lucide-react";

export default function Partners() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Partenaires — Trouvez un organisme près de chez vous"
        description="Localisez les organismes de formation, cours de français et associations d'accompagnement les plus proches de votre domicile."
        path="/partners"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-24">
        <AnimatedContainer className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            Trouver un partenaire près de chez vous
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Localisez les organismes de formation, cours de français et associations 
            d'accompagnement les plus proches de votre domicile.
          </p>
        </AnimatedContainer>

        <AnimatedContainer delay={0.1}>
          <PartnerMap />
        </AnimatedContainer>

        {/* CTA Section for partners */}
        <AnimatedContainer delay={0.2}>
          <Card className="mt-16 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8 sm:p-12">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                    Vous êtes organisme de formation ou employeur ?
                  </h2>
                  <p className="mb-6 text-lg text-muted-foreground">
                    Rejoignez le réseau ToFrance et recevez des leads qualifiés de personnes 
                    en recherche de formation ou d'emploi dans votre secteur.
                  </p>
                  <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-lg bg-background/60 p-4">
                      <Users className="h-8 w-8 shrink-0 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">Profils qualifiés</p>
                        <p className="text-sm text-muted-foreground">Profils vérifiés et scorés</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-background/60 p-4">
                      <TrendingUp className="h-8 w-8 shrink-0 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">Visibilité</p>
                        <p className="text-sm text-muted-foreground">Référencé sur notre carte</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-background/60 p-4">
                      <Building2 className="h-8 w-8 shrink-0 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">Dashboard dédié</p>
                        <p className="text-sm text-muted-foreground">Gestion de vos profils</p>
                      </div>
                    </div>
                  </div>
                  <Link to="/partner-signup">
                    <Button size="lg" className="gap-2">
                      Se référencer comme partenaire
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </main>

      <Footer />
    </div>
  );
}

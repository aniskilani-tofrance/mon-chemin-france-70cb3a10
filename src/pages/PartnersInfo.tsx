import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Users,
  TrendingUp,
  Building2,
  CheckCircle2,
  Zap,
  BarChart3,
  Shield,
  MessageCircle,
} from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

const BENEFITS = [
  {
    icon: Users,
    title: "Leads qualifiés & scorés",
    description:
      "Recevez uniquement des profils vérifiés correspondant à vos critères de formation ou de recrutement.",
  },
  {
    icon: BarChart3,
    title: "Dashboard de gestion",
    description:
      "Suivez vos leads, gérez vos formations et mesurez vos performances depuis un espace dédié.",
  },
  {
    icon: Zap,
    title: "Matching intelligent",
    description:
      "Notre algorithme connecte automatiquement les candidats aux partenaires les plus pertinents.",
  },
  {
    icon: Shield,
    title: "Conformité RGPD",
    description:
      "Consentement explicite des candidats avant tout partage de données. Transparence totale.",
  },
];

const STEPS = [
  { number: "1", text: "Créez votre compte partenaire en 2 minutes" },
  { number: "2", text: "Renseignez votre organisme et vos programmes" },
  { number: "3", text: "Recevez des leads qualifiés dans votre dashboard" },
];

export default function PartnersInfo() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Devenez partenaire ToFrance — Recevez des leads qualifiés"
        description="Rejoignez le réseau ToFrance : organismes de formation et employeurs, recevez des profils vérifiés et scorés de candidats en recherche de formation ou d'emploi."
        path="/devenir-partenaire"
      />
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pb-16 pt-32 sm:pb-24 sm:pt-40">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="mx-auto max-w-4xl px-4 text-center">
            <AnimatedContainer>
              <Badge variant="outline" className="mb-6 text-sm">
                Organismes de formation & Employeurs
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Recevez des candidats{" "}
                <span className="text-primary">qualifiés</span> sans effort
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                ToFrance identifie, oriente et qualifie les personnes en
                recherche de formation ou d'emploi. Vous recevez directement les
                profils qui correspondent à votre offre.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="gap-2" asChild>
                  <Link to="/partner-signup">
                    Rejoindre le réseau
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </AnimatedContainer>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <AnimatedContainer className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">
                Pourquoi rejoindre ToFrance ?
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Une plateforme pensée pour simplifier votre recrutement et
                remplir vos sessions de formation.
              </p>
            </AnimatedContainer>

            <div className="grid gap-6 sm:grid-cols-2">
              {BENEFITS.map((b, i) => (
                <AnimatedContainer key={b.title} delay={i * 0.1}>
                  <Card className="h-full border-border/50">
                    <CardContent className="flex gap-4 p-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <b.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-foreground">
                          {b.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {b.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedContainer>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-secondary/30 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4">
            <AnimatedContainer className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">
                Comment ça marche ?
              </h2>
            </AnimatedContainer>

            <div className="space-y-6">
              {STEPS.map((s, i) => (
                <AnimatedContainer key={s.number} delay={i * 0.15}>
                  <div className="flex items-center gap-5 rounded-xl border border-border/50 bg-background p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {s.number}
                    </span>
                    <p className="text-foreground">{s.text}</p>
                    {i === STEPS.length - 1 && (
                      <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-primary" />
                    )}
                  </div>
                </AnimatedContainer>
              ))}
            </div>
          </div>
        </section>

        {/* Who is it for */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4">
            <AnimatedContainer className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">
                Pour qui ?
              </h2>
            </AnimatedContainer>
            <div className="grid gap-6 sm:grid-cols-2">
              <AnimatedContainer delay={0.1}>
                <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-8 text-center">
                    <Building2 className="mx-auto mb-4 h-10 w-10 text-primary" />
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      Organismes de formation
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      FLE, formation professionnelle, CQP, titres
                      professionnels… Remplissez vos sessions avec des
                      candidats motivés et éligibles.
                    </p>
                  </CardContent>
                </Card>
              </AnimatedContainer>
              <AnimatedContainer delay={0.2}>
                <Card className="h-full border-primary/20 bg-gradient-to-br from-accent/10 to-transparent">
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="mx-auto mb-4 h-10 w-10 text-primary" />
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      Employeurs
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Recrutez des profils pré-qualifiés avec droit de
                      travailler, compétences vérifiées et disponibilité
                      immédiate.
                    </p>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-xl px-4">
            <AnimatedContainer className="mb-8 text-center">
              <MessageCircle className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h2 className="mb-2 text-3xl font-bold text-foreground">
                Une question ?
              </h2>
              <p className="text-muted-foreground">
                Contactez-nous avant de vous inscrire, nous vous répondrons rapidement.
              </p>
            </AnimatedContainer>
            <AnimatedContainer delay={0.1}>
              <ContactForm defaultType="partner" />
            </AnimatedContainer>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-primary/5 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <AnimatedContainer>
              <h2 className="mb-4 text-3xl font-bold text-foreground">
                Prêt à recevoir vos premiers leads ?
              </h2>
              <p className="mb-8 text-muted-foreground">
                L'inscription est gratuite et prend moins de 2 minutes.
              </p>
              <Button size="lg" className="gap-2" asChild>
                <Link to="/partner-signup">
                  Se référencer comme partenaire
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </AnimatedContainer>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

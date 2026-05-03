import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/AnimatedContainer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  Building2,
  Zap,
  BarChart3,
  Shield,
  Sparkles,
  Quote,
  Clock,
  Target,
} from "lucide-react";
import { PartnerLeadForm } from "@/components/PartnerLeadForm";

const BENEFITS = [
  {
    icon: Users,
    title: "Profils qualifiés & scorés",
    description: "Profils vérifiés correspondant à vos critères, scorés par notre IA d'orientation.",
  },
  {
    icon: BarChart3,
    title: "Dashboard de gestion",
    description: "Suivi des profils, gestion des sessions et mesure de performance dans un espace dédié.",
  },
  {
    icon: Zap,
    title: "Matching intelligent",
    description: "Notre algorithme connecte automatiquement candidats et partenaires les plus pertinents.",
  },
  {
    icon: Shield,
    title: "Conformité RGPD",
    description: "Consentement explicite des candidats avant tout partage. Hébergement France.",
  },
];

const KPI = [
  { value: "24h", label: "Temps de réponse moyen" },
  { value: "Gratuit", label: "Pas de frais d'inscription" },
  { value: "RGPD", label: "100% conforme" },
];

export default function PartnersInfo() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Devenez partenaire ToFrance — Recevez des profils qualifiés"
        description="Rejoignez le réseau ToFrance : organismes de formation, employeurs et associations. Recevez des profils vérifiés et scorés. Inscription en 1 minute, réponse sous 24h."
        path="/devenir-partenaire"
      />
      <Header />

      <main>
        {/* Hero + Form (split layout - tunnel de conversion) */}
        <section className="relative overflow-hidden pb-16 pt-28 sm:pt-32 lg:pt-36">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
              {/* Left: pitch */}
              <AnimatedContainer>
                <Badge variant="outline" className="mb-5">
                  <Sparkles className="mr-1 h-3 w-3 text-primary" />
                  Réseau partenaires ToFrance
                </Badge>
                <h1 className="mb-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Recevez des candidats{" "}
                  <span className="text-primary">qualifiés</span> sans effort
                </h1>
                <p className="mb-8 text-lg text-muted-foreground">
                  ToFrance identifie, oriente et qualifie les personnes en recherche
                  de formation ou d'emploi grâce à son IA propriétaire. Vous recevez
                  les profils qui correspondent à votre offre.
                </p>

                <div className="mb-8 grid grid-cols-3 gap-4">
                  {KPI.map((k) => (
                    <div key={k.label} className="rounded-xl border border-border bg-card p-4 text-center">
                      <div className="text-xl font-bold text-primary sm:text-2xl">{k.value}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{k.label}</div>
                    </div>
                  ))}
                </div>

                <ul className="space-y-3">
                  {[
                    "Inscription en moins d'une minute",
                    "Réponse personnalisée sous 24h ouvrées",
                    "Échange préliminaire pour comprendre vos besoins",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                      <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </AnimatedContainer>

              {/* Right: conversion form */}
              <AnimatedContainer delay={0.15}>
                <div className="relative">
                  <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl" />
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
                    <Clock className="h-3 w-3" />
                    Réponse de l'équipe sous 24h
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
                    Démarrer en 1 minute
                  </h2>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Remplissez ce court formulaire, un membre de notre équipe vous contactera.
                  </p>
                  <PartnerLeadForm />
                </div>
              </AnimatedContainer>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-secondary/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Pourquoi rejoindre ToFrance ?
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Une plateforme pensée pour simplifier votre recrutement et remplir vos sessions.
              </p>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 sm:grid-cols-2" staggerDelay={0.1}>
              {BENEFITS.map((b) => (
                <StaggerItem key={b.title}>
                  <Card className="h-full">
                    <CardContent className="flex gap-4 p-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <b.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-foreground">{b.title}</h3>
                        <p className="text-sm text-muted-foreground">{b.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Audiences */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
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
                      FLE, formation professionnelle, CQP, titres professionnels…
                      Remplissez vos sessions avec des candidats motivés et éligibles.
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
                      Recrutez des profils pré-qualifiés avec droit de travailler,
                      compétences vérifiées et disponibilité immédiate.
                    </p>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="bg-secondary/30 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <Card className="border-primary/20">
                <CardContent className="p-8 sm:p-10">
                  <Quote className="mb-4 h-8 w-8 text-primary/40" />
                  <p className="mb-6 text-lg italic text-foreground">
                    "Nous avons recruté 12 personnes via ToFrance en quelques mois.
                    Les profils étaient bien préparés, motivés et prêts à intégrer
                    nos équipes. Un vrai gain de temps pour nos recruteurs."
                  </p>
                  <div className="border-t border-border pt-4">
                    <p className="font-semibold text-foreground">Directeur RH</p>
                    <p className="text-sm text-muted-foreground">
                      Entreprise du bâtiment, Île-de-France
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>
        </section>

        {/* Final CTA → scroll to form */}
        <section className="py-20">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <AnimatedContainer>
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Prêt à recevoir vos premiers leads ?
              </h2>
              <p className="mb-8 text-muted-foreground">
                Inscription gratuite, sans engagement. Réponse sous 24h ouvrées.
              </p>
              <a
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Démarrer ma demande
              </a>
            </AnimatedContainer>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

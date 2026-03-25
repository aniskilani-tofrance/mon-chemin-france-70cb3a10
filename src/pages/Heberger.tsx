import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/AnimatedContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContactForm } from "@/components/ContactForm";
import {
  Building2,
  Globe,
  Users,
  GraduationCap,
  Landmark,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Monitor,
  Languages,
  BarChart3,
  Shield,
} from "lucide-react";

const USE_CASES = [
  {
    icon: GraduationCap,
    title: "Centres de formation",
    description:
      "Intégrez l'outil d'orientation ToFrance pour orienter vos apprenants vers les parcours adaptés et suivre leur progression.",
  },
  {
    icon: Languages,
    title: "Centres d'examen de français",
    description:
      "Proposez un parcours d'orientation pré-examen à vos candidats et identifiez les formations complémentaires adaptées.",
  },
  {
    icon: HeartHandshake,
    title: "Associations d'accompagnement",
    description:
      "Offrez à vos bénéficiaires un outil d'orientation multilingue pour les guider vers les bonnes ressources sur votre territoire.",
  },
  {
    icon: Landmark,
    title: "Collectivités territoriales",
    description:
      "Déployez la plateforme sur votre territoire pour renforcer l'accueil et l'intégration des nouveaux arrivants.",
  },
];

const FEATURES = [
  {
    icon: Monitor,
    title: "Déploiement clé en main",
    description: "Installation rapide, personnalisée aux couleurs de votre structure.",
  },
  {
    icon: Languages,
    title: "Interface multilingue",
    description: "Disponible en 6 langues pour accueillir tous les publics.",
  },
  {
    icon: BarChart3,
    title: "Tableau de bord dédié",
    description: "Suivez les parcours, les orientations et les statistiques en temps réel.",
  },
  {
    icon: Shield,
    title: "RGPD & sécurité",
    description: "Données hébergées en France, conformité RGPD garantie.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Prenez contact",
    description: "Échangeons sur vos besoins et votre public cible.",
  },
  {
    step: "02",
    title: "Personnalisation",
    description: "Nous adaptons la plateforme à votre identité et vos parcours.",
  },
  {
    step: "03",
    title: "Déploiement",
    description: "Installation et formation de vos équipes en quelques jours.",
  },
  {
    step: "04",
    title: "Accompagnement",
    description: "Support continu et évolutions selon vos retours terrain.",
  },
];

export default function Heberger() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Héberger la plateforme ToFrance — Outil d'orientation pour vos publics"
        description="Déployez la plateforme ToFrance dans votre institution, association ou centre d'examen. Orientez les nouveaux arrivants avec un outil multilingue et personnalisé."
        path="/heberger"
      />
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="mb-6">
                <Globe className="mr-1 h-3 w-3" />
                Outil d'orientation
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Hébergez ToFrance dans{" "}
                <span className="text-primary">votre structure</span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
                Offrez à vos publics un outil d'orientation multilingue et personnalisé.
                Centres de formation, associations, collectivités : déployez la plateforme
                ToFrance pour accompagner les nouveaux arrivants sur votre territoire.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/partner-signup" className="gap-2">
                    Demander une démo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/devenir-partenaire">En savoir plus sur le réseau</Link>
                </Button>
              </div>
            </AnimatedContainer>
          </div>
        </section>

        {/* Use Cases */}
        <section className="bg-secondary/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Pour qui est conçu cet outil ?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                ToFrance s'adapte à toute structure qui accueille ou accompagne
                des personnes en parcours d'intégration.
              </p>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 sm:grid-cols-2" staggerDelay={0.1}>
              {USE_CASES.map((uc) => (
                <StaggerItem key={uc.title}>
                  <Card variant="elevated" className="h-full">
                    <CardContent className="flex gap-4 p-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <uc.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="mb-1 text-lg font-semibold text-foreground">
                          {uc.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{uc.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Ce que vous obtenez
              </h2>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.08}>
              {FEATURES.map((f) => (
                <StaggerItem key={f.title}>
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <f.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Steps */}
        <section className="bg-secondary/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Comment ça marche ?
              </h2>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.1}>
              {STEPS.map((s) => (
                <StaggerItem key={s.step}>
                  <Card className="h-full border-primary/10">
                    <CardContent className="p-6">
                      <span className="mb-3 inline-block text-3xl font-bold text-primary/30">
                        {s.step}
                      </span>
                      <h3 className="mb-2 font-semibold text-foreground">{s.title}</h3>
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20">
          <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="mb-8 text-center">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                Prêt à déployer ToFrance ?
              </h2>
              <p className="mx-auto max-w-xl text-lg text-muted-foreground">
                Contactez-nous pour une démonstration personnalisée et découvrez
                comment ToFrance peut renforcer l'accompagnement dans votre structure.
              </p>
            </AnimatedContainer>
            <AnimatedContainer delay={0.1}>
              <ContactForm defaultType="host" />
            </AnimatedContainer>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

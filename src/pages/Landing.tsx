import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/AnimatedContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  ArrowRight,
  Sparkles,
  BookOpen,
  Languages,
  MapPin,
  ShieldCheck,
  Users,
  Zap,
  HeartHandshake,
  GraduationCap,
  Briefcase,
  Quote,
} from "lucide-react";
import heroImage from "@/assets/hero-welcome.jpg";
import marianneAvatar from "@/assets/marianne-avatar.png";

const PILLARS = [
  {
    icon: Mic,
    title: "Onboarding vocal multilingue",
    description:
      "Une conversation naturelle avec Marianne, votre conseillère IA, dans 6 langues avec des voix natives premium.",
  },
  {
    icon: BookOpen,
    title: "Apprentissage du français FLE",
    description:
      "Du niveau Alpha au B1 : modules oraux, exercices interactifs et suivi personnalisé pour chaque apprenant.",
  },
  {
    icon: MapPin,
    title: "Orientation territoriale",
    description:
      "Mise en relation avec les centres de formation, employeurs et associations près de chez vous.",
  },
  {
    icon: ShieldCheck,
    title: "Sécurisé & RGPD",
    description:
      "Hébergement en France, données protégées, conformité RGPD garantie pour les utilisateurs et partenaires.",
  },
];

const STATS = [
  { value: "6", label: "langues natives" },
  { value: "30+", label: "modules FLE" },
  { value: "4", label: "niveaux CECRL" },
  { value: "100%", label: "RGPD France" },
];

const AUDIENCES = [
  {
    icon: Users,
    title: "Primo-arrivants",
    description: "Un parcours personnalisé pour comprendre vos droits, apprendre le français et trouver une formation.",
    cta: "Commencer mon parcours",
    to: "/onboarding",
  },
  {
    icon: GraduationCap,
    title: "Centres de formation",
    description: "Recevez des candidats qualifiés et déployez ToFrance dans votre structure.",
    cta: "Devenir partenaire",
    to: "/devenir-partenaire",
  },
  {
    icon: Briefcase,
    title: "Employeurs & associations",
    description: "Identifiez des profils motivés et accompagnez l'intégration sur votre territoire.",
    cta: "Héberger ToFrance",
    to: "/heberger",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "L'onboarding vocal en arabe a tout changé : je me suis sentie écoutée dès la première minute.",
    author: "Amina",
    role: "Apprenante FLE",
  },
  {
    quote:
      "Nous recevons des candidats déjà orientés et motivés. C'est un vrai gain de temps pour nos équipes.",
    author: "Centre de formation partenaire",
    role: "Île-de-France",
  },
  {
    quote:
      "ToFrance complète parfaitement notre accompagnement social. L'outil multilingue est précieux.",
    author: "Association d'accueil",
    role: "Région Sud",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="ToFrance — Plateforme d'accueil et d'orientation multilingue"
        description="Découvrez ToFrance : onboarding vocal en 6 langues, apprentissage du français (FLE) et orientation vers formations, employeurs et associations en France."
        path="/landing"
      />
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-24">
          <div className="absolute inset-0 z-0">
            <img
              src={heroImage}
              alt="Bienvenue en France"
              className="h-full w-full object-cover object-top opacity-20"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="text-center">
              <Badge variant="outline" className="mb-6 inline-flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-accent" />
                Plateforme nouvelle génération
              </Badge>
              <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Accueillir, accompagner et orienter{" "}
                <span className="text-primary">en 6 langues</span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                ToFrance combine intelligence artificielle vocale, apprentissage du français et
                réseau de partenaires pour réussir l'intégration des nouveaux arrivants.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/onboarding" className="gap-3">
                    <Mic className="h-5 w-5" />
                    Démarrer le parcours
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/devenir-partenaire" className="gap-3">
                    <HeartHandshake className="h-5 w-5" />
                    Devenir partenaire
                  </Link>
                </Button>
              </div>

              {/* Marianne intro */}
              <div className="mt-14 inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-sm">
                <img
                  src={marianneAvatar}
                  alt="Marianne, conseillère IA"
                  className="h-12 w-12 rounded-full object-cover object-top"
                  width={48}
                  height={48}
                  loading="lazy"
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">
                    Marianne, votre conseillère IA
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Voix natives ElevenLabs · 6 langues
                  </p>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-border bg-secondary/30 py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <StaggerContainer
              className="grid grid-cols-2 gap-8 sm:grid-cols-4"
              staggerDelay={0.08}
            >
              {STATS.map((s) => (
                <StaggerItem key={s.label}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary sm:text-4xl">{s.value}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Pillars */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Une plateforme complète, du premier mot au premier emploi
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Quatre piliers pour transformer l'expérience d'arrivée et d'intégration en France.
              </p>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 sm:grid-cols-2" staggerDelay={0.1}>
              {PILLARS.map((p) => (
                <StaggerItem key={p.title}>
                  <Card variant="elevated" className="h-full">
                    <CardContent className="flex gap-4 p-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <p.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">{p.title}</h3>
                        <p className="text-sm text-muted-foreground">{p.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Audiences */}
        <section className="bg-secondary/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">
                <Languages className="mr-1 h-3 w-3" />
                Pour qui ?
              </Badge>
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Une plateforme pensée pour tous les acteurs
              </h2>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 lg:grid-cols-3" staggerDelay={0.1}>
              {AUDIENCES.map((a) => (
                <StaggerItem key={a.title}>
                  <Card className="flex h-full flex-col border-primary/10">
                    <CardContent className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <a.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-foreground">{a.title}</h3>
                      <p className="mb-6 flex-1 text-sm text-muted-foreground">{a.description}</p>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to={a.to} className="gap-2">
                          {a.cta}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Comment ça marche ?
              </h2>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 sm:grid-cols-3" staggerDelay={0.1}>
              {[
                {
                  step: "01",
                  icon: Mic,
                  title: "Conversation vocale",
                  description: "Marianne vous accueille dans votre langue et comprend votre situation.",
                },
                {
                  step: "02",
                  icon: Zap,
                  title: "Parcours personnalisé",
                  description: "L'IA construit en quelques minutes un plan adapté à votre profil et votre territoire.",
                },
                {
                  step: "03",
                  icon: HeartHandshake,
                  title: "Mise en relation",
                  description: "Vous êtes orienté(e) vers les bons partenaires : formation, emploi, accompagnement.",
                },
              ].map((s) => (
                <StaggerItem key={s.step}>
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-3xl font-bold text-primary/30">{s.step}</span>
                        <s.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 font-semibold text-foreground">{s.title}</h3>
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-secondary/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Ils utilisent ToFrance
              </h2>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 lg:grid-cols-3" staggerDelay={0.1}>
              {TESTIMONIALS.map((t, i) => (
                <StaggerItem key={i}>
                  <Card variant="elevated" className="h-full">
                    <CardContent className="p-6">
                      <Quote className="mb-4 h-8 w-8 text-primary/40" />
                      <p className="mb-6 text-sm italic text-foreground">{t.quote}</p>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.author}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
                <CardContent className="p-10 text-center sm:p-14">
                  <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                    Prêt à découvrir ToFrance ?
                  </h2>
                  <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
                    Quelques minutes suffisent pour démarrer un parcours adapté à votre situation.
                  </p>
                  <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button variant="hero" size="xl" asChild>
                      <Link to="/onboarding" className="gap-3">
                        <Mic className="h-5 w-5" />
                        Lancer mon onboarding
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="xl" asChild>
                      <Link to="/fle" className="gap-2">
                        <BookOpen className="h-5 w-5" />
                        Découvrir le module FLE
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

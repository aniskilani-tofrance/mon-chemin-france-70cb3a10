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
  Target,
  Brain,
  Route,
  TrendingUp,
  Award,
  Building2,
  BadgeCheck,
} from "lucide-react";
import heroImage from "@/assets/hero-welcome.jpg";
import marianneAvatar from "@/assets/marianne-avatar.png";

const IMPACT_STATS = [
  { value: "6", label: "langues disponibles", context: "Français, Anglais, Arabe, Espagnol, Portugais, Russe" },
  { value: "30+", label: "modules de formation", context: "Du niveau Alpha au B1 professionnel" },
  { value: "100%", label: "personnalisé", context: "IA adaptative au profil de chaque utilisateur" },
];

const PARCOURS_ETAPES = [
  {
    step: "01",
    icon: Brain,
    title: "Diagnostic IA",
    description: "Notre IA propriétaire évalue le niveau linguistique, les compétences et les besoins spécifiques de chaque personne.",
    highlight: "Conçu pour les publics éloignés de l'emploi",
  },
  {
    step: "02",
    icon: BookOpen,
    title: "Français sur mesure",
    description: "Parcours FLE adaptatif (Alpha → B1) avec focus sur l'oral et les situations professionnelles concrètes.",
    highlight: "Progression au rythme de chacun",
  },
  {
    step: "03",
    icon: Award,
    title: "Certification & formation",
    description: "Préparation DELF, DFP ou accès à des formations professionnelles certifiantes dans les métiers en tension.",
    highlight: "Accès aux financements possibles",
  },
  {
    step: "04",
    icon: Briefcase,
    title: "Accès à l'emploi",
    description: "Mise en relation avec des employeurs et des centres de formation sur le territoire.",
    highlight: "Métiers en tension priorisés",
  },
];

const PUBLICS_CIBLES = [
  {
    icon: Users,
    title: "Primo-arrivants",
    description: "Personnes nouvellement arrivées en France, quelle que soit leur situation administrative initiale.",
  },
  {
    icon: ShieldCheck,
    title: "Publics fragilisés",
    description: "Personnes éloignées de l'emploi rencontrant des freins linguistiques, sociaux ou administratifs.",
  },
  {
    icon: GraduationCap,
    title: "Demandeurs de reconversion",
    description: "Salariés ou travailleurs indépendants souhaitant se reconvertir vers les métiers en tension.",
  },
];

const METIERS_TENSION = [
  "BTP & Construction",
  "Restauration & Hôtellerie", 
  "Santé & Aide à domicile",
  "Logistique & Transport",
  "Industrie",
  "Services à la personne",
];

const TEMOIGNAGES = [
  {
    quote: "Je ne parlais pas un mot de français. En 3 mois avec ToFrance, j'ai pu passer mon entretien d'embauche en français et décrocher un CDI.",
    author: "Karim",
    role: "Opérateur de production, région lyonnaise",
    result: "CDI signé après 4 mois",
  },
  {
    quote: "L'onboarding vocal en arabe m'a permis de comprendre mes droits et mes options. Sans ça, j'aurais abandonné dès le début.",
    author: "Amina",
    role: "Aide-soignante en formation",
    result: "En formation DFGSM",
  },
  {
    quote: "Nous avons recruté 12 personnes formées via ToFrance. Elles étaient motivées, bien préparées et prêtes à intégrer nos équipes.",
    author: "Directeur RH",
    role: "Entreprise du bâtiment, Île-de-France",
    result: "12 recrutements réussis",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="ToFrance — IA d'insertion pour primo-arrivants et publics éloignés de l'emploi"
        description="ToFrance développe une IA propriétaire spécialisée dans l'insertion. Multilingue et orientée parcours, elle guide chaque personne vers l'apprentissage du français, la formation et l'emploi."
        path="/landing"
      />
      <Header />

      <main>
        {/* Hero - Mission forte */}
        <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
          <div className="absolute inset-0 z-0">
            <img
              src={heroImage}
              alt="ToFrance - Accompagnement vers l'insertion"
              className="h-full w-full object-cover object-top opacity-15"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="text-center">
              <Badge variant="outline" className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm">
                <Target className="h-3.5 w-3.5 text-primary" />
                IA spécialisée insertion — 6 langues natives
              </Badge>
              
              <h1 className="mx-auto mb-8 max-w-5xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
                L'IA qui accompagne les publics éloignés vers{" "}
                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  l'emploi durable
                </span>
              </h1>
              
              <p className="mx-auto mb-10 max-w-3xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
                ToFrance développe une IA propriétaire conçue pour les primo-arrivants et les personnes 
                éloignées de l'emploi. Multilingue et orientée parcours, elle identifie les besoins 
                linguistiques et professionnels pour guider chacun vers les solutions adaptées :
                français, formation, certification et emploi dans les métiers en tension.
              </p>
              
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/onboarding" className="gap-3">
                    <Mic className="h-5 w-5" />
                    Démarrer mon parcours
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/devenir-partenaire" className="gap-3">
                    <Building2 className="h-5 w-5" />
                    Espace partenaires
                  </Link>
                </Button>
              </div>
            </AnimatedContainer>

            {/* Stats impact */}
            <AnimatedContainer delay={0.3} className="mt-16">
              <div className="grid gap-8 border-y border-border bg-secondary/20 px-6 py-10 sm:grid-cols-3">
                {IMPACT_STATS.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-4xl font-bold text-primary sm:text-5xl">{stat.value}</div>
                    <div className="mt-2 font-medium text-foreground">{stat.label}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{stat.context}</div>
                  </div>
                ))}
              </div>
            </AnimatedContainer>
          </div>
        </section>

        {/* Section "Notre approche" */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="mb-16 text-center">
              <Badge variant="outline" className="mb-4">
                <Brain className="mr-1 h-3 w-3" />
                IA propriétaire
              </Badge>
              <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                Une IA conçue pour l'insertion réelle
              </h2>
              <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
                Contrairement aux solutions généralistes, ToFrance intègre les spécificités des parcours 
                d'insertion : illettrisme potentiel, barrières linguistiques, freins administratifs, 
                et méconnaissance des dispositifs français.
              </p>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 lg:grid-cols-3" staggerDelay={0.1}>
              <StaggerItem>
                <Card className="h-full border-primary/10">
                  <CardContent className="flex flex-col p-8">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <Languages className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">Multilingue natif</h3>
                    <p className="text-muted-foreground">
                      Conversation en 6 langues avec des voix natives premium. L'utilisateur peut 
                      s'exprimer dans sa langue avant de progresser en français.
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="h-full border-primary/10">
                  <CardContent className="flex flex-col p-8">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <Route className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">Parcours orienté</h3>
                    <p className="text-muted-foreground">
                      Pas de parcours linéaire figé. L'IA adapte le chemin en fonction du profil : 
                      niveau de français souhaité, secteur visé, situation administrative.
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="h-full border-primary/10">
                  <CardContent className="flex flex-col p-8">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <MapPin className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">Territoire connecté</h3>
                    <p className="text-muted-foreground">
                      Mise en relation avec les acteurs locaux : centres de formation, employeurs, 
                      associations d'accompagnement proches du domicile.
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* Section Parcours */}
        <section className="relative bg-secondary/40 py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="mb-16 text-center">
              <Badge variant="outline" className="mb-4">
                <TrendingUp className="mr-1 h-3 w-3" />
                Parcours complet
              </Badge>
              <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                Du premier contact à l'emploi durable
              </h2>
              <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
                Un accompagnement étape par étape, adapté au rythme et aux capacités de chaque personne.
              </p>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 md:grid-cols-2" staggerDelay={0.1}>
              {PARCOURS_ETAPES.map((etape) => (
                <StaggerItem key={etape.step}>
                  <Card className="h-full overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-primary text-primary-foreground">
                          <span className="text-2xl font-bold">{etape.step}</span>
                        </div>
                        <div className="flex-1 p-6">
                          <div className="mb-3 flex items-center gap-3">
                            <etape.icon className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">{etape.title}</h3>
                          </div>
                          <p className="mb-3 text-sm text-muted-foreground">{etape.description}</p>
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            <BadgeCheck className="h-3 w-3" />
                            {etape.highlight}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Section Publics cibles */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="mb-16 text-center">
              <Badge variant="outline" className="mb-4">
                <Users className="mr-1 h-3 w-3" />
                Publics accompagnés
              </Badge>
              <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                Pour qui ?
              </h2>
              <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
                ToFrance s'adresse aux personnes éloignées de l'emploi, quelle que soit leur origine 
                ou leur situation administrative.
              </p>
            </AnimatedContainer>

            <div className="grid gap-8 lg:grid-cols-2">
              <StaggerContainer className="grid gap-6" staggerDelay={0.1}>
                {PUBLICS_CIBLES.map((public_cible) => (
                  <StaggerItem key={public_cible.title}>
                    <Card className="h-full">
                      <CardContent className="flex gap-5 p-6">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <public_cible.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="mb-2 font-semibold text-foreground">{public_cible.title}</h3>
                          <p className="text-sm text-muted-foreground">{public_cible.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              <AnimatedContainer delay={0.3}>
                <Card className="h-full bg-gradient-to-br from-primary/5 via-background to-accent/5">
                  <CardContent className="flex h-full flex-col justify-center p-8">
                    <h3 className="mb-6 text-2xl font-bold text-foreground">
                      Métiers en tension couverts
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {METIERS_TENSION.map((metier) => (
                        <div
                          key={metier}
                          className="flex items-center gap-2 rounded-lg border border-border bg-background/80 px-4 py-3"
                        >
                          <Zap className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{metier}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-6 text-sm text-muted-foreground">
                      Notre IA identifie les correspondances entre le profil de la personne 
                      et les opportunités réelles du territoire.
                    </p>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            </div>
          </div>
        </section>

        {/* Section Témoignages */}
        <section className="bg-secondary/40 py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer className="mb-16 text-center">
              <Badge variant="outline" className="mb-4">
                <Quote className="mr-1 h-3 w-3" />
                Résultats concrets
              </Badge>
              <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                Ils ont transformé leur parcours
              </h2>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 lg:grid-cols-3" staggerDelay={0.1}>
              {TEMOIGNAGES.map((temoignage, i) => (
                <StaggerItem key={i}>
                  <Card className="h-full">
                    <CardContent className="flex h-full flex-col p-6">
                      <Quote className="mb-4 h-8 w-8 text-primary/30" />
                      <p className="mb-6 flex-1 text-sm italic leading-relaxed text-foreground">
                        "{temoignage.quote}"
                      </p>
                      <div className="border-t border-border pt-4">
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          {temoignage.result}
                        </div>
                        <p className="font-medium text-foreground">{temoignage.author}</p>
                        <p className="text-xs text-muted-foreground">{temoignage.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <Card className="overflow-hidden border-primary/20">
                <CardContent className="relative p-10 text-center sm:p-14">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
                  <div className="relative">
                    <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                      Prêt à transformer votre parcours ?
                    </h2>
                    <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
                      Quelques minutes suffisent pour démarrer. Notre IA vous accompagne 
                      dans votre langue, à votre rythme.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                      <Button variant="hero" size="xl" asChild>
                        <Link to="/onboarding" className="gap-3">
                          <Mic className="h-5 w-5" />
                          Commencer gratuitement
                          <ArrowRight className="h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                    <p className="mt-6 text-xs text-muted-foreground">
                      Gratuit pour les utilisateurs • Aucune donnée partagée sans consentement
                    </p>
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

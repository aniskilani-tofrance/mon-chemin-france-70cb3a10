import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/AnimatedContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Landmark, ArrowRight, Users, GraduationCap, Globe, MapPin,
  Mic, Shield, BarChart3, HeartHandshake, CheckCircle2, TrendingUp,
  Languages, Brain, Building2, Download, Target, Clock,
  Handshake, FileText, Lightbulb,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";

/* ───── Constants ───── */

const ENJEUX = [
  {
    icon: Languages,
    title: "Barrière linguistique",
    stat: "72%",
    desc: "des primo-arrivants abandonnent les parcours d'intégration faute d'accompagnement adapté à leur langue.",
  },
  {
    icon: MapPin,
    title: "Maillage territorial inégal",
    stat: "40%",
    desc: "des bassins d'emploi n'ont aucun dispositif d'orientation multilingue accessible.",
  },
  {
    icon: Clock,
    title: "Délais d'orientation",
    stat: "6 mois",
    desc: "en moyenne avant qu'un nouvel arrivant accède à la bonne formation ou au bon dispositif.",
  },
  {
    icon: Target,
    title: "Déperdition des publics",
    stat: "3 sur 4",
    desc: "des profils orientés vers un dispositif ne correspondent pas aux prérequis réels de la formation.",
  },
];

const SOLUTION_STEPS = [
  {
    num: "01",
    icon: Mic,
    title: "Accueil vocal multilingue",
    desc: "L'usager est accueilli en 6 langues par Marianne, une IA conversationnelle. Zéro formulaire, zéro barrière.",
  },
  {
    num: "02",
    icon: Brain,
    title: "Diagnostic automatique",
    desc: "En 5 minutes, le niveau de français (CECRL), les compétences, les freins et les objectifs sont évalués.",
  },
  {
    num: "03",
    icon: Target,
    title: "Orientation personnalisée",
    desc: "L'algorithme oriente vers le bon dispositif : FLE, formation qualifiante, ou emploi direct selon le profil.",
  },
  {
    num: "04",
    icon: Handshake,
    title: "Mise en relation",
    desc: "Le profil qualifié est transmis aux organismes partenaires du territoire pour un recontact sous 48h.",
  },
];

const IMPACTS = [
  { value: "5 min", label: "Temps de diagnostic vs. 45 min en entretien classique", icon: Clock },
  { value: "×3", label: "Taux d'adéquation profil-formation par rapport à l'orientation manuelle", icon: Target },
  { value: "6", label: "Langues disponibles : FR, EN, AR, ES, PT, RU", icon: Languages },
  { value: "48h", label: "Délai de recontact garanti par les partenaires", icon: Handshake },
];

const PILIERS_POLITIQUE = [
  {
    icon: GraduationCap,
    title: "Formation & montée en compétences",
    desc: "Orientation vers les formations FLE et qualifiantes disponibles sur le territoire, en lien avec les besoins des employeurs locaux.",
    objectif: "CIR / OFII / Plan régional formation",
  },
  {
    icon: Building2,
    title: "Emploi & insertion professionnelle",
    desc: "Matching avec les secteurs en tension identifiés dans le SRDE2I : BTP, hôtellerie-restauration, aide à la personne, logistique.",
    objectif: "SRDE2I / Pacte régional",
  },
  {
    icon: HeartHandshake,
    title: "Cohésion sociale & intégration",
    desc: "Réduction de la fracture linguistique et numérique, renforcement de l'autonomie des publics allophones.",
    objectif: "Contrat de ville / CPER",
  },
  {
    icon: BarChart3,
    title: "Pilotage par la donnée",
    desc: "Tableau de bord territorial : flux, profils, besoins en formation, taux de placement. Des données inédites pour la politique publique.",
    objectif: "Observatoire régional",
  },
];

const DEPLOYMENT_PHASES = [
  {
    phase: "Phase 1 — Pilote",
    duration: "3 mois",
    actions: [
      "Déploiement sur 2-3 bassins d'emploi prioritaires",
      "Intégration avec 5-10 organismes de formation locaux",
      "Suivi d'une cohorte de 200 usagers",
    ],
  },
  {
    phase: "Phase 2 — Extension",
    duration: "6 mois",
    actions: [
      "Couverture de l'ensemble des départements de la région",
      "Connexion avec France Travail, OFII, missions locales",
      "Objectif 1 000 orientations / trimestre",
    ],
  },
  {
    phase: "Phase 3 — Consolidation",
    duration: "12 mois",
    actions: [
      "Plateforme en marque blanche aux couleurs de la Région",
      "Tableau de bord intégré au SI régional",
      "Objectif 5 000 orientations / an",
    ],
  },
];

const BUDGET_DATA = [
  { name: "Licence plateforme", value: 35 },
  { name: "Personnalisation", value: 20 },
  { name: "Accompagnement", value: 25 },
  { name: "Formation équipes", value: 20 },
];

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent-foreground))",
  "hsl(var(--success))",
  "hsl(var(--chart-5))",
];

const VOLUME_DATA = [
  { name: "T1", orientations: 50, label: "Pilote" },
  { name: "T2", orientations: 150, label: "Montée" },
  { name: "T3", orientations: 350, label: "Extension" },
  { name: "T4", orientations: 600, label: "Régime" },
  { name: "T5", orientations: 1000, label: "Consolidation" },
  { name: "T6", orientations: 1250, label: "Objectif" },
];

export default function PitchRegion() {
  return (
    <div className="min-h-screen bg-background pitch-region-print">
      <SEO
        title="ToFrance — Pitch Conseil Régional"
        description="Présentation de ToFrance pour le Conseil Régional : outil d'orientation et d'insertion des primo-arrivants sur le territoire."
        path="/pitch-region"
      />
      <Header />

      <main>
        {/* ─── Hero ─── */}
        {/* Section 1: Cover */}
        <section className="relative overflow-hidden pt-24 pb-16 print-cover">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
          <div className="relative mx-auto max-w-5xl px-4 pt-16 text-center sm:px-6 lg:px-8">
            <AnimatedContainer>
              <Badge variant="outline" className="mb-6 gap-1.5 text-sm">
                <Landmark className="h-3.5 w-3.5" />
                Conseil Régional — Présentation 2026
              </Badge>
            </AnimatedContainer>

            <AnimatedContainer delay={0.1}>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Accélérer l'intégration des{" "}
                <span className="text-primary">nouveaux arrivants</span>{" "}
                sur votre territoire
              </h1>
            </AnimatedContainer>

            <AnimatedContainer delay={0.2}>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
                ToFrance est une plateforme d'orientation multilingue pilotée par l'IA qui réduit
                de <strong className="text-foreground">6 mois à 5 minutes</strong> le temps de diagnostic
                des publics primo-arrivants et les connecte aux dispositifs de votre territoire.
              </p>
            </AnimatedContainer>

            <AnimatedContainer delay={0.3}>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/onboarding">
                    <Mic className="h-5 w-5" />
                    Tester la démo
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="glass"
                  size="xl"
                  onClick={() => window.print()}
                  className="print:hidden"
                >
                  <Download className="h-5 w-5" />
                  Télécharger en PDF
                </Button>
              </div>
            </AnimatedContainer>
          </div>
        </section>

        {/* ─── Enjeux territoriaux ─── */}
        {/* Section 2: Enjeux */}
        <section className="py-20 bg-card/50 print-section">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                Constat
              </div>
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Les enjeux sur votre territoire
              </h2>
              <p className="mb-12 max-w-2xl text-muted-foreground">
                Chaque année, plus de <strong className="text-foreground">800 000 primo-arrivants</strong> arrivent
                en France. L'orientation vers les bons dispositifs reste le maillon faible de la chaîne d'intégration.
              </p>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 sm:grid-cols-2" staggerDelay={0.1}>
              {ENJEUX.map((e) => (
                <StaggerItem key={e.title}>
                  <Card className="h-full border-destructive/15 bg-destructive/5">
                    <CardContent className="flex gap-4 p-6">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-destructive/10">
                        <e.icon className="h-7 w-7 text-destructive" />
                      </div>
                      <div>
                        <div className="mb-1 text-2xl font-bold text-foreground">{e.stat}</div>
                        <h3 className="mb-1 font-semibold text-foreground">{e.title}</h3>
                        <p className="text-sm text-muted-foreground">{e.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ─── La solution ─── */}
        {/* Section 3: Solution */}
        <section className="py-20 print-section">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                La Solution
              </div>
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Marianne, conseillère IA multilingue
              </h2>
              <p className="mb-12 max-w-2xl text-muted-foreground">
                Un outil numérique inclusif qui parle la langue de chaque usager et oriente
                vers le bon dispositif en moins de 5 minutes.
              </p>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 sm:grid-cols-2" staggerDelay={0.1}>
              {SOLUTION_STEPS.map((step) => (
                <StaggerItem key={step.num}>
                  <Card variant="elevated" className="h-full">
                    <CardContent className="flex gap-4 p-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-primary/50">
                          Étape {step.num}
                        </span>
                        <h3 className="mb-1 font-semibold text-foreground">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ─── Impact chiffré ─── */}
        {/* Section 4: Impact */}
        <section className="py-20 print-section">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 sm:p-12">
                <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl" />
                <div className="relative z-10">
                  <h2 className="mb-8 text-center text-3xl font-bold text-white sm:text-4xl">
                    Impact mesurable
                  </h2>
                  <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                    {IMPACTS.map((item) => (
                      <div key={item.label} className="text-center">
                        <item.icon className="mx-auto mb-2 h-6 w-6 text-white/70" />
                        <div className="text-3xl font-bold text-white sm:text-4xl">{item.value}</div>
                        <div className="mt-1 text-sm text-white/70">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </section>

        {/* ─── Alignement politique publique ─── */}
        {/* Section 5: Politique publique */}
        <section className="py-20 bg-card/50 print-page-break print-section">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                Politique publique
              </div>
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Aligné sur vos compétences régionales
              </h2>
              <p className="mb-12 max-w-2xl text-muted-foreground">
                ToFrance s'inscrit dans les axes stratégiques de la politique régionale
                de formation, d'emploi et de cohésion sociale.
              </p>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 sm:grid-cols-2" staggerDelay={0.1}>
              {PILIERS_POLITIQUE.map((p) => (
                <StaggerItem key={p.title}>
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <p.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground">{p.title}</h3>
                      </div>
                      <p className="mb-3 text-sm text-muted-foreground">{p.desc}</p>
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="mr-1 h-3 w-3" />
                        {p.objectif}
                      </Badge>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ─── Déploiement territorial ─── */}
        {/* Section 6: Déploiement */}
        <section className="py-20 print-page-break print-section">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                Déploiement
              </div>
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Plan de déploiement territorial
              </h2>
              <p className="mb-12 max-w-2xl text-muted-foreground">
                Un déploiement progressif et mesuré, co-construit avec vos services.
              </p>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 lg:grid-cols-3" staggerDelay={0.12}>
              {DEPLOYMENT_PHASES.map((phase) => (
                <StaggerItem key={phase.phase}>
                  <Card className="h-full border-primary/10">
                    <CardContent className="p-6">
                      <Badge className="mb-3">{phase.duration}</Badge>
                      <h3 className="mb-3 text-lg font-bold text-foreground">{phase.phase}</h3>
                      <ul className="space-y-2">
                        {phase.actions.map((action) => (
                          <li key={action} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ─── Projections ─── */}
        {/* Section 7: Projections */}
        <section className="py-20 bg-card/50 print-page-break print-section">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                Projections
              </div>
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Montée en charge prévisionnelle
              </h2>
              <p className="mb-12 max-w-2xl text-muted-foreground">
                Nombre d'orientations par trimestre sur 18 mois de déploiement.
              </p>
            </AnimatedContainer>

            <div className="grid gap-8 lg:grid-cols-3">
              <AnimatedContainer delay={0.1} className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={VOLUME_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          />
                          <YAxis
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                            label={{
                              value: "Orientations",
                              angle: -90,
                              position: "insideLeft",
                              fill: "hsl(var(--muted-foreground))",
                              fontSize: 12,
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "12px",
                              color: "hsl(var(--foreground))",
                            }}
                            formatter={(value: number) => [`${value} orientations`, "Volume"]}
                          />
                          <Bar dataKey="orientations" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedContainer>

              <AnimatedContainer delay={0.2}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="mb-4 font-semibold text-foreground">Répartition budget</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={BUDGET_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {BUDGET_DATA.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number, name: string) => [`${value}%`, name]}
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "12px",
                              color: "hsl(var(--foreground))",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                      {BUDGET_DATA.map((item, i) => (
                        <li key={item.name} className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: PIE_COLORS[i] }}
                          />
                          {item.name} — {item.value}%
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            </div>
          </div>
        </section>

        {/* ─── Garanties ─── */}
        {/* Section 8: Garanties */}
        <section className="py-20 print-section">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                Garanties
              </div>
              <h2 className="mb-12 text-3xl font-bold text-foreground sm:text-4xl">
                Conformité & sécurité
              </h2>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
              {[
                { icon: Shield, title: "RGPD natif", desc: "Consentement explicite, droit à l'oubli, données hébergées en France" },
                { icon: FileText, title: "Open data compatible", desc: "Export des données anonymisées pour l'observatoire régional" },
                { icon: Globe, title: "Accessibilité RGAA", desc: "Interface vocale accessible aux publics en situation d'illettrisme ou de handicap" },
                { icon: Lightbulb, title: "Innovation sociale", desc: "Éligible aux financements PIA, FSE+, France 2030" },
                { icon: Users, title: "Co-construction", desc: "Comité de pilotage trimestriel avec vos services" },
                { icon: TrendingUp, title: "Indicateurs de résultat", desc: "KPIs alignés sur vos objectifs : taux d'orientation, de placement, de satisfaction" },
              ].map((item) => (
                <StaggerItem key={item.title}>
                  <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ─── CTA ─── */}
        {/* Section 9: CTA */}
        <section className="py-20 print-section print:hidden">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <AnimatedContainer>
              <Landmark className="mx-auto mb-6 h-12 w-12 text-primary" />
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Construisons ensemble l'intégration de demain
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
                ToFrance est prêt à être déployé sur votre territoire. Organisons une démonstration
                avec vos équipes.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/onboarding">
                    <Mic className="h-5 w-5" />
                    Tester la démo live
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="glass" size="xl" asChild>
                  <a href="mailto:contact@tofrance.fr">
                    <Handshake className="h-5 w-5" />
                    Planifier un rendez-vous
                  </a>
                </Button>
              </div>
            </AnimatedContainer>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

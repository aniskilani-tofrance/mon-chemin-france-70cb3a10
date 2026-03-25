import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/AnimatedContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Mic, ArrowRight, Users, Building2, GraduationCap, Briefcase,
  Globe, Sparkles, TrendingUp, Target, CheckCircle2, Zap,
  MapPin, Brain, MessageCircle, BarChart3, Shield, Heart, Download,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const ROUTES = [
  {
    letter: "A",
    name: "FLE",
    profile: "Niveau < A2",
    partner: "Associations de cours de français",
    price: "100 – 200 €",
    color: "from-primary/20 to-primary/5 border-primary/30",
    icon: GraduationCap,
  },
  {
    letter: "B",
    name: "Formation (CQP / TP)",
    profile: "Niveau ≥ A2, besoin de qualification",
    partner: "Organismes de formation",
    price: "140 – 400 €",
    color: "from-accent/20 to-accent/5 border-accent/30",
    icon: Briefcase,
  },
  {
    letter: "C",
    name: "Emploi direct",
    profile: "Job-ready, droit au travail",
    partner: "Employeurs partenaires",
    price: "300 – 500 €",
    color: "from-success/20 to-success/5 border-success/30",
    icon: Building2,
  },
];

const ADVANTAGES = [
  { icon: Mic, title: "Zéro friction", desc: "Onboarding 100% vocal, pas de formulaire" },
  { icon: Globe, title: "16 langues", desc: "Arabe, ourdou, bengali, chinois…" },
  { icon: Brain, title: "Scoring IA", desc: "Qualification automatique des leads" },
  { icon: MapPin, title: "13 régions", desc: "Couverture nationale, partenaires locaux" },
  { icon: MessageCircle, title: "Photo Langage", desc: "Métaphores visuelles universelles" },
  { icon: Shield, title: "RGPD natif", desc: "Consentement explicite, données protégées" },
];

const STATS = [
  { value: "800K+", label: "Primo-arrivants / an en France" },
  { value: "72%", label: "Abandonnent les parcours classiques" },
  { value: "5 min", label: "Durée moyenne d'un onboarding" },
  { value: "< 48h", label: "Délai de recontact partenaire" },
];

export default function Pitch() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="ToFrance — Investisseurs & Partenaires"
        description="Découvrez le modèle économique de ToFrance : plateforme d'orientation et d'insertion pour les nouveaux arrivants en France."
        path="/pitch"
      />
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-24 pb-16">
          <div className="absolute inset-0 gradient-hero opacity-5" />
          <div className="relative mx-auto max-w-5xl px-4 pt-16 text-center sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent-foreground">
                <Sparkles className="h-4 w-4 text-accent" />
                Deck Investisseur 2026
              </div>
            </AnimatedContainer>

            <AnimatedContainer delay={0.1}>
              <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                L'orientation intelligente{" "}
                <span className="gradient-text">des primo-arrivants</span>
              </h1>
            </AnimatedContainer>

            <AnimatedContainer delay={0.2}>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
                ToFrance connecte les étrangers arrivant en France aux bons partenaires
                de formation et d'emploi grâce à une IA conversationnelle multilingue.
              </p>
            </AnimatedContainer>

            <AnimatedContainer delay={0.3}>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/onboarding">
                    <Mic className="h-5 w-5" />
                    Tester l'expérience
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

        {/* Le Problème */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                Le Problème
              </div>
              <h2 className="mb-8 text-3xl font-bold text-foreground sm:text-4xl">
                Un parcours d'intégration fragmenté
              </h2>
            </AnimatedContainer>

            <div className="grid gap-6 md:grid-cols-2">
              <AnimatedContainer delay={0.1}>
                <Card className="h-full border-destructive/20 bg-destructive/5">
                  <CardContent className="p-6">
                    <h3 className="mb-3 text-lg font-semibold text-foreground">
                      Côté primo-arrivants
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="mt-1 text-destructive">✕</span>
                        Barrière de la langue dès le premier jour
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1 text-destructive">✕</span>
                        Méconnaissance des dispositifs existants
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1 text-destructive">✕</span>
                        Formulaires complexes, parcours administratifs longs
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1 text-destructive">✕</span>
                        72% abandonnent avant de trouver la bonne formation
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </AnimatedContainer>

              <AnimatedContainer delay={0.2}>
                <Card className="h-full border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <h3 className="mb-3 text-lg font-semibold text-foreground">
                      Côté organismes de formation
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="mt-1 text-destructive">✕</span>
                        Difficulté à recruter des candidats qualifiés
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1 text-destructive">✕</span>
                        Profils mal orientés, forte déperdition
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1 text-destructive">✕</span>
                        Coût d'acquisition élevé et non prévisible
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1 text-destructive">✕</span>
                        Manque de données sur les besoins réels
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            </div>
          </div>
        </section>

        {/* La Solution */}
        <section className="py-20 bg-card/50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                La Solution
              </div>
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Marianne, conseillère IA multilingue
              </h2>
              <p className="mb-12 max-w-2xl text-lg text-muted-foreground">
                En 5 minutes de conversation vocale naturelle, Marianne évalue le profil,
                le niveau de français (CECRL) et les besoins, puis oriente vers la bonne filière.
              </p>
            </AnimatedContainer>

            <AnimatedContainer delay={0.1}>
              <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-lg">
                <div className="flex flex-col items-center gap-8 sm:flex-row">
                  {/* Marianne avatar */}
                  <div className="flex-shrink-0">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-4xl font-bold text-white shadow-xl">
                      M
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="mb-2 text-xl font-bold text-foreground">Comment ça marche</h3>
                    <ol className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                        L'utilisateur choisit sa langue et accepte le consentement
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                        Marianne pose des questions vocales + Photo Langage
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                        Le profil est scoré et routé vers le bon partenaire
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
                        Le partenaire reçoit un lead qualifié et recontacte sous 48h
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </section>

        {/* Routes d'orientation */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                Orientation
              </div>
              <h2 className="mb-12 text-3xl font-bold text-foreground sm:text-4xl">
                3 routes, 3 marchés
              </h2>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
              {ROUTES.map((route) => {
                const Icon = route.icon;
                return (
                  <StaggerItem key={route.letter}>
                    <Card className={`h-full bg-gradient-to-br ${route.color}`}>
                      <CardContent className="flex h-full flex-col p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-xl font-bold text-foreground shadow-sm">
                            {route.letter}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">{route.name}</h3>
                          </div>
                        </div>
                        <div className="mb-4 flex-1 space-y-2 text-sm text-muted-foreground">
                          <p><span className="font-medium text-foreground">Profil :</span> {route.profile}</p>
                          <p><span className="font-medium text-foreground">Partenaire :</span> {route.partner}</p>
                        </div>
                        <div className="rounded-xl bg-card/80 px-4 py-2 text-center">
                          <span className="text-2xl font-bold text-foreground">{route.price}</span>
                          <span className="block text-xs text-muted-foreground">par lead qualifié</span>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* Scoring */}
        <section className="py-20 bg-card/50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                Qualification
              </div>
              <h2 className="mb-8 text-3xl font-bold text-foreground sm:text-4xl">
                Lead scoring intelligent
              </h2>
              <p className="mb-12 max-w-2xl text-muted-foreground">
                Chaque lead est scoré de 0 à 100. Un lead est qualifié à partir de 70 points.
              </p>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
              {[
                { score: "30 pts", label: "Complétude du profil", desc: "Données personnelles, coordonnées, situation", icon: CheckCircle2 },
                { score: "50 pts", label: "Adéquation partenaire", desc: "Niveau CECRL, secteur visé, prérequis remplis", icon: Target },
                { score: "20 pts", label: "Réactivité", desc: "Disponibilité sous 48h pour un premier contact", icon: Zap },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <StaggerItem key={item.label}>
                    <Card className="h-full">
                      <CardContent className="p-6 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                          <Icon className="h-7 w-7 text-primary" />
                        </div>
                        <div className="mb-2 text-3xl font-bold text-primary">{item.score}</div>
                        <h3 className="mb-1 font-semibold text-foreground">{item.label}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* Avantages concurrentiels */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                Avantages
              </div>
              <h2 className="mb-12 text-3xl font-bold text-foreground sm:text-4xl">
                Pourquoi ToFrance gagne
              </h2>
            </AnimatedContainer>

            <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
              {ADVANTAGES.map((adv) => {
                const Icon = adv.icon;
                return (
                  <StaggerItem key={adv.title}>
                    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{adv.title}</h3>
                        <p className="text-sm text-muted-foreground">{adv.desc}</p>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* Chiffres clés */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 sm:p-12">
                <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl" />
                <div className="relative z-10">
                  <h2 className="mb-8 text-center text-3xl font-bold text-white sm:text-4xl">
                    Le marché en chiffres
                  </h2>
                  <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                    {STATS.map((stat) => (
                      <div key={stat.label} className="text-center">
                        <div className="text-3xl font-bold text-white sm:text-4xl">{stat.value}</div>
                        <div className="mt-1 text-sm text-white/70">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </section>

        {/* Business Model */}
        <section className="py-20 bg-card/50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                Business Model
              </div>
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Pricing par paliers × scoring
              </h2>
              <p className="mb-8 max-w-2xl text-muted-foreground">
                Le prix du lead est modulé selon le type de parcours et la qualité du matching IA.
                Plus le score est élevé, plus le lead a de chances de convertir.
              </p>
            </AnimatedContainer>

            <AnimatedContainer delay={0.1}>
              <div className="overflow-hidden rounded-2xl border border-border">
                <table className="w-full">
                  <thead>
                    <tr className="bg-card">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Type</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-success">🟢 Premium (≥80%)</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-primary">🔵 Standard (50-79%)</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-muted-foreground">⚪ Éco (&lt;50%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-card/80">
                      <td className="px-6 py-4 font-medium text-foreground">FLE (langue)</td>
                      <td className="px-6 py-4 text-center text-xl font-bold text-success">200 €</td>
                      <td className="px-6 py-4 text-center text-xl font-bold text-primary">150 €</td>
                      <td className="px-6 py-4 text-center text-xl font-bold text-muted-foreground">100 €</td>
                    </tr>
                    <tr className="hover:bg-card/80">
                      <td className="px-6 py-4 font-medium text-foreground">CQP (qualification pro)</td>
                      <td className="px-6 py-4 text-center text-xl font-bold text-success">280 €</td>
                      <td className="px-6 py-4 text-center text-xl font-bold text-primary">200 €</td>
                      <td className="px-6 py-4 text-center text-xl font-bold text-muted-foreground">140 €</td>
                    </tr>
                    <tr className="hover:bg-card/80">
                      <td className="px-6 py-4 font-medium text-foreground">TP (titre professionnel)</td>
                      <td className="px-6 py-4 text-center text-xl font-bold text-success">400 €</td>
                      <td className="px-6 py-4 text-center text-xl font-bold text-primary">300 €</td>
                      <td className="px-6 py-4 text-center text-xl font-bold text-muted-foreground">200 €</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </AnimatedContainer>

            <AnimatedContainer delay={0.2} className="mt-8">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-start gap-4 p-6">
                  <TrendingUp className="h-6 w-6 flex-shrink-0 text-primary" />
                  <div>
                    <h3 className="mb-1 font-semibold text-foreground">Coût d'acquisition quasi nul</h3>
                    <p className="text-sm text-muted-foreground">
                      Acquisition organique via SEO multilingue et bouche-à-oreille communautaire.
                      Chaque utilisateur satisfait devient ambassadeur auprès de sa communauté linguistique.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>
        </section>

        {/* Projection financière */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                Projections
              </div>
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Revenue forecast — 3 ans
              </h2>
              <p className="mb-12 max-w-2xl text-muted-foreground">
                Hypothèses conservatrices basées sur le volume de primo-arrivants et un taux de conversion progressif.
              </p>
            </AnimatedContainer>

            <AnimatedContainer delay={0.1}>
              <Card className="overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "T2 2026", fle: 30, cqp: 10, tp: 3, total: "MVP" },
                          { name: "T4 2026", fle: 60, cqp: 25, tp: 8, total: "270K €" },
                          { name: "S1 2027", fle: 120, cqp: 50, tp: 15, total: "500K €" },
                          { name: "S2 2027", fle: 180, cqp: 80, tp: 25, total: "1M €" },
                          { name: "S1 2028", fle: 300, cqp: 130, tp: 40, total: "1,9M €" },
                          { name: "S2 2028", fle: 400, cqp: 180, tp: 55, total: "2,88M €" },
                        ]}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} label={{ value: "Leads / période", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px",
                            color: "hsl(var(--foreground))",
                          }}
                          formatter={(value: number, name: string) => {
                            const labels: Record<string, string> = { fle: "FLE (100–200€)", cqp: "CQP (140–280€)", tp: "TP (200–400€)" };
                            return [value, labels[name] || name];
                          }}
                        />
                        <Legend
                          formatter={(value: string) => {
                            const labels: Record<string, string> = { fle: "FLE", cqp: "CQP", tp: "TP" };
                            return labels[value] || value;
                          }}
                        />
                        <Bar dataKey="fle" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="cqp" stackId="a" fill="hsl(var(--accent-foreground))" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="tp" stackId="a" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            <StaggerContainer className="mt-8 grid gap-4 sm:grid-cols-3" staggerDelay={0.1}>
              {[
                { year: "Y1 (2026)", revenue: "270K €", leads: "10 partenaires · 80 leads/mois", highlight: false },
                { year: "Y2 (2027)", revenue: "1M €", leads: "30 partenaires · 250 leads/mois", highlight: true },
                { year: "Y3 (2028)", revenue: "2,88M €", leads: "70 partenaires · 600 leads/mois", highlight: false },
              ].map((yr) => (
                <StaggerItem key={yr.year}>
                  <Card className={yr.highlight ? "border-primary/30 bg-primary/5 ring-2 ring-primary/20" : ""}>
                    <CardContent className="p-6 text-center">
                      <p className="mb-1 text-sm font-medium text-muted-foreground">{yr.year}</p>
                      <p className="text-3xl font-bold text-foreground">{yr.revenue}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{yr.leads}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <AnimatedContainer delay={0.3} className="mt-8">
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <h3 className="mb-3 font-semibold text-foreground">Hypothèses clés</h3>
                  <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      Panier moyen : 210 € / lead (mix pondéré par scoring)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      Taux de déblocage : 60% → 75% (amélioration progressive)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      CAB &lt; 8 € par profil qualifié · Marge brute 100%
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      Marge nette : 59% (Y1) → 71% (Y3)
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <AnimatedContainer>
              <Heart className="mx-auto mb-6 h-12 w-12 text-primary" />
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Rejoignez l'aventure ToFrance
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
                Nous construisons le pont entre les talents internationaux et les opportunités françaises.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/onboarding">
                    <Mic className="h-5 w-5" />
                    Tester le produit
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="glass" size="xl" asChild>
                  <a href="mailto:contact@tofrance.fr">
                    <BarChart3 className="h-5 w-5" />
                    Nous contacter
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

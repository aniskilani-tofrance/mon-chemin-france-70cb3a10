import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Languages,
  GraduationCap,
  Users,
  Award,
  Briefcase,
  Sparkles,
  MapPin,
  Clock,
  Mail,
  Building2,
  Calendar,
  Send,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Heart,
  Compass,
  Handshake,
  LineChart,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/AnimatedContainer";
import { supabase } from "@/integrations/supabase/client";
import { useRateLimit } from "@/hooks/useRateLimit";

const CONTACT_EMAIL = "contact@parleremploi.fr";

type Section = { titre: string; texte?: string; items?: string[] };

const POSTES = [
  {
    id: "projet-pilote",
    titre: "Stagiaire Chargé(e) de projet pilote",
    sousTitre: "Innovation sociale, IA, orientation et accès à l'emploi",
    objetMail: "Candidature stage – Chargé(e) de projet pilote ToFrance",
    icon: Compass,
    mission:
      "Participer à l'organisation des tests terrain, recueillir les retours utilisateurs, analyser les besoins et suivre les premiers indicateurs d'impact.",
    missions: [
      "Organiser les tests avec les bénéficiaires",
      "Préparer les questionnaires de diagnostic",
      "Recueillir les retours terrain",
      "Identifier les freins rencontrés",
      "Rédiger des synthèses claires",
      "Contribuer à l'amélioration du parcours",
    ],
    profil:
      "Étudiant(e) en innovation sociale, ESS, sciences sociales, gestion de projet, développement territorial, insertion ou formation.",
    sections: [
      {
        titre: "Missions principales",
        texte:
          "Sous la responsabilité de l'équipe projet, vous participerez à la mise en œuvre opérationnelle de la phase pilote de ToFrance.",
        items: [
          "Organiser les sessions de tests avec des bénéficiaires",
          "Préparer les supports de test et questionnaires de diagnostic",
          "Participer à l'accueil et à l'observation des utilisateurs",
          "Recueillir les retours terrain des bénéficiaires et partenaires",
          "Identifier les freins rencontrés : langue, numérique, mobilité, emploi, administratif, reconnaissance des diplômes",
          "Analyser les besoins spécifiques des publics réfugiés et primo-arrivants",
          "Contribuer à la structuration des parcours d'orientation",
          "Suivre les premiers indicateurs d'impact",
          "Rédiger des comptes rendus clairs après les sessions de test",
          "Proposer des pistes d'amélioration pour la plateforme",
          "Participer à la préparation de synthèses pour les partenaires, financeurs et institutions",
        ],
      },
      {
        titre: "Parcours travaillés pendant le pilote",
        texte: "Vous participerez notamment à la structuration de plusieurs parcours clés :",
        items: [
          "Parcours d'accès au français",
          "Parcours d'orientation vers la formation professionnelle",
          "Parcours spécifique pour les personnes réfugiées",
          "Parcours de reconnaissance des diplômes et compétences acquis à l'étranger",
          "Parcours vers les métiers en tension",
          "Parcours de mise en relation avec des partenaires emploi, formation ou accompagnement",
        ],
      },
      {
        titre: "Profil recherché",
        texte: "Vous êtes étudiant(e) en Bachelor, Master 1 ou Master 2 dans l'un des domaines suivants :",
        items: [
          "Innovation sociale",
          "Économie sociale et solidaire",
          "Sciences sociales",
          "Politiques publiques",
          "Insertion professionnelle",
          "Développement territorial",
          "Gestion de projet",
          "Formation",
          "Accompagnement social",
          "Entrepreneuriat social",
        ],
      },
      {
        titre: "Qualités attendues",
        items: [
          "Organisée",
          "Autonome",
          "À l'écoute",
          "À l'aise avec les publics fragilisés",
          "Capable d'observer et d'analyser",
          "Bon esprit de synthèse",
          "Sensible aux enjeux d'accès à l'emploi, de migration, de formation et d'inclusion",
          "Capable de transformer des retours terrain en propositions concrètes",
        ],
      },
      {
        titre: "Ce que vous allez apprendre",
        texte:
          "Ce stage vous permettra de participer à la construction d'un projet innovant à impact social, à la croisée de l'intelligence artificielle, de l'insertion professionnelle, de l'apprentissage du français et de l'accompagnement des parcours de vie. Vous découvrirez concrètement comment se construit une phase pilote : tests utilisateurs, retours terrain, adaptation du produit, mesure d'impact, relation partenaires et amélioration continue.",
      },
      {
        titre: "Pourquoi rejoindre ToFrance ?",
        texte:
          "Vous ne rejoignez pas seulement un projet numérique. Vous participez à une solution qui veut aider des personnes à comprendre leurs possibilités, faire reconnaître leur parcours, accéder à la langue, se former et avancer vers un emploi durable. Vous contribuerez à un projet utile, humain et concret, dès ses premières étapes.",
      },
    ] as Section[],
  },
  {
    id: "ux-produit",
    titre: "Stagiaire UX / Produit no-code",
    sousTitre: "Plateforme IA d'orientation vers la langue, la formation et l'emploi",
    objetMail: "Candidature stage – UX Produit ToFrance",
    icon: Lightbulb,
    mission:
      "Améliorer l'expérience utilisateur de la plateforme et simplifier les parcours d'orientation.",
    missions: [
      "Tester les parcours utilisateurs",
      "Identifier les points de friction",
      "Simplifier les écrans et les questions",
      "Créer des scénarios utilisateurs",
      "Contribuer à la construction no-code",
      "Documenter les améliorations produit",
    ],
    profil:
      "Étudiant(e) en UX design, product management, design de service, no-code, marketing digital ou innovation sociale.",
    sections: [
      {
        titre: "Le besoin",
        texte:
          "Pour que ToFrance fonctionne vraiment, l'expérience utilisateur doit être très simple. La plateforme doit pouvoir être utilisée par des personnes qui ne maîtrisent pas toujours bien le français, le numérique ou les codes administratifs. Dans le cadre de la phase pilote, nous recherchons un(e) stagiaire UX / Produit no-code pour nous aider à tester, améliorer et simplifier les parcours utilisateurs.",
      },
      {
        titre: "Missions principales",
        texte: "Vous participerez à l'amélioration de l'expérience utilisateur de la plateforme.",
        items: [
          "Tester les parcours utilisateurs existants",
          "Identifier les points de blocage dans l'expérience",
          "Simplifier les écrans, les questions et les étapes",
          "Améliorer les scénarios de diagnostic",
          "Créer des parcours types selon les profils utilisateurs",
          "Travailler sur le parcours spécifique réfugié",
          "Contribuer au parcours de reconnaissance des diplômes et compétences acquis à l'étranger",
          "Réfléchir aux parcours vers les métiers en tension",
          "Proposer des améliorations concrètes pour rendre la plateforme plus accessible",
          "Participer à la structuration des contenus dans des outils no-code",
          "Documenter les bugs, besoins et évolutions produit",
          "Aider à préparer des supports de démonstration pour les partenaires",
        ],
      },
      {
        titre: "Parcours utilisateurs à travailler",
        items: [
          "Une personne qui veut apprendre le français",
          "Une personne réfugiée qui cherche à reconstruire un projet professionnel",
          "Une personne diplômée à l'étranger qui souhaite faire reconnaître ses compétences",
          "Une personne qui cherche une formation courte vers un métier en tension",
          "Une personne éloignée de l'emploi qui ne sait pas par où commencer",
          "Une structure partenaire qui souhaite orienter un bénéficiaire",
        ],
      },
      {
        titre: "Profil recherché",
        texte: "Vous êtes étudiant(e) en :",
        items: [
          "UX design",
          "UI design",
          "Product management",
          "Design de service",
          "No-code",
          "Marketing digital",
          "Innovation sociale",
          "Communication digitale",
          "Entrepreneuriat",
          "École de commerce ou école du numérique",
        ],
      },
      {
        titre: "Compétences appréciées",
        items: [
          "Notions d'UX/UI",
          "Capacité à tester un parcours utilisateur",
          "Capacité à simplifier une interface",
          "Bonne rédaction",
          "Esprit logique",
          "Sens de l'accessibilité",
          "Intérêt pour les outils no-code : Lovable, Bubble, Airtable, Notion, Canva ou équivalents",
          "Intérêt pour l'intelligence artificielle appliquée à l'impact social",
          "Capacité à proposer des solutions simples et pratiques",
        ],
      },
      {
        titre: "Qualités attendues",
        items: [
          "Curieuse",
          "Autonome",
          "Organisée",
          "Créative",
          "Rigoureuse",
          "Sensible aux enjeux sociaux",
          "À l'aise avec les outils numériques",
          "Capable de tester, observer, comprendre et améliorer",
        ],
      },
      {
        titre: "Pourquoi rejoindre ToFrance ?",
        texte:
          "Parce que l'UX, ici, n'est pas seulement une question de design. C'est une question d'accès, de compréhension, de dignité. Votre travail aidera des personnes à mieux comprendre leurs possibilités, à s'orienter plus facilement et à trouver leur place dans un parcours de langue, de formation ou d'emploi.",
      },
    ] as Section[],
  },
  {
    id: "partenariats",
    titre: "Stagiaire Partenariats / Développement",
    sousTitre: "Innovation sociale, insertion, formation et intelligence artificielle",
    objetMail: "Candidature stage – Partenariats ToFrance",
    icon: Handshake,
    mission:
      "Identifier et mobiliser les partenaires qui pourront participer à la phase pilote de ToFrance.",
    missions: [
      "Cartographier les partenaires",
      "Créer une base de contacts",
      "Préparer les messages de prise de contact",
      "Participer aux relances",
      "Organiser des rendez-vous",
      "Suivre les échanges dans un tableau de bord",
      "Contribuer à la structuration de l'offre pilote",
    ],
    profil:
      "Étudiant(e) en développement commercial, communication, ESS, relations institutionnelles, développement territorial ou entrepreneuriat social.",
    sections: [
      {
        titre: "Le besoin",
        texte:
          "La réussite de ToFrance repose sur un réseau solide de partenaires. Pour tester la plateforme, orienter les bons publics et construire des parcours utiles, nous devons mobiliser des associations, centres sociaux, organismes de formation, acteurs de l'emploi, structures d'accueil, collectivités, entreprises et institutions.",
      },
      {
        titre: "Missions principales",
        texte: "Vous participerez au développement du réseau de partenaires de ToFrance.",
        items: [
          "Identifier les partenaires potentiels du projet",
          "Cartographier les acteurs de l'insertion, de la formation, de l'emploi, de l'accueil des réfugiés et de l'accompagnement social",
          "Créer et mettre à jour une base de contacts",
          "Qualifier les partenaires selon leur rôle potentiel dans le pilote",
          "Préparer des messages de prise de contact",
          "Participer aux relances par mail ou LinkedIn",
          "Organiser des rendez-vous de présentation",
          "Préparer des supports simples pour présenter ToFrance",
          "Suivre les échanges dans un tableau de bord",
          "Aider à structurer l'offre pilote pour les partenaires",
          "Identifier les besoins des structures terrain",
          "Contribuer à la préparation de dossiers partenaires, financeurs ou institutions",
        ],
      },
      {
        titre: "Types de partenaires à identifier",
        items: [
          "Associations d'accueil et d'accompagnement des personnes réfugiées",
          "Structures d'accompagnement des primo-arrivants",
          "Centres sociaux et maisons de quartier",
          "Organismes de formation linguistique et professionnelle",
          "Acteurs de l'emploi et de l'insertion",
          "Missions locales",
          "Collectivités territoriales",
          "Entreprises confrontées à des besoins de recrutement",
          "Acteurs des métiers en tension",
          "Structures spécialisées dans la reconnaissance des diplômes ou l'orientation professionnelle",
        ],
      },
      {
        titre: "Profil recherché",
        texte: "Vous êtes étudiant(e) en :",
        items: [
          "Développement commercial",
          "Communication",
          "Économie sociale et solidaire",
          "Gestion de projet",
          "Relations institutionnelles",
          "Développement territorial",
          "Sciences politiques",
          "Entrepreneuriat social",
          "École de commerce",
          "Politiques publiques",
          "Insertion ou formation",
        ],
      },
      {
        titre: "Compétences appréciées",
        items: [
          "Aisance relationnelle",
          "Bonne rédaction",
          "Capacité à rechercher et qualifier des contacts",
          "Sens de l'organisation",
          "Maîtrise des outils bureautiques",
          "Capacité à suivre un tableau de bord",
          "Aisance avec LinkedIn et les recherches en ligne",
          "Capacité à comprendre les besoins d'un partenaire",
          "Intérêt pour l'insertion, la formation, l'emploi et l'innovation sociale",
        ],
      },
      {
        titre: "Qualités attendues",
        items: [
          "Curieuse",
          "Autonome",
          "Persévérante",
          "Structurée",
          "À l'aise à l'écrit",
          "Capable de prendre des initiatives",
          "Sensible aux enjeux sociaux",
          "Motivée par un projet utile et concret",
        ],
      },
      {
        titre: "Pourquoi rejoindre ToFrance ?",
        texte:
          "Parce que ce stage vous place au cœur d'un projet qui relie plusieurs enjeux majeurs : l'accès à la langue, à la formation et à l'emploi, la reconnaissance des compétences, l'accompagnement des personnes réfugiées, la réponse aux besoins des métiers en tension, et l'usage de l'intelligence artificielle au service de l'impact social. Vous contribuerez à construire les premiers partenariats d'un projet ambitieux, humain et ancré dans le terrain.",
      },
    ] as Section[],
  },
] as const;

const POURQUOI = [
  { icon: Languages, titre: "Accès à la langue", texte: "Comprendre, parler, écrire pour avancer." },
  { icon: GraduationCap, titre: "Orientation vers la formation", texte: "Trouver le bon parcours, au bon moment." },
  { icon: Heart, titre: "Parcours réfugiés", texte: "Un accompagnement adapté à chaque histoire." },
  { icon: Award, titre: "Reconnaissance des diplômes", texte: "Valoriser les compétences déjà acquises." },
  { icon: Briefcase, titre: "Métiers en tension", texte: "Connecter les talents aux besoins réels." },
];

const APPRENTISSAGES = [
  { icon: Sparkles, texte: "Construire un projet IA en phase pilote" },
  { icon: Users, texte: "Comprendre les enjeux de l'insertion professionnelle" },
  { icon: Handshake, texte: "Travailler avec des publics et partenaires terrain" },
  { icon: LineChart, texte: "Participer à un projet incubé à impact social" },
  { icon: Lightbulb, texte: "Transformer des besoins réels en solutions concrètes" },
  { icon: Heart, texte: "Développer une expérience utile pour l'ESS et la tech for good" },
];

const QUALITES = [
  "Sens du terrain",
  "Autonomie",
  "Rigueur",
  "Esprit d'initiative",
  "Bonne rédaction",
  "Sens de l'écoute",
  "Intérêt pour l'IA et l'impact social",
  "Envie de contribuer à un projet utile",
];

const INFOS = [
  { icon: Building2, label: "Structure", value: "ParlerEmploi Formation" },
  { icon: Sparkles, label: "Projet", value: "ToFrance" },
  { icon: MapPin, label: "Lieu", value: "Saint-Ouen / Île-de-France" },
  { icon: Users, label: "Format", value: "Hybride possible" },
  { icon: Briefcase, label: "Contrat", value: "Stage" },
  { icon: Clock, label: "Durée", value: "2 à 6 mois selon profil" },
  { icon: Calendar, label: "Début", value: "Dès que possible" },
  { icon: Mail, label: "Email", value: CONTACT_EMAIL },
];

const candidatureSchema = z.object({
  prenom: z.string().trim().min(1, "Prénom requis").max(60),
  nom: z.string().trim().min(1, "Nom requis").max(60),
  email: z.string().trim().email("Email invalide").max(255),
  telephone: z.string().trim().max(30).optional().or(z.literal("")),
  poste: z.string().min(1, "Choisissez un poste"),
  message: z.string().trim().min(10, "Message trop court").max(2000),
  lien: z.string().trim().max(300).optional().or(z.literal("")),
});

function buildMailto(poste?: string) {
  const labelPoste = POSTES.find((p) => p.id === poste)?.titre ?? "à préciser";
  const subject = `Candidature stage ToFrance – ${labelPoste}`;
  const body = `Bonjour,\n\nJe souhaite candidater au stage ${labelPoste} dans le cadre de la phase pilote de ToFrance.\n\nVous trouverez ci-joint mon CV et quelques lignes de motivation.\n\nMerci pour votre retour.\n\nCordialement,`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Recrutement() {
  const [posteSelectionne, setPosteSelectionne] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const rateLimit = useRateLimit(3, 120_000);

  const scrollTo = (id: string, poste?: string) => {
    if (poste) setPosteSelectionne(poste);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      prenom: String(data.get("prenom") ?? ""),
      nom: String(data.get("nom") ?? ""),
      email: String(data.get("email") ?? ""),
      telephone: String(data.get("telephone") ?? ""),
      poste: posteSelectionne,
      message: String(data.get("message") ?? ""),
      lien: String(data.get("lien") ?? ""),
    };

    const parsed = candidatureSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    if (!rateLimit.check()) {
      toast.error("Trop d'envois. Réessayez dans quelques minutes.");
      return;
    }

    const labelPoste = POSTES.find((p) => p.id === parsed.data.poste)?.titre ?? parsed.data.poste;
    const messageComplet = [
      `Poste : ${labelPoste}`,
      `Téléphone : ${parsed.data.telephone || "—"}`,
      `Lien : ${parsed.data.lien || "—"}`,
      "",
      parsed.data.message,
    ].join("\n");

    setLoading(true);
    const { error } = await supabase.from("contact_requests").insert({
      name: `${parsed.data.prenom} ${parsed.data.nom}`.trim(),
      email: parsed.data.email,
      message: messageComplet,
      request_type: "internship",
    });
    setLoading(false);

    if (error) {
      toast.error("Erreur lors de l'envoi. Vous pouvez aussi nous écrire par email.");
      return;
    }
    setSent(true);
    toast.success("Candidature envoyée !");
    form.reset();
  };

  const jobPostingsJsonLd = {
    "@context": "https://schema.org",
    "@graph": POSTES.map((p) => ({
      "@type": "JobPosting",
      title: p.titre,
      description: p.mission,
      datePosted: new Date().toISOString().slice(0, 10),
      employmentType: "INTERN",
      hiringOrganization: {
        "@type": "Organization",
        name: "ParlerEmploi Formation",
        sameAs: "https://tofrance.app",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Saint-Ouen",
          addressRegion: "Île-de-France",
          addressCountry: "FR",
        },
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Recrutement stages — Phase pilote ToFrance"
        description="ParlerEmploi Formation recrute 3 stagiaires pour la phase pilote de ToFrance, plateforme IA d'orientation pour l'accès à la langue, la formation et l'emploi."
        path="/recrutement"
        jsonLd={jobPostingsJsonLd}
      />
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimatedContainer>
            <Badge variant="secondary" className="mb-6">Phase pilote · ToFrance</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Rejoignez la phase pilote de ToFrance
            </h1>
            <p className="mt-6 text-xl font-medium text-foreground/90 sm:text-2xl">
              Nous recrutons 3 stagiaires pour construire une plateforme IA à impact social,
              au service de l'accès à la langue, à la formation et à l'emploi.
            </p>
            <p className="mt-6 max-w-3xl text-base text-muted-foreground sm:text-lg">
              ToFrance aide les personnes réfugiées, primo-arrivantes ou éloignées de l'emploi
              à trouver le bon parcours, dans leur langue, selon leur situation. Notre objectif :
              créer un pont entre les talents disponibles et les besoins réels des métiers en tension.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => scrollTo("postes")} className="gap-2">
                Voir les postes <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo("candidater")}>
                Candidater
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {[
                "Stage 2 à 6 mois",
                "Saint-Ouen / hybride",
                "Début dès que possible",
                "Projet à impact social",
                "IA, formation et emploi",
              ].map((b) => (
                <Badge key={b} variant="outline" className="rounded-full px-3 py-1 text-xs sm:text-sm">
                  {b}
                </Badge>
              ))}
            </div>
          </AnimatedContainer>
        </div>
      </section>

      {/* POURQUOI */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Un projet né du terrain
            </h2>
            <div className="mt-6 space-y-4 text-base text-muted-foreground sm:text-lg">
              <p>
                Aujourd'hui, beaucoup de personnes veulent travailler, se former ou faire reconnaître
                leur parcours, mais ne savent pas toujours par où commencer. La langue, les démarches,
                le numérique, la reconnaissance des diplômes ou le manque d'information peuvent
                devenir de vrais freins.
              </p>
              <p>En parallèle, de nombreux secteurs essentiels peinent à recruter.</p>
              <p className="font-medium text-foreground">
                ToFrance veut rapprocher ces deux réalités grâce à une plateforme simple,
                multilingue et personnalisée.
              </p>
            </div>
          </div>

          <StaggerContainer className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {POURQUOI.map(({ icon: Icon, titre, texte }) => (
              <StaggerItem key={titre}>
                <Card variant="feature" className="h-full">
                  <CardContent className="p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{titre}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{texte}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* POSTES */}
      <section id="postes" className="bg-muted/30 py-20 sm:py-24 scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4">3 postes ouverts</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Les stages que nous recrutons
            </h2>
            <p className="mt-4 text-muted-foreground sm:text-lg">
              Trois rôles complémentaires pour donner vie à la phase pilote de ToFrance.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {POSTES.map((p) => {
              const Icon = p.icon;
              return (
                <Card key={p.id} variant="elevated" className="flex h-full flex-col">
                  <CardContent className="flex flex-1 flex-col p-6 sm:p-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-foreground">{p.titre}</h3>
                    <p className="mt-3 text-sm text-muted-foreground">{p.mission}</p>

                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                        Missions
                      </p>
                      <ul className="mt-3 space-y-2">
                        {p.missions.map((m) => (
                          <li key={m} className="flex items-start gap-2 text-sm text-foreground/80">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 rounded-lg bg-muted/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                        Profil
                      </p>
                      <p className="mt-2 text-sm text-foreground/80">{p.profil}</p>
                    </div>

                    <div className="mt-6 flex-1" />
                    <div className="mt-2 flex flex-col gap-2">
                      <Button
                        className="w-full gap-2"
                        onClick={() => scrollTo("candidater", p.id)}
                      >
                        Candidater pour ce poste
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setOffreOuverte(p.id)}
                      >
                        Voir l'offre complète
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* APPRENTISSAGES */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ce que vous allez apprendre
            </h2>
            <p className="mt-4 text-muted-foreground sm:text-lg">
              Une expérience concrète, utile et formatrice, au cœur d'un projet en construction.
            </p>
          </div>

          <StaggerContainer className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {APPRENTISSAGES.map(({ icon: Icon, texte }) => (
              <StaggerItem key={texte}>
                <Card variant="default" className="h-full">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{texte}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* PROFIL */}
      <section className="bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Profil commun recherché
          </h2>
          <p className="mt-6 max-w-3xl text-base text-muted-foreground sm:text-lg">
            Nous cherchons des profils curieux, autonomes, sensibles aux enjeux sociaux,
            capables de travailler sur un projet en construction.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {QUALITES.map((q) => (
              <Badge key={q} variant="outline" className="rounded-full bg-background px-4 py-2 text-sm">
                {q}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* INFOS PRATIQUES */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Informations pratiques
          </h2>
          <Card variant="feature" className="mt-8">
            <CardContent className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
              {INFOS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground break-words">
                      {label === "Email" ? (
                        <a href={`mailto:${value}`} className="text-primary hover:underline">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA + FORMULAIRE */}
      <section id="candidater" className="bg-gradient-to-b from-primary/5 to-background py-20 sm:py-24 scroll-mt-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Vous voulez contribuer à un projet utile, concret et humain ?
            </h2>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              Envoyez votre CV et quelques lignes de motivation en précisant le poste qui vous intéresse.
            </p>
          </div>

          <Card variant="elevated" className="mt-10">
            <CardContent className="p-6 sm:p-8">
              {sent ? (
                <div className="py-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-foreground">
                    Merci pour votre candidature !
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nous reviendrons vers vous très rapidement.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input id="prenom" name="prenom" maxLength={60} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom</Label>
                      <Input id="nom" name="nom" maxLength={60} required />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" maxLength={255} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telephone">Téléphone</Label>
                      <Input id="telephone" name="telephone" type="tel" maxLength={30} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="poste">Poste choisi</Label>
                    <Select value={posteSelectionne} onValueChange={setPosteSelectionne}>
                      <SelectTrigger id="poste">
                        <SelectValue placeholder="Sélectionnez un poste" />
                      </SelectTrigger>
                      <SelectContent>
                        {POSTES.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.titre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lien">Lien LinkedIn ou portfolio (optionnel)</Label>
                    <Input id="lien" name="lien" placeholder="https://..." maxLength={300} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message de motivation</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={5}
                      maxLength={2000}
                      placeholder="Présentez-vous en quelques lignes et expliquez ce qui vous attire dans ce projet."
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="submit" size="lg" className="gap-2 sm:flex-1" disabled={loading}>
                      {loading ? "Envoi…" : "Envoyer ma candidature"}
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      asChild
                      className="gap-2"
                    >
                      <a href={buildMailto(posteSelectionne)}>
                        <Mail className="h-4 w-4" />
                        Envoyer par email
                      </a>
                    </Button>
                  </div>

                  <p className="text-center text-xs text-muted-foreground">
                    Vous pouvez aussi nous écrire directement à{" "}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                      {CONTACT_EMAIL}
                    </a>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}

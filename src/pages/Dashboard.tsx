import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/LoadingScreen";
import { EmptyState } from "@/components/LoadingScreen";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingResult } from "@/hooks/useOnboardingResult";
import { supabase } from "@/integrations/supabase/client";
import {
  User,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
  FileText,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FLEDashboardCard } from "@/components/FLE/FLEDashboardCard";

const DEMO_EMAIL = "demo@tofrance.fr";

const ROUTE_INFO: Record<string, { label: string; emoji: string; desc: string; color: string }> = {
  route_a: { label: "Parcours FLE", emoji: "📘", desc: "Formation en français langue étrangère", color: "bg-blue-100 text-blue-800" },
  route_b: { label: "Parcours Formation", emoji: "🎓", desc: "Formation professionnelle qualifiante", color: "bg-purple-100 text-purple-800" },
  route_c: { label: "Parcours Emploi", emoji: "💼", desc: "Accès direct au marché du travail", color: "bg-emerald-100 text-emerald-800" },
  sas: { label: "Accompagnement", emoji: "🤝", desc: "Orientation et accompagnement personnalisé", color: "bg-amber-100 text-amber-800" },
};

const STATUS_INFO: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "En attente", color: "bg-muted text-muted-foreground", icon: Clock },
  a_qualifier: { label: "À qualifier", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
  qualifie_fle: { label: "Qualifié FLE", color: "bg-blue-100 text-blue-800", icon: GraduationCap },
  qualifie_of: { label: "Qualifié OF", color: "bg-purple-100 text-purple-800", icon: GraduationCap },
  qualifie_employeur: { label: "Qualifié Employeur", color: "bg-emerald-100 text-emerald-800", icon: Briefcase },
  sas_insertion: { label: "SAS Insertion", color: "bg-amber-100 text-amber-800", icon: Shield },
  transmis_partenaire: { label: "Transmis", color: "bg-indigo-100 text-indigo-800", icon: ArrowRight },
  rdv_fixe: { label: "RDV fixé", color: "bg-cyan-100 text-cyan-800", icon: Clock },
  contacted: { label: "Contacté", color: "bg-sky-100 text-sky-800", icon: Phone },
  entre_formation: { label: "En formation", color: "bg-green-100 text-green-800", icon: GraduationCap },
  converted: { label: "Converti", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  recrute: { label: "Recruté", color: "bg-green-200 text-green-900", icon: CheckCircle2 },
  rejected: { label: "Rejeté", color: "bg-red-100 text-red-800", icon: AlertCircle },
  perdu_injoignable: { label: "Injoignable", color: "bg-gray-100 text-gray-600", icon: AlertCircle },
};

const CECRL_LABELS: Record<string, string> = {
  alpha: "Alphabétisation",
  a1: "A1 – Débutant",
  a2: "A2 – Élémentaire",
  b1: "B1 – Intermédiaire",
  b2: "B2 – Avancé",
  c1: "C1 – Autonome",
};

/** Identity-only profile from the profiles table */
interface ProfileIdentity {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  postal_code: string | null;
  origin_country: string | null;
  previous_job: string | null;
  created_at: string;
}

interface LeadData {
  id: string;
  status: string;
  match_score: number | null;
  created_at: string;
  contacted_at: string | null;
  training: { title: string; training_type: string } | null;
  provider: { name: string; city: string | null } | null;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: onboarding, isLoading: onboardingLoading } = useOnboardingResult();
  const [profile, setProfile] = useState<ProfileIdentity | null>(null);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);

  // Also check legacy profiles columns as fallback for users who onboarded before the migration
  const [legacyOrientation, setLegacyOrientation] = useState<{
    lead_route: string | null;
    lead_score: number | null;
    french_level_cecrl: string | null;
    work_right: string | null;
    target_sector: string | null;
    main_goal: string | null;
    barriers: string[] | null;
    skills: string[] | null;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setLoading(true);

      // Fetch identity-only profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, full_name, email, phone, city, postal_code, origin_country, previous_job, created_at, lead_route, lead_score, french_level_cecrl, work_right, target_sector, main_goal, barriers, skills")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (profileData) {
        setProfile({
          id: profileData.id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          full_name: profileData.full_name,
          email: profileData.email,
          phone: profileData.phone,
          city: profileData.city,
          postal_code: profileData.postal_code,
          origin_country: profileData.origin_country,
          previous_job: profileData.previous_job,
          created_at: profileData.created_at,
        });
        // Keep legacy orientation data as fallback
        setLegacyOrientation({
          lead_route: profileData.lead_route,
          lead_score: profileData.lead_score,
          french_level_cecrl: profileData.french_level_cecrl,
          work_right: profileData.work_right,
          target_sector: profileData.target_sector,
          main_goal: profileData.main_goal,
          barriers: profileData.barriers,
          skills: profileData.skills,
        });

        // Fetch leads
        const { data: leadsData } = await supabase
          .from("leads")
          .select(`
            id, status, match_score, created_at, contacted_at,
            trainings(title, training_type),
            training_providers(name, city)
          `)
          .eq("profile_id", profileData.id)
          .order("created_at", { ascending: false });

        setLeads(
          (leadsData || []).map((l: any) => ({
            ...l,
            training: l.trainings,
            provider: l.training_providers,
          }))
        );
      }

      setLoading(false);
    }

    fetchData();
  }, [user]);

  const isPageLoading = authLoading || loading || onboardingLoading;
  if (isPageLoading) return <LoadingScreen />;

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="mx-auto max-w-3xl px-4">
            <EmptyState
              icon={<User className="h-6 w-6 text-muted-foreground" />}
              title="Pas encore de profil"
              description="Complétez votre parcours d'orientation pour accéder à votre espace personnel."
            />
            <div className="mt-6 text-center">
              <Button asChild>
                <Link to="/onboarding">Commencer mon orientation →</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Orientation data: prefer onboarding_results, fall back to legacy profiles columns
  const orientation = {
    lead_route: onboarding?.lead_route ?? legacyOrientation?.lead_route ?? null,
    lead_score: onboarding?.lead_score ?? legacyOrientation?.lead_score ?? null,
    french_level_cecrl: onboarding?.french_level_cecrl ?? legacyOrientation?.french_level_cecrl ?? null,
    work_right: onboarding?.work_right ?? legacyOrientation?.work_right ?? null,
    target_sector: onboarding?.target_sector ?? legacyOrientation?.target_sector ?? null,
    main_goal: onboarding?.main_goal ?? legacyOrientation?.main_goal ?? null,
    barriers: onboarding?.barriers ?? legacyOrientation?.barriers ?? null,
    skills: legacyOrientation?.skills ?? null, // skills only in profiles
  };

  const routeInfo = ROUTE_INFO[orientation.lead_route || "sas"] || ROUTE_INFO.sas;
  const displayName = profile.full_name || profile.first_name || user?.email?.split("@")[0] || "Candidat";

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Mon espace — ToFrance" description="Votre tableau de bord personnalisé" path="/dashboard" />
      <Header />
      <main className="pt-24 pb-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Demo Banner */}
          {user?.email === DEMO_EMAIL && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
              <span className="text-lg">🧪</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">Mode démo</p>
                <p className="text-xs opacity-80">Ce compte est un exemple pré-rempli pour découvrir la plateforme.</p>
              </div>
              <Badge className="border-amber-400 bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100">Démo</Badge>
            </div>
          )}

          {/* Welcome */}
          <AnimatedContainer className="mb-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Bonjour {displayName} 👋
            </h1>
            <p className="mt-1 text-muted-foreground">
              Voici un résumé de votre parcours et de vos mises en relation.
            </p>
          </AnimatedContainer>

          {/* Route Card */}
          <AnimatedContainer delay={0.1} className="mb-6">
            <Card className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="flex items-center justify-center bg-primary/5 p-6 sm:w-48">
                  <span className="text-5xl">{routeInfo.emoji}</span>
                </div>
                <div className="flex-1 p-6">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Parcours recommandé</p>
                  <h2 className="mb-1 text-xl font-bold text-foreground">{routeInfo.label}</h2>
                  <p className="text-sm text-muted-foreground">{routeInfo.desc}</p>
                  {orientation.lead_score !== null && (
                    <div className="mt-3">
                      <Badge variant="outline">Score de profil : {orientation.lead_score}/100</Badge>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </AnimatedContainer>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Summary */}
            <AnimatedContainer delay={0.15} className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4 text-primary" />
                    Mon profil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {orientation.french_level_cecrl && (
                    <ProfileRow icon={GraduationCap} label="Français" value={CECRL_LABELS[orientation.french_level_cecrl] || orientation.french_level_cecrl} />
                  )}
                  {profile.city && (
                    <ProfileRow icon={MapPin} label="Ville" value={`${profile.city}${profile.postal_code ? ` (${profile.postal_code})` : ""}`} />
                  )}
                  {profile.origin_country && (
                    <ProfileRow icon={Globe} label="Pays d'origine" value={profile.origin_country} />
                  )}
                  {profile.previous_job && (
                    <ProfileRow icon={Briefcase} label="Métier précédent" value={profile.previous_job} />
                  )}
                  {orientation.work_right && (
                    <ProfileRow icon={Shield} label="Droit au travail" value={orientation.work_right === "yes" ? "Oui" : orientation.work_right === "no" ? "Non" : orientation.work_right} />
                  )}
                  {profile.email && (
                    <ProfileRow icon={Mail} label="Email" value={profile.email} />
                  )}
                  {profile.phone && (
                    <ProfileRow icon={Phone} label="Téléphone" value={profile.phone} />
                  )}

                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to="/mes-donnees">
                        <FileText className="mr-2 h-3.5 w-3.5" />
                        Gérer mes données
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Leads / Mises en relation */}
            <AnimatedContainer delay={0.2} className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Mes mises en relation
                    {leads.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">{leads.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                      <Clock className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium text-muted-foreground">Aucune mise en relation pour le moment</p>
                      <p className="text-xs text-muted-foreground/70">Des organismes seront bientôt associés à votre profil.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leads.map((lead) => {
                        const statusInfo = STATUS_INFO[lead.status] || STATUS_INFO.pending;
                        const StatusIcon = statusInfo.icon;
                        return (
                          <div
                            key={lead.id}
                            className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {lead.training?.title || "Formation"}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {lead.provider?.name || "Organisme"}
                                {lead.provider?.city && ` · ${lead.provider.city}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {lead.match_score !== null && (
                                <span className="text-xs text-muted-foreground">{lead.match_score}%</span>
                              )}
                              <Badge className={`${statusInfo.color} gap-1 border-0`}>
                                <StatusIcon className="h-3 w-3" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Learn French CTA - Enriched */}
            <AnimatedContainer delay={0.25} className="lg:col-span-3">
              <FLEDashboardCard />
            </AnimatedContainer>
          </div>

          {/* Tags */}
          {(orientation.skills?.length || orientation.barriers?.length) && (
            <AnimatedContainer delay={0.3} className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-6">
                    {orientation.skills && orientation.skills.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Compétences</p>
                        <div className="flex flex-wrap gap-1.5">
                          {orientation.skills.map((s, i) => (
                            <Badge key={i} variant="secondary">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {orientation.barriers && orientation.barriers.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Freins identifiés</p>
                        <div className="flex flex-wrap gap-1.5">
                          {orientation.barriers.map((b, i) => (
                            <Badge key={i} variant="outline" className="border-amber-300 text-amber-700">{b}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

function ProfileRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

export default Dashboard;

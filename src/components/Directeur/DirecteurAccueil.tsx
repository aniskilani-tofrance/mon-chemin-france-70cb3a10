import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserCog,
  BookOpen,
  TrendingUp,
  Clock,
  ArrowRight,
  Activity,
  FileText,
  Flame,
  Download,
} from "lucide-react";
import { useDirecteurStats } from "@/hooks/useDirecteurStats";

interface RecentLead {
  id: string;
  email: string | null;
  main_goal: string | null;
  lead_score: number | null;
  created_at: string;
}

interface TopFormateur {
  id: string;
  name: string;
  learners: number;
  completed: number;
}

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString("fr-FR");
}

export function DirecteurAccueil({ onExport }: { onExport?: () => void }) {
  const navigate = useNavigate();
  const {
    totalLearners,
    totalFormateurs,
    modulesCompleted,
    avgCompletionRate,
    totalHours,
    onboardingLeads7d,
    hotLeads,
    loading,
  } = useDirecteurStats();

  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [topFormateurs, setTopFormateurs] = useState<TopFormateur[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [leadsRes, linksRes, progressRes, profilesRes] = await Promise.all([
        supabase
          .from("onboarding_results")
          .select("id, email, main_goal, lead_score, created_at")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase.from("formateur_learners").select("formateur_id, learner_id"),
        supabase.from("fle_module_progress").select("user_id, completed_at"),
        supabase.from("profiles").select("user_id, full_name, email"),
      ]);

      setRecentLeads((leadsRes.data || []) as RecentLead[]);

      const links = linksRes.data || [];
      const profiles = profilesRes.data || [];
      const profileMap = new Map(profiles.map((p) => [p.user_id, p]));
      const progress = progressRes.data || [];

      const fIds = [...new Set(links.map((l) => l.formateur_id))];
      const top: TopFormateur[] = fIds
        .map((fId) => {
          const myLearners = links
            .filter((l) => l.formateur_id === fId)
            .map((l) => l.learner_id);
          const completed = progress.filter(
            (p) => p.completed_at && myLearners.includes(p.user_id),
          ).length;
          const profile = profileMap.get(fId);
          return {
            id: fId,
            name:
              profile?.full_name ||
              profile?.email ||
              `Formateur ${fId.slice(0, 6)}`,
            learners: myLearners.length,
            completed,
          };
        })
        .sort((a, b) => b.completed - a.completed)
        .slice(0, 5);

      setTopFormateurs(top);
      setLoadingFeed(false);
    };
    load();
  }, []);

  const kpis = [
    {
      label: "Apprenants suivis",
      value: totalLearners,
      icon: Users,
      tone: "text-primary",
      bg: "bg-primary/10",
      onClick: () => navigate("/directeur/apprenants"),
    },
    {
      label: "Formateurs actifs",
      value: totalFormateurs,
      icon: UserCog,
      tone: "text-emerald-600",
      bg: "bg-emerald-500/10",
      onClick: () => navigate("/directeur/formateurs"),
    },
    {
      label: "Modules complétés",
      value: modulesCompleted,
      icon: BookOpen,
      tone: "text-amber-600",
      bg: "bg-amber-500/10",
      onClick: () => navigate("/directeur/performance"),
    },
    {
      label: "Taux complétion",
      value: `${avgCompletionRate}%`,
      icon: TrendingUp,
      tone: "text-violet-600",
      bg: "bg-violet-500/10",
      onClick: () => navigate("/directeur/performance"),
    },
  ];

  const secondaryKpis = [
    {
      label: "Heures totales",
      value: `${totalHours} h`,
      icon: Clock,
    },
    {
      label: "Leads 7 derniers jours",
      value: onboardingLeads7d,
      icon: FileText,
    },
    {
      label: "Leads chauds (≥80)",
      value: hotLeads,
      icon: Flame,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tableau de bord</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Vue d'ensemble du dispositif et de l'acquisition.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/directeur/onboarding")}>
            <FileText className="mr-2 h-4 w-4" />
            Voir les leads
          </Button>
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <button
            key={k.label}
            onClick={k.onClick}
            className="text-left rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-lg p-2 ${k.bg}`}>
                <k.icon className={`h-5 w-5 ${k.tone}`} />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
            </div>
            <div className="mt-3">
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-3xl font-bold tracking-tight">{k.value}</div>
              )}
              <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {secondaryKpis.map((k) => (
          <div
            key={k.label}
            className="flex items-center gap-3 rounded-lg border bg-card/60 p-3"
          >
            <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center">
              <k.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-lg font-semibold">
                {loading ? <Skeleton className="h-5 w-12" /> : k.value}
              </div>
              <div className="text-[11px] text-muted-foreground">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Body: top formateurs + recent leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Top formateurs (modules complétés)
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/directeur/formateurs")}
            >
              Tout voir
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {loadingFeed ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : topFormateurs.length === 0 ? (
              <EmptyState
                icon={UserCog}
                title="Aucun formateur"
                hint="Les formateurs apparaîtront dès qu'ils auront des apprenants."
              />
            ) : (
              <ul className="divide-y">
                {topFormateurs.map((f, idx) => (
                  <li
                    key={f.id}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{f.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {f.learners} apprenants
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-semibold">
                      {f.completed} modules
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              Leads récents
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/directeur/onboarding")}
            >
              Tout voir
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {loadingFeed ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentLeads.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Aucun lead pour l'instant"
                hint="Les résultats d'onboarding Marianne apparaîtront ici."
              />
            ) : (
              <ul className="space-y-2">
                {recentLeads.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/40 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-xs font-semibold">
                      {(l.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {l.email || "Anonyme"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelative(l.created_at)}
                      </div>
                    </div>
                    {l.lead_score != null && (
                      <Badge
                        className={
                          l.lead_score >= 80
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : l.lead_score >= 50
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }
                      >
                        {l.lead_score}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: any;
  title: string;
  hint: string;
}) {
  return (
    <div className="text-center py-8">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}

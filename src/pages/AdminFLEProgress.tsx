import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, Search, AlertTriangle, TrendingUp, Users, GraduationCap,
  Brain, ArrowUpRight, Clock, Flame, ChevronDown, ChevronUp,
  Download, Compass, ArrowRight, BookOpen, Shield, Phone, Mail,
  MapPin, Globe, Target, BarChart3,
} from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────

interface FLEUser {
  id: string;
  user_id: string;
  estimated_level: string | null;
  total_xp: number | null;
  streak_days: number | null;
  oral_score: number | null;
  comprehension_score: number | null;
  words_learned: number | null;
  phrases_mastered: number | null;
  total_time_minutes: number | null;
  last_activity_at: string | null;
  placement_completed: boolean | null;
  preferred_category: string | null;
  daily_goal_minutes: number;
  created_at: string;
}

interface UserProfile {
  id: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  origin_country: string | null;
  city: string | null;
  phone: string | null;
}

interface OnboardingData {
  main_goal: string | null;
  target_sector: string | null;
  french_level_cecrl: string | null;
  lead_route: string | null;
  lead_score: number | null;
  barriers: string[] | null;
  literacy: string | null;
  work_right: string | null;
  completed_at: string | null;
}

interface ModuleProgress {
  module_id: string;
  exercises_done: number | null;
  exercises_total: number | null;
  score: number | null;
  completed_at: string | null;
}

type DropoutRisk = "high" | "medium" | "low";
type SortKey = "name" | "level" | "xp" | "streak" | "risk" | "lastActive" | "route";

// ─── Constants ───────────────────────────────────────────────

const LEVEL_ORDER: Record<string, number> = { alpha: 0, post_alpha: 1, a1: 2, a2: 3, b1: 4 };
const LEVEL_LABELS: Record<string, string> = { alpha: "Alpha", post_alpha: "Post-Alpha", a1: "A1", a2: "A2", b1: "B1" };
const LEVEL_COLORS: Record<string, string> = {
  alpha: "bg-red-100 text-red-700 border-red-200",
  post_alpha: "bg-orange-100 text-orange-700 border-orange-200",
  a1: "bg-yellow-100 text-yellow-700 border-yellow-200",
  a2: "bg-blue-100 text-blue-700 border-blue-200",
  b1: "bg-green-100 text-green-700 border-green-200",
};

const ROUTE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  route_a: { label: "Emploi direct", emoji: "💼", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  route_b: { label: "Formation", emoji: "🎓", color: "bg-blue-100 text-blue-700 border-blue-300" },
  route_c: { label: "FLE prioritaire", emoji: "🇫🇷", color: "bg-purple-100 text-purple-700 border-purple-300" },
  sas: { label: "SAS Insertion", emoji: "🧭", color: "bg-amber-100 text-amber-700 border-amber-300" },
};

const GOAL_LABELS: Record<string, string> = {
  travail: "Trouver un emploi",
  trouver_emploi: "Trouver un emploi",
  emploi: "Trouver un emploi",
  formation: "Suivre une formation",
  francais: "Apprendre le français",
  autonomie: "Vie quotidienne",
  vie_quotidienne: "Vie quotidienne",
};

const BARRIER_LABELS: Record<string, string> = {
  mobilite: "Mobilité",
  garde_enfants: "Garde d'enfants",
  horaires: "Horaires",
  sante: "Santé",
  logement: "Logement",
  admin: "Administratif",
  langue: "Langue",
};

// ─── Dropout detection ───────────────────────────────────────

function getDropoutRisk(user: FLEUser, onboarding?: OnboardingData | null): { risk: DropoutRisk; reasons: string[]; score: number } {
  const reasons: string[] = [];
  let riskScore = 0;

  const daysSinceActivity = user.last_activity_at
    ? differenceInDays(new Date(), new Date(user.last_activity_at))
    : 999;

  // Inactivity
  if (daysSinceActivity >= 14) { reasons.push(`Inactif depuis ${daysSinceActivity}j`); riskScore += 40; }
  else if (daysSinceActivity >= 7) { reasons.push(`${daysSinceActivity}j sans activité`); riskScore += 25; }
  else if (daysSinceActivity >= 3) { riskScore += 10; }

  // Streak
  if ((user.streak_days ?? 0) === 0 && daysSinceActivity >= 3) { reasons.push("Streak perdu"); riskScore += 15; }

  // XP
  if ((user.total_xp ?? 0) < 50 && daysSinceActivity >= 5) { reasons.push("XP très faible"); riskScore += 15; }

  // Oral score stagnation
  if ((user.oral_score ?? 0) < 30 && (user.total_time_minutes ?? 0) > 30) {
    reasons.push("Score oral bas malgré le temps passé"); riskScore += 15;
  }

  // Very low engagement
  if ((user.total_time_minutes ?? 0) < 10 && daysSinceActivity >= 7) {
    reasons.push("Temps total < 10 min"); riskScore += 10;
  }

  // Barriers from onboarding (contextual risk factors)
  if (onboarding?.barriers && onboarding.barriers.length >= 2) {
    reasons.push(`${onboarding.barriers.length} freins identifiés à l'onboarding`);
    riskScore += 10;
  }

  // Literacy concerns
  if (onboarding?.literacy === "aucune" || onboarding?.literacy === "faible") {
    reasons.push("Littératie faible — risque de difficulté accrue");
    riskScore += 10;
  }

  const risk: DropoutRisk =
    riskScore >= 50 ? "high" :
    riskScore >= 20 ? "medium" : "low";

  return { risk, reasons, score: Math.min(riskScore, 100) };
}

// ─── Smart recommendations ───────────────────────────────────

function getRecommendation(
  user: FLEUser,
  profile: UserProfile | undefined,
  onboarding: OnboardingData | null,
  moduleProgress: ModuleProgress[] | undefined,
): { text: string; actions: string[]; priority: "urgent" | "important" | "normal" | "positive" } {
  const daysSinceActivity = user.last_activity_at
    ? differenceInDays(new Date(), new Date(user.last_activity_at))
    : 999;

  const completedModules = (moduleProgress || []).filter(mp => mp.completed_at).length;
  const totalModules = (moduleProgress || []).length;

  // URGENT: Long inactivity
  if (daysSinceActivity >= 14) {
    const actions = ["Appel de suivi", "Proposer RDV individuel"];
    if (onboarding?.barriers?.includes("mobilite")) actions.push("Vérifier accès transport");
    if (onboarding?.barriers?.includes("garde_enfants")) actions.push("Vérifier solution garde");
    return {
      text: "🚨 Relance urgente — apprenant à risque de décrochage définitif",
      actions,
      priority: "urgent",
    };
  }

  // IMPORTANT: Moderate inactivity
  if (daysSinceActivity >= 7) {
    return {
      text: "📞 Contact recommandé — envoyer un message d'encouragement personnalisé",
      actions: ["Message WhatsApp", "Rappel par email"],
      priority: "important",
    };
  }

  // Oral score stagnation
  if ((user.oral_score ?? 0) < 30 && (user.total_time_minutes ?? 0) > 30) {
    return {
      text: "🎯 Réorienter vers des exercices d'écoute et de répétition (modules oraux)",
      actions: ["Recommander modules dialogues", "Exercices écoute-répétition"],
      priority: "important",
    };
  }

  // Low engagement
  if ((user.total_xp ?? 0) < 50) {
    const actions = ["Accompagnement renforcé"];
    if (onboarding?.literacy === "aucune" || onboarding?.literacy === "faible") {
      actions.push("Support alphabétisation");
    }
    return {
      text: "💡 Proposer un accompagnement renforcé — l'apprenant a besoin de soutien",
      actions,
      priority: "important",
    };
  }

  // Goal-based orientation
  const goal = onboarding?.main_goal;
  const sector = onboarding?.target_sector;
  if ((goal === "travail" || goal === "trouver_emploi" || goal === "emploi") &&
      (user.estimated_level === "a1" || user.estimated_level === "a2")) {
    return {
      text: `🏢 Orienter vers un parcours FLE professionnel adapté au secteur ${sector || "visé"}`,
      actions: ["Modules FOS prioritaires", "Mise en relation OF"],
      priority: "normal",
    };
  }

  // Ready for level up
  if (completedModules >= 3 && (user.total_xp ?? 0) > 200) {
    const currentLevelIdx = LEVEL_ORDER[user.estimated_level || "a1"] ?? 2;
    const nextLevel = Object.entries(LEVEL_ORDER).find(([, v]) => v === currentLevelIdx + 1)?.[0];
    return {
      text: `⭐ Excellent progrès — ${nextLevel ? `prêt pour le niveau ${LEVEL_LABELS[nextLevel]}` : "féliciter et consolider"}`,
      actions: ["Féliciter l'apprenant", nextLevel ? `Débloquer modules ${LEVEL_LABELS[nextLevel]}` : "Proposer dialogue avancé"],
      priority: "positive",
    };
  }

  return {
    text: "✅ Parcours normal — continuer le suivi régulier",
    actions: ["Suivi standard"],
    priority: "normal",
  };
}

const RISK_CONFIG = {
  high: { label: "Élevé", color: "bg-red-500", badgeClass: "bg-red-100 text-red-700 border-red-300", icon: "🔴" },
  medium: { label: "Moyen", color: "bg-amber-500", badgeClass: "bg-amber-100 text-amber-700 border-amber-300", icon: "🟡" },
  low: { label: "Faible", color: "bg-emerald-500", badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: "🟢" },
};

const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", className: "border-red-300 bg-red-50 dark:bg-red-950/30" },
  important: { label: "Important", className: "border-amber-300 bg-amber-50 dark:bg-amber-950/30" },
  normal: { label: "Normal", className: "border-border bg-secondary/30" },
  positive: { label: "Positif", className: "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30" },
};

// ─── Component ───────────────────────────────────────────────

export default function AdminFLEProgress() {
  const [fleUsers, setFleUsers] = useState<FLEUser[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [onboardingMap, setOnboardingMap] = useState<Record<string, OnboardingData>>({});
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [routeFilter, setRouteFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("risk");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [fleRes, profileRes, modRes, onboardingRes] = await Promise.all([
      supabase.from("fle_user_progress").select("*"),
      supabase.from("profiles").select("id, user_id, first_name, last_name, full_name, email, origin_country, city, phone"),
      supabase.from("fle_module_progress").select("user_id, module_id, exercises_done, exercises_total, score, completed_at"),
      supabase.from("onboarding_results").select("user_id, main_goal, target_sector, french_level_cecrl, lead_route, lead_score, barriers, literacy, work_right, completed_at"),
    ]);

    setFleUsers(fleRes.data || []);

    // Build onboarding lookup by user_id (most recent wins)
    const obMap: Record<string, OnboardingData> = {};
    (onboardingRes.data || []).forEach((ob: any) => {
      if (ob.user_id) obMap[ob.user_id] = ob;
    });
    setOnboardingMap(obMap);

    setProfiles(profileRes.data || []);

    // Group module progress by user_id
    const grouped: Record<string, ModuleProgress[]> = {};
    (modRes.data || []).forEach((mp: any) => {
      if (!grouped[mp.user_id]) grouped[mp.user_id] = [];
      grouped[mp.user_id].push(mp);
    });
    setModuleProgress(grouped);
    setLoading(false);
  };

  const profileMap = useMemo(() => {
    const map: Record<string, UserProfile> = {};
    profiles.forEach((p) => {
      if (p.user_id) map[p.user_id] = p;
    });
    return map;
  }, [profiles]);

  const enrichedUsers = useMemo(() => {
    return fleUsers.map((u) => {
      const profile = profileMap[u.user_id];
      const onboarding = onboardingMap[u.user_id] || null;
      const { risk, reasons, score: riskScore } = getDropoutRisk(u, onboarding);
      const rec = getRecommendation(u, profile, onboarding, moduleProgress[u.user_id]);
      const name = profile?.full_name || profile?.first_name || profile?.email || u.user_id.slice(0, 8);
      const route = onboarding?.lead_route || null;

      // Level evolution
      const initialLevel = onboarding?.french_level_cecrl?.toLowerCase() || null;
      const currentLevel = u.estimated_level || "a1";
      const levelProgressed = initialLevel && currentLevel
        ? (LEVEL_ORDER[currentLevel] ?? 0) > (LEVEL_ORDER[initialLevel] ?? 0)
        : false;

      return {
        ...u, profile, onboarding, risk, reasons, riskScore,
        recommendation: rec, displayName: name, route, initialLevel,
        levelProgressed,
      };
    });
  }, [fleUsers, profileMap, onboardingMap, moduleProgress]);

  const filtered = useMemo(() => {
    let list = enrichedUsers;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        u.displayName.toLowerCase().includes(q) ||
        (u.profile?.email || "").toLowerCase().includes(q) ||
        (u.profile?.origin_country || "").toLowerCase().includes(q) ||
        (u.profile?.city || "").toLowerCase().includes(q)
      );
    }
    if (riskFilter !== "all") list = list.filter((u) => u.risk === riskFilter);
    if (levelFilter !== "all") list = list.filter((u) => u.estimated_level === levelFilter);
    if (routeFilter !== "all") list = list.filter((u) => u.route === routeFilter);

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.displayName.localeCompare(b.displayName); break;
        case "level": cmp = (LEVEL_ORDER[a.estimated_level || "a1"] || 0) - (LEVEL_ORDER[b.estimated_level || "a1"] || 0); break;
        case "xp": cmp = (a.total_xp ?? 0) - (b.total_xp ?? 0); break;
        case "streak": cmp = (a.streak_days ?? 0) - (b.streak_days ?? 0); break;
        case "risk": {
          const riskOrder = { high: 0, medium: 1, low: 2 };
          cmp = riskOrder[a.risk] - riskOrder[b.risk];
          if (cmp === 0) cmp = (b.riskScore) - (a.riskScore);
          break;
        }
        case "lastActive": {
          const aDate = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
          const bDate = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
          cmp = aDate - bDate;
          break;
        }
        case "route": {
          cmp = (a.route || "zzz").localeCompare(b.route || "zzz");
          break;
        }
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [enrichedUsers, search, riskFilter, levelFilter, routeFilter, sortKey, sortAsc]);

  const stats = useMemo(() => {
    const total = enrichedUsers.length;
    const highRisk = enrichedUsers.filter((u) => u.risk === "high").length;
    const medRisk = enrichedUsers.filter((u) => u.risk === "medium").length;
    const avgXp = total > 0 ? Math.round(enrichedUsers.reduce((s, u) => s + (u.total_xp ?? 0), 0) / total) : 0;
    const activeThisWeek = enrichedUsers.filter((u) => {
      if (!u.last_activity_at) return false;
      return differenceInDays(new Date(), new Date(u.last_activity_at)) <= 7;
    }).length;
    const leveledUp = enrichedUsers.filter((u) => u.levelProgressed).length;
    const completionRate = total > 0
      ? Math.round(enrichedUsers.filter(u => {
          const mods = moduleProgress[u.user_id] || [];
          return mods.some(m => m.completed_at);
        }).length / total * 100)
      : 0;
    const levelDistribution = Object.keys(LEVEL_LABELS).reduce((acc, level) => {
      acc[level] = enrichedUsers.filter(u => u.estimated_level === level).length;
      return acc;
    }, {} as Record<string, number>);

    return { total, highRisk, medRisk, avgXp, activeThisWeek, leveledUp, completionRate, levelDistribution };
  }, [enrichedUsers, moduleProgress]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortAsc ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />;
  };

  // ─── CSV Export ──────────────────────────────────────────────

  const exportCSV = useCallback(() => {
    const headers = [
      "Nom", "Email", "Pays", "Ville", "Niveau actuel", "Niveau initial", "Progression",
      "XP", "Streak (j)", "Score oral (%)", "Compréhension (%)", "Temps (min)",
      "Risque", "Score risque", "Route", "Objectif", "Secteur", "Freins",
      "Dernière activité", "Recommandation",
    ];
    const rows = filtered.map((u) => [
      u.displayName,
      u.profile?.email || "",
      u.profile?.origin_country || "",
      u.profile?.city || "",
      LEVEL_LABELS[u.estimated_level || "a1"] || u.estimated_level || "",
      u.initialLevel ? (LEVEL_LABELS[u.initialLevel] || u.initialLevel) : "",
      u.levelProgressed ? "↑ Oui" : "—",
      u.total_xp ?? 0,
      u.streak_days ?? 0,
      u.oral_score ?? 0,
      u.comprehension_score ?? 0,
      u.total_time_minutes ?? 0,
      RISK_CONFIG[u.risk].label,
      u.riskScore,
      u.route ? (ROUTE_LABELS[u.route]?.label || u.route) : "",
      u.onboarding?.main_goal ? (GOAL_LABELS[u.onboarding.main_goal] || u.onboarding.main_goal) : "",
      u.onboarding?.target_sector || "",
      (u.onboarding?.barriers || []).join("; "),
      u.last_activity_at ? format(new Date(u.last_activity_at), "dd/MM/yyyy") : "",
      u.recommendation.text,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suivi-fle-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  }, [filtered]);

  const selectedEnriched = selectedUser ? enrichedUsers.find((u) => u.user_id === selectedUser) : null;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Admin — Suivi FLE accompagnant" description="Suivi progression FLE des apprenants, indicateurs de décrochage et recommandations" path="/admin/fle" />
      <Header />

      <main className="container mx-auto px-4 py-24">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              Suivi FLE — Vue accompagnant
            </h1>
            <p className="mt-1 text-muted-foreground">
              Progression, indicateurs de décrochage et recommandations d'orientation automatiques
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />
            Exporter CSV ({filtered.length})
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {[
            { icon: Users, label: "Apprenants", value: stats.total, color: "text-primary" },
            { icon: AlertTriangle, label: "Risque élevé", value: stats.highRisk, color: "text-red-500", border: "border-red-200" },
            { icon: Clock, label: "Risque moyen", value: stats.medRisk, color: "text-amber-500", border: "border-amber-200" },
            { icon: Flame, label: "Actifs 7j", value: stats.activeThisWeek, color: "text-orange-500" },
            { icon: TrendingUp, label: "XP moyen", value: stats.avgXp, color: "text-emerald-500" },
            { icon: ArrowUpRight, label: "Niveau ↑", value: stats.leveledUp, color: "text-blue-500" },
            { icon: Target, label: "Complétion", value: `${stats.completionRate}%`, color: "text-purple-500" },
          ].map((kpi) => (
            <Card key={kpi.label} className={kpi.border || ""}>
              <CardContent className="p-3 text-center">
                <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
                <div className="text-xl font-bold">{kpi.value}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{kpi.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Level Distribution Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Répartition par niveau</span>
            </div>
            <div className="flex h-6 rounded-full overflow-hidden bg-secondary">
              {Object.entries(LEVEL_LABELS).map(([level, label]) => {
                const count = stats.levelDistribution[level] || 0;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                if (pct === 0) return null;
                const bgColors: Record<string, string> = {
                  alpha: "bg-red-400", post_alpha: "bg-orange-400", a1: "bg-yellow-400", a2: "bg-blue-400", b1: "bg-green-400",
                };
                return (
                  <div
                    key={level}
                    className={`${bgColors[level]} flex items-center justify-center transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${label}: ${count} (${Math.round(pct)}%)`}
                  >
                    {pct >= 10 && <span className="text-[10px] font-bold text-white">{label}</span>}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {Object.entries(LEVEL_LABELS).map(([level, label]) => {
                const count = stats.levelDistribution[level] || 0;
                if (count === 0) return null;
                return (
                  <span key={level} className="text-xs text-muted-foreground">
                    <Badge variant="outline" className={`${LEVEL_COLORS[level]} text-[10px] mr-1`}>{label}</Badge>
                    {count}
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher (nom, email, pays, ville)..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Risque" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous risques</SelectItem>
              <SelectItem value="high">🔴 Élevé</SelectItem>
              <SelectItem value="medium">🟡 Moyen</SelectItem>
              <SelectItem value="low">🟢 Faible</SelectItem>
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Niveau" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous niveaux</SelectItem>
              {Object.entries(LEVEL_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={routeFilter} onValueChange={setRouteFilter}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Parcours" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous parcours</SelectItem>
              {Object.entries(ROUTE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>Apprenant <SortIcon col="name" /></TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("route")}>Parcours <SortIcon col="route" /></TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("level")}>Niveau <SortIcon col="level" /></TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("xp")}>XP <SortIcon col="xp" /></TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("streak")}>Streak <SortIcon col="streak" /></TableHead>
                    <TableHead>Oral</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("lastActive")}>Activité <SortIcon col="lastActive" /></TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("risk")}>Risque <SortIcon col="risk" /></TableHead>
                    <TableHead>Recommandation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucun apprenant FLE trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((u) => {
                      const riskCfg = RISK_CONFIG[u.risk];
                      const routeCfg = u.route ? ROUTE_LABELS[u.route] : null;
                      const daysSince = u.last_activity_at
                        ? differenceInDays(new Date(), new Date(u.last_activity_at))
                        : null;
                      return (
                        <TableRow
                          key={u.user_id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedUser(u.user_id)}
                        >
                          <TableCell>
                            <div className="font-medium">{u.displayName}</div>
                            <div className="text-xs text-muted-foreground">
                              {[u.profile?.origin_country, u.profile?.city].filter(Boolean).join(" · ") || "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {routeCfg ? (
                              <Badge variant="outline" className={`text-[10px] ${routeCfg.color}`}>
                                {routeCfg.emoji} {routeCfg.label}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className={LEVEL_COLORS[u.estimated_level || "a1"] || ""}>
                                {LEVEL_LABELS[u.estimated_level || "a1"] || u.estimated_level}
                              </Badge>
                              {u.levelProgressed && (
                                <span title="Progression de niveau"><ArrowUpRight className="h-3 w-3 text-emerald-500" /></span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{u.total_xp ?? 0}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1">
                              {(u.streak_days ?? 0) > 0 && <Flame className="h-3 w-3 text-orange-500" />}
                              {u.streak_days ?? 0}j
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[80px]">
                              <Progress value={u.oral_score ?? 0} className="h-2 w-12" />
                              <span className="text-xs">{u.oral_score ?? 0}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {daysSince !== null ? (
                              <span className={daysSince >= 14 ? "text-red-600 font-medium" : daysSince >= 7 ? "text-amber-600" : "text-muted-foreground"}>
                                {daysSince === 0 ? "Aujourd'hui" : `il y a ${daysSince}j`}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={riskCfg.badgeClass}>
                              {riskCfg.icon} {riskCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[220px] text-sm truncate" title={u.recommendation.text}>
                            {u.recommendation.text}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* ── User Detail Dialog ── */}
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
            {selectedEnriched && (
              <div>
                {/* Header band */}
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-border">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl">
                      <GraduationCap className="h-6 w-6 text-primary" />
                      {selectedEnriched.displayName}
                      <Badge variant="outline" className={LEVEL_COLORS[selectedEnriched.estimated_level || "a1"] || ""}>
                        {LEVEL_LABELS[selectedEnriched.estimated_level || "a1"]}
                      </Badge>
                      {selectedEnriched.levelProgressed && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 gap-1">
                          <ArrowUpRight className="h-3 w-3" /> Progression
                        </Badge>
                      )}
                    </DialogTitle>
                  </DialogHeader>
                </div>

                <Tabs defaultValue="overview" className="px-6 py-4">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview" className="gap-1"><Users className="h-3 w-3" /> Vue d'ensemble</TabsTrigger>
                    <TabsTrigger value="progress" className="gap-1"><Brain className="h-3 w-3" /> Progression</TabsTrigger>
                    <TabsTrigger value="orientation" className="gap-1"><Compass className="h-3 w-3" /> Orientation</TabsTrigger>
                  </TabsList>

                  {/* ─── Tab: Overview ─── */}
                  <TabsContent value="overview" className="space-y-5">
                    {/* Profile + Contact */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      {[
                        { icon: Mail, label: "Email", value: selectedEnriched.profile?.email },
                        { icon: Phone, label: "Tél", value: selectedEnriched.profile?.phone },
                        { icon: Globe, label: "Pays", value: selectedEnriched.profile?.origin_country },
                        { icon: MapPin, label: "Ville", value: selectedEnriched.profile?.city },
                      ].map((f) => (
                        <div key={f.label} className="flex items-center gap-2 text-muted-foreground">
                          <f.icon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{f.value || "—"}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: "XP Total", value: selectedEnriched.total_xp ?? 0, icon: "⚡" },
                        { label: "Streak", value: `${selectedEnriched.streak_days ?? 0}j`, icon: "🔥" },
                        { label: "Score oral", value: `${selectedEnriched.oral_score ?? 0}%`, icon: "🗣️" },
                        { label: "Temps total", value: `${selectedEnriched.total_time_minutes ?? 0} min`, icon: "⏱️" },
                        { label: "Mots appris", value: selectedEnriched.words_learned ?? 0, icon: "📝" },
                        { label: "Phrases", value: selectedEnriched.phrases_mastered ?? 0, icon: "💬" },
                        { label: "Compréhension", value: `${selectedEnriched.comprehension_score ?? 0}%`, icon: "👂" },
                        { label: "Objectif/j", value: `${selectedEnriched.daily_goal_minutes} min`, icon: "🎯" },
                      ].map((s) => (
                        <Card key={s.label}>
                          <CardContent className="p-3 text-center">
                            <div className="text-lg">{s.icon}</div>
                            <div className="font-bold">{s.value}</div>
                            <div className="text-[10px] text-muted-foreground">{s.label}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Risk & Recommendation */}
                    <Card className={`border-2 ${PRIORITY_CONFIG[selectedEnriched.recommendation.priority].className}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className={RISK_CONFIG[selectedEnriched.risk].badgeClass}>
                            {RISK_CONFIG[selectedEnriched.risk].icon} Risque {RISK_CONFIG[selectedEnriched.risk].label} ({selectedEnriched.riskScore}/100)
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {PRIORITY_CONFIG[selectedEnriched.recommendation.priority].label}
                          </Badge>
                        </div>

                        {selectedEnriched.reasons.length > 0 && (
                          <ul className="text-sm text-muted-foreground mb-3 space-y-1">
                            {selectedEnriched.reasons.map((r, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0" /> {r}
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="font-medium text-sm mb-3">{selectedEnriched.recommendation.text}</div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2">
                          {selectedEnriched.recommendation.actions.map((action) => (
                            <Badge key={action} variant="secondary" className="text-xs cursor-default">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ─── Tab: Progress ─── */}
                  <TabsContent value="progress" className="space-y-5">
                    {/* Level evolution */}
                    {selectedEnriched.initialLevel && (
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" /> Évolution du niveau
                          </h3>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={LEVEL_COLORS[selectedEnriched.initialLevel] || ""}>
                              {LEVEL_LABELS[selectedEnriched.initialLevel] || selectedEnriched.initialLevel}
                            </Badge>
                            <ArrowRight className={`h-4 w-4 ${selectedEnriched.levelProgressed ? "text-emerald-500" : "text-muted-foreground"}`} />
                            <Badge variant="outline" className={LEVEL_COLORS[selectedEnriched.estimated_level || "a1"] || ""}>
                              {LEVEL_LABELS[selectedEnriched.estimated_level || "a1"]}
                            </Badge>
                            {selectedEnriched.levelProgressed && (
                              <span className="text-xs text-emerald-600 font-medium">✨ Progression !</span>
                            )}
                            {!selectedEnriched.levelProgressed && (
                              <span className="text-xs text-muted-foreground">Même niveau</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Module Progress */}
                    {moduleProgress[selectedEnriched.user_id] && moduleProgress[selectedEnriched.user_id].length > 0 ? (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Brain className="h-4 w-4" /> Progression des modules
                          <Badge variant="secondary" className="text-xs">
                            {moduleProgress[selectedEnriched.user_id].filter(m => m.completed_at).length}/{moduleProgress[selectedEnriched.user_id].length} complétés
                          </Badge>
                        </h3>
                        <div className="space-y-2">
                          {moduleProgress[selectedEnriched.user_id].map((mp) => {
                            const pct = mp.exercises_total ? ((mp.exercises_done ?? 0) / mp.exercises_total) * 100 : 0;
                            return (
                              <div key={mp.module_id} className="flex items-center gap-3 text-sm">
                                <Progress value={pct} className="h-2 flex-1" />
                                <span className="text-xs text-muted-foreground w-16">
                                  {mp.exercises_done ?? 0}/{mp.exercises_total ?? 0}
                                </span>
                                <span className="text-xs font-mono w-12">{mp.score ?? 0}%</span>
                                {mp.completed_at ? (
                                  <Badge variant="outline" className="bg-emerald-100 text-emerald-700 text-[10px]">✓</Badge>
                                ) : (
                                  <div className="w-7" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground text-sm">
                        Aucun module commencé
                      </div>
                    )}
                  </TabsContent>

                  {/* ─── Tab: Orientation ─── */}
                  <TabsContent value="orientation" className="space-y-5">
                    {selectedEnriched.onboarding ? (
                      <>
                        {/* Route & Goal */}
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-xs text-muted-foreground mb-1">Parcours d'orientation</div>
                              {selectedEnriched.route && ROUTE_LABELS[selectedEnriched.route] ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{ROUTE_LABELS[selectedEnriched.route].emoji}</span>
                                  <span className="font-semibold">{ROUTE_LABELS[selectedEnriched.route].label}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-xs text-muted-foreground mb-1">Objectif principal</div>
                              <div className="font-semibold">
                                {selectedEnriched.onboarding.main_goal
                                  ? (GOAL_LABELS[selectedEnriched.onboarding.main_goal] || selectedEnriched.onboarding.main_goal)
                                  : "—"}
                              </div>
                              {selectedEnriched.onboarding.target_sector && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Secteur : {selectedEnriched.onboarding.target_sector}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {/* Diagnostic details */}
                        <Card>
                          <CardContent className="p-4">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Compass className="h-4 w-4 text-primary" /> Diagnostic onboarding
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Niveau initial : </span>
                                <span className="font-medium">{selectedEnriched.onboarding.french_level_cecrl || "—"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Littératie : </span>
                                <span className="font-medium">{selectedEnriched.onboarding.literacy || "—"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Droit de travail : </span>
                                <span className="font-medium">{selectedEnriched.onboarding.work_right || "—"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Score profil : </span>
                                <span className="font-medium">{selectedEnriched.onboarding.lead_score ?? "—"}/100</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Barriers */}
                        {selectedEnriched.onboarding.barriers && selectedEnriched.onboarding.barriers.length > 0 && (
                          <Card className="border-amber-200">
                            <CardContent className="p-4">
                              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-amber-500" /> Freins identifiés
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {selectedEnriched.onboarding.barriers.map((b) => (
                                  <Badge key={b} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                    {BARRIER_LABELS[b] || b}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Onboarding date */}
                        {selectedEnriched.onboarding.completed_at && (
                          <p className="text-xs text-muted-foreground text-center">
                            Onboarding complété le {format(new Date(selectedEnriched.onboarding.completed_at), "dd MMMM yyyy", { locale: fr })}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <Compass className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Pas de données d'onboarding pour cet apprenant</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}

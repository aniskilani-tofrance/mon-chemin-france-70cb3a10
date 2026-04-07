import { useState, useEffect, useMemo } from "react";
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
import { Loader2, Search, AlertTriangle, TrendingUp, Users, GraduationCap, Brain, ArrowUpRight, Clock, Flame, ChevronDown, ChevronUp } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

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
  // Orientation data (from onboarding_results, merged at fetch time)
  main_goal: string | null;
  target_sector: string | null;
  french_level_cecrl: string | null;
}

interface ModuleProgress {
  module_id: string;
  exercises_done: number | null;
  exercises_total: number | null;
  score: number | null;
  completed_at: string | null;
}

type DropoutRisk = "high" | "medium" | "low";
type SortKey = "name" | "level" | "xp" | "streak" | "risk" | "lastActive";

const LEVEL_ORDER: Record<string, number> = { alpha: 0, post_alpha: 1, a1: 2, a2: 3, b1: 4 };
const LEVEL_LABELS: Record<string, string> = { alpha: "Alpha", post_alpha: "Post-Alpha", a1: "A1", a2: "A2", b1: "B1" };
const LEVEL_COLORS: Record<string, string> = {
  alpha: "bg-red-100 text-red-700 border-red-200",
  post_alpha: "bg-orange-100 text-orange-700 border-orange-200",
  a1: "bg-yellow-100 text-yellow-700 border-yellow-200",
  a2: "bg-blue-100 text-blue-700 border-blue-200",
  b1: "bg-green-100 text-green-700 border-green-200",
};

function getDropoutRisk(user: FLEUser): { risk: DropoutRisk; reasons: string[] } {
  const reasons: string[] = [];
  const daysSinceActivity = user.last_activity_at
    ? differenceInDays(new Date(), new Date(user.last_activity_at))
    : 999;

  if (daysSinceActivity >= 14) reasons.push(`Inactif depuis ${daysSinceActivity}j`);
  else if (daysSinceActivity >= 7) reasons.push(`${daysSinceActivity}j sans activité`);

  if ((user.streak_days ?? 0) === 0 && daysSinceActivity >= 3) reasons.push("Streak perdu");
  if ((user.total_xp ?? 0) < 50 && daysSinceActivity >= 5) reasons.push("XP très faible");
  if ((user.oral_score ?? 0) < 30 && (user.total_time_minutes ?? 0) > 30) reasons.push("Score oral bas malgré le temps passé");
  if ((user.total_time_minutes ?? 0) < 10 && daysSinceActivity >= 7) reasons.push("Temps total < 10 min");

  const risk: DropoutRisk =
    reasons.length >= 3 || daysSinceActivity >= 14 ? "high" :
    reasons.length >= 1 ? "medium" : "low";

  return { risk, reasons };
}

function getRecommendation(user: FLEUser, profile: UserProfile | undefined): string {
  const { risk, reasons } = getDropoutRisk(user);
  const daysSinceActivity = user.last_activity_at
    ? differenceInDays(new Date(), new Date(user.last_activity_at))
    : 999;

  if (daysSinceActivity >= 14) {
    return "🚨 Relance urgente — proposer un RDV individuel ou un appel de suivi";
  }
  if (daysSinceActivity >= 7) {
    return "📞 Contact recommandé — envoyer un message d'encouragement personnalisé";
  }
  if ((user.oral_score ?? 0) < 30 && (user.total_time_minutes ?? 0) > 30) {
    return "🎯 Réorienter vers des exercices d'écoute et de répétition (modules oraux)";
  }
  if ((user.total_xp ?? 0) < 50) {
    return "💡 Proposer un accompagnement renforcé — l'apprenant a besoin de soutien";
  }
  if (profile?.main_goal === "trouver_emploi" && (user.estimated_level === "a1" || user.estimated_level === "a2")) {
    return "🏢 Orienter vers un parcours FLE professionnel adapté au secteur " + (profile.target_sector || "visé");
  }
  if (risk === "low" && (user.total_xp ?? 0) > 200) {
    return "⭐ Excellent progrès — féliciter et proposer le niveau suivant";
  }
  return "✅ Parcours normal — continuer le suivi régulier";
}

const RISK_CONFIG = {
  high: { label: "Élevé", color: "bg-red-500", badgeClass: "bg-red-100 text-red-700 border-red-300", icon: "🔴" },
  medium: { label: "Moyen", color: "bg-amber-500", badgeClass: "bg-amber-100 text-amber-700 border-amber-300", icon: "🟡" },
  low: { label: "Faible", color: "bg-emerald-500", badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: "🟢" },
};

export default function AdminFLEProgress() {
  const [fleUsers, setFleUsers] = useState<FLEUser[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
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
      supabase.from("profiles").select("id, user_id, first_name, last_name, full_name, email, origin_country"),
      supabase.from("fle_module_progress").select("user_id, module_id, exercises_done, exercises_total, score, completed_at"),
      supabase.from("onboarding_results").select("user_id, main_goal, target_sector, french_level_cecrl"),
    ]);

    setFleUsers(fleRes.data || []);

    // Build onboarding lookup by user_id
    const obMap: Record<string, { main_goal: string | null; target_sector: string | null; french_level_cecrl: string | null }> = {};
    (onboardingRes.data || []).forEach((ob: any) => {
      if (ob.user_id) obMap[ob.user_id] = ob; // last one wins (most recent due to default ordering)
    });

    // Merge profiles with onboarding data
    const mergedProfiles: UserProfile[] = (profileRes.data || []).map((p: any) => {
      const ob = p.user_id ? obMap[p.user_id] : null;
      return {
        ...p,
        main_goal: ob?.main_goal ?? null,
        target_sector: ob?.target_sector ?? null,
        french_level_cecrl: ob?.french_level_cecrl ?? null,
      };
    });
    setProfiles(mergedProfiles);

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
      const { risk, reasons } = getDropoutRisk(u);
      const recommendation = getRecommendation(u, profile);
      const name = profile?.full_name || profile?.first_name || profile?.email || u.user_id.slice(0, 8);
      return { ...u, profile, risk, reasons, recommendation, displayName: name };
    });
  }, [fleUsers, profileMap]);

  const filtered = useMemo(() => {
    let list = enrichedUsers;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        u.displayName.toLowerCase().includes(q) ||
        (u.profile?.email || "").toLowerCase().includes(q) ||
        (u.profile?.origin_country || "").toLowerCase().includes(q)
      );
    }
    if (riskFilter !== "all") list = list.filter((u) => u.risk === riskFilter);
    if (levelFilter !== "all") list = list.filter((u) => u.estimated_level === levelFilter);

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
          break;
        }
        case "lastActive": {
          const aDate = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
          const bDate = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
          cmp = aDate - bDate;
          break;
        }
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [enrichedUsers, search, riskFilter, levelFilter, sortKey, sortAsc]);

  const stats = useMemo(() => {
    const total = enrichedUsers.length;
    const highRisk = enrichedUsers.filter((u) => u.risk === "high").length;
    const medRisk = enrichedUsers.filter((u) => u.risk === "medium").length;
    const avgXp = total > 0 ? Math.round(enrichedUsers.reduce((s, u) => s + (u.total_xp ?? 0), 0) / total) : 0;
    const activeThisWeek = enrichedUsers.filter((u) => {
      if (!u.last_activity_at) return false;
      return differenceInDays(new Date(), new Date(u.last_activity_at)) <= 7;
    }).length;
    return { total, highRisk, medRisk, avgXp, activeThisWeek };
  }, [enrichedUsers]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortAsc ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />;
  };

  const selectedEnriched = selectedUser ? enrichedUsers.find((u) => u.user_id === selectedUser) : null;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Admin — Suivi FLE" description="Suivi progression FLE des apprenants" path="/admin/fle" />
      <Header />

      <main className="container mx-auto px-4 py-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            Suivi FLE des apprenants
          </h1>
          <p className="mt-1 text-muted-foreground">
            Progression, indicateurs de décrochage et recommandations d'orientation
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Apprenants FLE</div>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto text-red-500 mb-1" />
              <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
              <div className="text-xs text-muted-foreground">Risque élevé</div>
            </CardContent>
          </Card>
          <Card className="border-amber-200">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto text-amber-500 mb-1" />
              <div className="text-2xl font-bold text-amber-600">{stats.medRisk}</div>
              <div className="text-xs text-muted-foreground">Risque moyen</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
              <div className="text-2xl font-bold">{stats.avgXp}</div>
              <div className="text-xs text-muted-foreground">XP moyen</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
              <div className="text-2xl font-bold">{stats.activeThisWeek}</div>
              <div className="text-xs text-muted-foreground">Actifs cette semaine</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un apprenant..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Risque" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les risques</SelectItem>
              <SelectItem value="high">🔴 Élevé</SelectItem>
              <SelectItem value="medium">🟡 Moyen</SelectItem>
              <SelectItem value="low">🟢 Faible</SelectItem>
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Niveau" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous niveaux</SelectItem>
              {Object.entries(LEVEL_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
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
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("level")}>Niveau <SortIcon col="level" /></TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("xp")}>XP <SortIcon col="xp" /></TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("streak")}>Streak <SortIcon col="streak" /></TableHead>
                    <TableHead>Oral</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("lastActive")}>Dernière activité <SortIcon col="lastActive" /></TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("risk")}>Risque <SortIcon col="risk" /></TableHead>
                    <TableHead>Recommandation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucun apprenant FLE trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((u) => {
                      const riskCfg = RISK_CONFIG[u.risk];
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
                            {u.profile?.origin_country && (
                              <div className="text-xs text-muted-foreground">{u.profile.origin_country}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={LEVEL_COLORS[u.estimated_level || "a1"] || ""}>
                              {LEVEL_LABELS[u.estimated_level || "a1"] || u.estimated_level}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">{u.total_xp ?? 0}</TableCell>
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
                          <TableCell className="max-w-[250px] text-sm truncate" title={u.recommendation}>
                            {u.recommendation}
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

        {/* User Detail Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            {selectedEnriched && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    {selectedEnriched.displayName}
                    <Badge variant="outline" className={LEVEL_COLORS[selectedEnriched.estimated_level || "a1"] || ""}>
                      {LEVEL_LABELS[selectedEnriched.estimated_level || "a1"]}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                  {/* Profile Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Email :</span> {selectedEnriched.profile?.email || "—"}</div>
                    <div><span className="text-muted-foreground">Pays :</span> {selectedEnriched.profile?.origin_country || "—"}</div>
                    <div><span className="text-muted-foreground">Objectif :</span> {selectedEnriched.profile?.main_goal || "—"}</div>
                    <div><span className="text-muted-foreground">Secteur :</span> {selectedEnriched.profile?.target_sector || "—"}</div>
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
                          <div className="text-xs text-muted-foreground">{s.label}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Risk & Recommendation */}
                  <Card className={`border-2 ${selectedEnriched.risk === "high" ? "border-red-300 bg-red-50" : selectedEnriched.risk === "medium" ? "border-amber-300 bg-amber-50" : "border-emerald-300 bg-emerald-50"}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={RISK_CONFIG[selectedEnriched.risk].badgeClass}>
                          {RISK_CONFIG[selectedEnriched.risk].icon} Risque {RISK_CONFIG[selectedEnriched.risk].label}
                        </Badge>
                      </div>
                      {selectedEnriched.reasons.length > 0 && (
                        <ul className="text-sm text-muted-foreground mb-3 space-y-1">
                          {selectedEnriched.reasons.map((r, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-amber-500" /> {r}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="font-medium text-sm">{selectedEnriched.recommendation}</div>
                    </CardContent>
                  </Card>

                  {/* Module Progress */}
                  {moduleProgress[selectedEnriched.user_id] && moduleProgress[selectedEnriched.user_id].length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Brain className="h-4 w-4" /> Progression des modules
                      </h3>
                      <div className="space-y-2">
                        {moduleProgress[selectedEnriched.user_id].map((mp) => (
                          <div key={mp.module_id} className="flex items-center gap-3 text-sm">
                            <Progress value={mp.exercises_total ? ((mp.exercises_done ?? 0) / mp.exercises_total) * 100 : 0} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground w-16">
                              {mp.exercises_done ?? 0}/{mp.exercises_total ?? 0}
                            </span>
                            <span className="text-xs font-mono w-12">{mp.score ?? 0}%</span>
                            {mp.completed_at && <Badge variant="outline" className="bg-emerald-100 text-emerald-700 text-xs">✓</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}

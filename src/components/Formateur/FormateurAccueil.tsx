import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  GraduationCap,
  Sparkles,
  Headphones,
  ArrowRight,
  Plus,
  Activity,
  TrendingUp,
  ClipboardCheck,
  Clock,
} from "lucide-react";
import { useFormateurStats } from "@/hooks/useFormateurStats";
import { CreateLearnerDialog } from "./CreateLearnerDialog";
import { toast } from "sonner";

interface RecentEvent {
  id: string;
  kind: "placement" | "diagnostic" | "evaluation";
  label: string;
  detail: string;
  date: string;
  href: string;
}

interface ActiveLearner {
  id: string;
  name: string;
  email: string | null;
  level: string | null;
  xp: number;
  lastActivity: string | null;
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

export function FormateurAccueil() {
  const navigate = useNavigate();
  const { learnersCount, pendingEvaluations, diagnosticsInProgress, placementTests7d, loading, refresh } =
    useFormateurStats();

  const [recent, setRecent] = useState<RecentEvent[]>([]);
  const [active, setActive] = useState<ActiveLearner[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [creatingPlacement, setCreatingPlacement] = useState(false);
  const [creatingDiagnostic, setCreatingDiagnostic] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingFeed(false);
        return;
      }

      const { data: links } = await supabase
        .from("formateur_learners")
        .select("learner_id")
        .eq("formateur_id", user.id);
      const ids = links?.map((l) => l.learner_id) || [];

      const [profilesRes, progressRes, placementsRes, diagnosticsRes, evalsRes] = await Promise.all([
        ids.length
          ? supabase.from("profiles").select("user_id, full_name, email, french_level_cecrl").in("user_id", ids)
          : Promise.resolve({ data: [] } as any),
        ids.length
          ? supabase
              .from("fle_user_progress")
              .select("user_id, total_xp, estimated_level, last_activity_at")
              .in("user_id", ids)
              .order("last_activity_at", { ascending: false, nullsFirst: false })
              .limit(50)
          : Promise.resolve({ data: [] } as any),
        supabase
          .from("placement_test_sessions")
          .select("id, candidate_name, candidate_email, status, created_at, learner_id")
          .eq("formateur_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("shared_diagnostics")
          .select("id, status, created_at, learner_id, access_code")
          .eq("formateur_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        ids.length
          ? supabase
              .from("audio_submissions")
              .select("id, learner_id, status, created_at")
              .in("learner_id", ids)
              .order("created_at", { ascending: false })
              .limit(5)
          : Promise.resolve({ data: [] } as any),
      ]);

      const profiles = (profilesRes.data || []) as any[];
      const progress = (progressRes.data || []) as any[];
      const nameOf = (lid: string | null) => {
        if (!lid) return "Apprenant invité";
        const p = profiles.find((x) => x.user_id === lid);
        return p?.full_name || p?.email || "Apprenant";
      };

      // Top active learners
      const activeList: ActiveLearner[] = progress.slice(0, 5).map((p) => {
        const profile = profiles.find((x) => x.user_id === p.user_id);
        return {
          id: p.user_id,
          name: profile?.full_name || profile?.email || "Apprenant",
          email: profile?.email ?? null,
          level: p.estimated_level || profile?.french_level_cecrl || null,
          xp: p.total_xp ?? 0,
          lastActivity: p.last_activity_at,
        };
      });

      // Recent events (merge + sort)
      const events: RecentEvent[] = [];
      (placementsRes.data || []).forEach((s: any) => {
        events.push({
          id: `p-${s.id}`,
          kind: "placement",
          label: `Test de positionnement — ${nameOf(s.learner_id) || s.candidate_name || "candidat"}`,
          detail: s.status === "completed" ? "Terminé" : s.status === "in_progress" ? "En cours" : "En attente",
          date: s.created_at,
          href: "/formateur/apprenants",
        });
      });
      (diagnosticsRes.data || []).forEach((d: any) => {
        events.push({
          id: `d-${d.id}`,
          kind: "diagnostic",
          label: `Diagnostic partagé — ${nameOf(d.learner_id)}`,
          detail: d.status === "completed" ? "Terminé" : `Code ${d.access_code || ""}`.trim(),
          date: d.created_at,
          href: `/diagnostic-partage?id=${d.id}`,
        });
      });
      (evalsRes.data || []).forEach((e: any) => {
        events.push({
          id: `e-${e.id}`,
          kind: "evaluation",
          label: `Évaluation orale — ${nameOf(e.learner_id)}`,
          detail: e.status === "pending" ? "À corriger" : e.status === "validated" ? "Validée" : "À retravailler",
          date: e.created_at,
          href: "/formateur/evaluations",
        });
      });
      events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setRecent(events.slice(0, 6));
      setActive(activeList);
      setLoadingFeed(false);
    };
    load();
  }, []);

  const generateAccessCodeSafe = async () => {
    const { data, error } = await supabase.rpc("generate_access_code");
    if (!error && typeof data === "string" && data.length > 0) return data;
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const handleQuickPlacement = async () => {
    setCreatingPlacement(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const code = await generateAccessCodeSafe();
      const { error } = await supabase.from("placement_test_sessions").insert({
        formateur_id: user.id,
        access_code: code,
        status: "pending",
      });
      if (error) throw error;
      await navigator.clipboard.writeText(code).catch(() => {});
      toast.success(`Code de positionnement : ${code} (copié)`);
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setCreatingPlacement(false);
    }
  };

  const handleQuickDiagnostic = async () => {
    setCreatingDiagnostic(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const code = await generateAccessCodeSafe();
      const { data, error } = await supabase
        .from("shared_diagnostics")
        .insert({
          formateur_id: user.id,
          learner_id: null,
          access_code: code,
          learner_language: "fr",
          status: "in_progress",
        })
        .select()
        .single();
      if (error) throw error;
      await navigator.clipboard.writeText(code).catch(() => {});
      toast.success(`Diagnostic créé — code ${code}`);
      navigate(`/diagnostic-partage?id=${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setCreatingDiagnostic(false);
    }
  };

  const kpis = [
    {
      label: "Apprenants suivis",
      value: learnersCount,
      icon: Users,
      tone: "text-primary",
      bg: "bg-primary/10",
      onClick: () => navigate("/formateur/apprenants"),
    },
    {
      label: "Tests de positionnement (7j)",
      value: placementTests7d,
      icon: GraduationCap,
      tone: "text-emerald-600",
      bg: "bg-emerald-500/10",
      onClick: () => navigate("/formateur/apprenants"),
    },
    {
      label: "Diagnostics en cours",
      value: diagnosticsInProgress,
      icon: Sparkles,
      tone: "text-amber-600",
      bg: "bg-amber-500/10",
      onClick: () => navigate("/diagnostic-partage"),
    },
    {
      label: "Évaluations à corriger",
      value: pendingEvaluations,
      icon: Headphones,
      tone: "text-rose-600",
      bg: "bg-rose-500/10",
      onClick: () => navigate("/formateur/evaluations"),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tableau de bord</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Vue d'ensemble de votre activité de formateur.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleQuickPlacement} disabled={creatingPlacement}>
            <GraduationCap className="mr-2 h-4 w-4" />
            Code positionnement
          </Button>
          <Button variant="outline" onClick={handleQuickDiagnostic} disabled={creatingDiagnostic}>
            <Sparkles className="mr-2 h-4 w-4" />
            Diagnostic rapide
          </Button>
          <CreateLearnerDialog onCreated={refresh} />
        </div>
      </div>

      {/* KPIs */}
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

      {/* Body 2 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingFeed ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Aucune activité récente"
                hint="Lancez un diagnostic ou un test de positionnement pour démarrer."
              />
            ) : (
              <ul className="divide-y">
                {recent.map((e) => (
                  <li key={e.id}>
                    <button
                      onClick={() => navigate(e.href)}
                      className="w-full flex items-center gap-3 py-3 text-left hover:bg-muted/40 -mx-2 px-2 rounded-md transition-colors"
                    >
                      <EventIcon kind={e.kind} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{e.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{e.detail}</div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelative(e.date)}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Top active learners */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Apprenants actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingFeed ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : active.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Aucun apprenant actif"
                hint="Ajoutez votre premier apprenant."
              />
            ) : (
              <ul className="space-y-2">
                {active.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/40 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                      {(l.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{l.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelative(l.lastActivity)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {l.level && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {l.level.toUpperCase()}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">{l.xp} XP</span>
                    </div>
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

function EventIcon({ kind }: { kind: RecentEvent["kind"] }) {
  const map = {
    placement: { icon: GraduationCap, bg: "bg-emerald-500/10", color: "text-emerald-600" },
    diagnostic: { icon: Sparkles, bg: "bg-amber-500/10", color: "text-amber-600" },
    evaluation: { icon: ClipboardCheck, bg: "bg-rose-500/10", color: "text-rose-600" },
  } as const;
  const { icon: Icon, bg, color } = map[kind];
  return (
    <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
      <Icon className={`h-4 w-4 ${color}`} />
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

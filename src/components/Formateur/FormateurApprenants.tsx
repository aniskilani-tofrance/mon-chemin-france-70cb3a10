import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  User,
  FileText,
  Search,
  GraduationCap,
  Plus,
  Sparkles,
  ChevronDown,
  Mail,
  Trophy,
  Calendar,
  ArrowRight,
  Bell,
  X,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  SearchX,
  WifiOff,
  Copy,
  Flame,
  Clock,
  Mic,
  Activity,
  ExternalLink,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CreateLearnerDialog } from "./CreateLearnerDialog";
import { ImportFromSourceDialog } from "./ImportFromSourceDialog";

interface Learner {
  learner_id: string;
  email: string | null;
  full_name: string | null;
  french_level_cecrl: string | null;
  last_activity_at: string | null;
  total_xp: number;
  estimated_level: string | null;
}

interface LearnerHistory {
  placements: Array<{ id: string; status: string | null; level_estimated: string | null; access_code: string | null; created_at: string }>;
  diagnostics: Array<{ id: string; status: string | null; access_code: string | null; created_at: string }>;
  audios: Array<{ id: string; status: string; module_id: string; created_at: string; reviewed_at: string | null }>;
  notifications: Array<{ id: string; title: string; kind: string; created_at: string; read_at: string | null }>;
  progress: {
    streak_days: number | null;
    words_learned: number | null;
    phrases_mastered: number | null;
    total_time_minutes: number | null;
    oral_score: number | null;
    comprehension_score: number | null;
    placement_completed: boolean | null;
  } | null;
}

type TimelineEvent = {
  id: string;
  kind: "placement" | "diagnostic" | "audio" | "notification";
  date: string;
  title: string;
  subtitle: string;
  href?: string;
  badge?: { label: string; tone: "default" | "secondary" | "outline" | "destructive" };
};

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  return new Date(iso).toLocaleDateString("fr-FR");
}

export function FormateurApprenants() {
  const navigate = useNavigate();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<null | { kind: "timeout" | "network" | "unknown"; message: string }>(null);
  const [creatingDiagnostic, setCreatingDiagnostic] = useState<string | null>(null);
  const [creatingPlacement, setCreatingPlacement] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Drill-down sheet
  const [selected, setSelected] = useState<Learner | null>(null);
  const EMPTY_HISTORY: LearnerHistory = { placements: [], diagnostics: [], audios: [], notifications: [], progress: null };
  const [history, setHistory] = useState<LearnerHistory>(EMPTY_HISTORY);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyKind, setNotifyKind] = useState<"info" | "success" | "warning">("info");

  const generateAccessCodeSafe = async (): Promise<string> => {
    const { data, error } = await supabase.rpc("generate_access_code");
    if (!error && typeof data === "string" && data.length > 0) return data;
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const fetchLearners = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const withTimeout = <T,>(p: PromiseLike<T>, ms = 12000): Promise<T> =>
      Promise.race([
        Promise.resolve(p),
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error("__timeout__")), ms),
        ),
      ]);

    try {
      const { data: { user } } = await withTimeout(supabase.auth.getUser());
      if (!user) {
        setLearners([]);
        setLoading(false);
        return;
      }

      const { data: links, error: linksErr } = await withTimeout<any>(
        supabase
          .from("formateur_learners")
          .select("learner_id")
          .eq("formateur_id", user.id),
      );
      if (linksErr) throw linksErr;

      if (!links || links.length === 0) {
        setLearners([]);
        setLoading(false);
        return;
      }

      const learnerIds = links.map((l) => l.learner_id);

      const [{ data: profiles, error: pErr }, { data: progress, error: prErr }] =
        await withTimeout(
          Promise.all([
            supabase
              .from("profiles")
              .select("user_id, email, full_name, french_level_cecrl")
              .in("user_id", learnerIds),
            supabase
              .from("fle_user_progress")
              .select("user_id, total_xp, estimated_level, last_activity_at")
              .in("user_id", learnerIds),
          ]),
        );
      if (pErr) throw pErr;
      if (prErr) throw prErr;

      const merged: Learner[] = learnerIds.map((id) => {
        const profile = profiles?.find((p) => p.user_id === id);
        const prog = progress?.find((p) => p.user_id === id);
        return {
          learner_id: id,
          email: profile?.email ?? null,
          full_name: profile?.full_name ?? null,
          french_level_cecrl: profile?.french_level_cecrl ?? null,
          last_activity_at: prog?.last_activity_at ?? null,
          total_xp: prog?.total_xp ?? 0,
          estimated_level: prog?.estimated_level ?? null,
        };
      });

      setLearners(merged);
    } catch (err: any) {
      const msg = String(err?.message || err || "");
      if (msg === "__timeout__") {
        setLoadError({
          kind: "timeout",
          message: "Le chargement prend plus de temps que prévu. Vérifiez votre connexion.",
        });
      } else if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
        setLoadError({
          kind: "network",
          message: "Impossible de joindre le serveur. Vérifiez votre connexion internet.",
        });
      } else {
        setLoadError({
          kind: "unknown",
          message: msg || "Une erreur est survenue lors du chargement des apprenants.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLearners();
  }, [fetchLearners]);

  const loadHistory = async (learner: Learner) => {
    setHistoryLoading(true);
    setHistory(EMPTY_HISTORY);
    const [pRes, dRes, aRes, nRes, prRes] = await Promise.all([
      supabase
        .from("placement_test_sessions")
        .select("id, status, level_estimated, access_code, created_at")
        .eq("learner_id", learner.learner_id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("shared_diagnostics")
        .select("id, status, access_code, created_at")
        .eq("learner_id", learner.learner_id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("audio_submissions")
        .select("id, status, module_id, created_at, reviewed_at")
        .eq("learner_id", learner.learner_id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("learner_notifications")
        .select("id, title, kind, created_at, read_at")
        .eq("learner_id", learner.learner_id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("fle_user_progress")
        .select("streak_days, words_learned, phrases_mastered, total_time_minutes, oral_score, comprehension_score, placement_completed")
        .eq("user_id", learner.learner_id)
        .maybeSingle(),
    ]);
    setHistory({
      placements: (pRes.data as any) || [],
      diagnostics: (dRes.data as any) || [],
      audios: (aRes.data as any) || [],
      notifications: (nRes.data as any) || [],
      progress: (prRes.data as any) || null,
    });
    setHistoryLoading(false);
  };

  const openSheet = (l: Learner) => {
    setSelected(l);
    loadHistory(l);
  };

  const handleCreateDiagnostic = async (learner: Learner) => {
    setCreatingDiagnostic(learner.learner_id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const accessCode = await generateAccessCodeSafe();
      const { data: diag, error } = await supabase
        .from("shared_diagnostics")
        .insert({
          formateur_id: user.id,
          learner_id: learner.learner_id,
          access_code: accessCode,
          learner_language: "fr",
          status: "in_progress",
        })
        .select()
        .single();
      if (error) throw error;
      toast.success(`Diagnostic créé — code : ${accessCode}`);
      navigate(`/diagnostic-partage?id=${diag.id}`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création");
    } finally {
      setCreatingDiagnostic(null);
    }
  };

  const handleCreatePlacement = async (learner: Learner | null) => {
    const key = learner?.learner_id ?? "quick";
    setCreatingPlacement(key);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const accessCode = await generateAccessCodeSafe();
      const { error } = await supabase.from("placement_test_sessions").insert({
        formateur_id: user.id,
        learner_id: learner?.learner_id ?? null,
        candidate_name: learner?.full_name ?? null,
        candidate_email: learner?.email ?? null,
        access_code: accessCode,
        status: "pending",
      });
      if (error) throw error;
      await navigator.clipboard.writeText(accessCode).catch(() => {});
      const who = learner ? learner.full_name || learner.email || "l'apprenant" : null;
      toast.success(
        who
          ? `Test assigné à ${who} — code : ${accessCode} (copié)`
          : `Code de positionnement : ${accessCode} (copié)`
      );
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setCreatingPlacement(null);
    }
  };

  // ───── Bulk actions ─────
  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const selectedLearners = useMemo(
    () => learners.filter((l) => selectedIds.has(l.learner_id)),
    [learners, selectedIds],
  );

  const bulkChangeLevel = async (level: string) => {
    if (selectedIds.size === 0) return;
    setBulkBusy(true);
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase
        .from("profiles")
        .update({ french_level_cecrl: level.toLowerCase() })
        .in("user_id", ids);
      if (error) throw error;
      toast.success(`Niveau ${level} appliqué à ${ids.length} apprenant(s)`);
      clearSelection();
      await fetchLearners();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du changement de niveau");
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkTriggerPlacement = async () => {
    if (selectedIds.size === 0) return;
    setBulkBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const rows = await Promise.all(
        selectedLearners.map(async (l) => ({
          formateur_id: user.id,
          learner_id: l.learner_id,
          candidate_name: l.full_name,
          candidate_email: l.email,
          access_code: await generateAccessCodeSafe(),
          status: "pending",
        })),
      );
      const { error } = await supabase.from("placement_test_sessions").insert(rows);
      if (error) throw error;
      toast.success(`${rows.length} test(s) de positionnement créé(s)`);
      clearSelection();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création des tests");
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkSendNotification = async () => {
    if (selectedIds.size === 0) return;
    if (!notifyTitle.trim() || !notifyMessage.trim()) {
      toast.error("Titre et message requis");
      return;
    }
    setBulkBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const rows = Array.from(selectedIds).map((learner_id) => ({
        formateur_id: user.id,
        learner_id,
        title: notifyTitle.trim(),
        message: notifyMessage.trim(),
        kind: notifyKind,
      }));
      const { error } = await supabase.from("learner_notifications").insert(rows);
      if (error) throw error;
      toast.success(`Notification envoyée à ${rows.length} apprenant(s)`);
      setNotifyOpen(false);
      setNotifyTitle("");
      setNotifyMessage("");
      setNotifyKind("info");
      clearSelection();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi");
    } finally {
      setBulkBusy(false);
    }
  };

  const filtered = useMemo(() => {
    let result = [...learners];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          (l.full_name || "").toLowerCase().includes(q) ||
          (l.email || "").toLowerCase().includes(q)
      );
    }

    if (levelFilter !== "all") {
      result = result.filter(
        (l) => (l.estimated_level || l.french_level_cecrl || "").toUpperCase() === levelFilter
      );
    }

    if (activityFilter !== "all") {
      const now = Date.now();
      result = result.filter((l) => {
        if (!l.last_activity_at) return activityFilter === "inactive_30";
        const days = (now - new Date(l.last_activity_at).getTime()) / 86400000;
        if (activityFilter === "active_7") return days <= 7;
        if (activityFilter === "inactive_30") return days > 30;
        return true;
      });
    }

    result.sort((a, b) => {
      if (sortBy === "recent") {
        const at = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
        const bt = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
        return bt - at;
      }
      if (sortBy === "xp") return (b.total_xp || 0) - (a.total_xp || 0);
      if (sortBy === "name") return (a.full_name || "").localeCompare(b.full_name || "");
      return 0;
    });

    return result;
  }, [learners, search, levelFilter, activityFilter, sortBy]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un apprenant…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous niveaux</SelectItem>
              {LEVELS.map((lv) => (
                <SelectItem key={lv} value={lv}>
                  {lv}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={activityFilter} onValueChange={setActivityFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Activité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toute activité</SelectItem>
              <SelectItem value="active_7">Actifs (7 j)</SelectItem>
              <SelectItem value="inactive_30">Inactifs (&gt;30 j)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récents</SelectItem>
              <SelectItem value="name">Nom (A→Z)</SelectItem>
              <SelectItem value="xp">XP (décroissant)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => handleCreatePlacement(null)}
            disabled={creatingPlacement === "quick"}
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Code positionnement
          </Button>
          <ImportFromSourceDialog onImported={fetchLearners} />
          <CreateLearnerDialog onCreated={fetchLearners} />
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-16 z-10 flex flex-wrap items-center gap-2 rounded-lg border bg-primary/5 px-3 py-2 shadow-sm">
          <Badge variant="secondary" className="font-semibold">
            {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}
          </Badge>
          <div className="h-5 w-px bg-border mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" disabled={bulkBusy}>
                <GraduationCap className="mr-2 h-4 w-4" />
                Changer le niveau
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel className="text-xs">
                Niveau CECRL
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {LEVELS.map((lv) => (
                <DropdownMenuItem key={lv} onClick={() => bulkChangeLevel(lv)}>
                  {lv}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            variant="outline"
            onClick={bulkTriggerPlacement}
            disabled={bulkBusy}
          >
            {bulkBusy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="mr-2 h-4 w-4" />
            )}
            Lancer un test
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setNotifyOpen(true)}
            disabled={bulkBusy}
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifier
          </Button>

          <div className="ml-auto" />
          <Button
            size="sm"
            variant="ghost"
            onClick={clearSelection}
            disabled={bulkBusy}
          >
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
        </div>
      )}

      {/* List */}
      <Card>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3" aria-busy="true" aria-label="Chargement des apprenants">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
              <p className="text-xs text-muted-foreground text-center pt-2">
                Récupération de la liste de vos apprenants…
              </p>
            </div>
          ) : loadError ? (
            <div className="text-center py-16 px-6 space-y-3">
              <div
                className={`mx-auto h-14 w-14 rounded-full flex items-center justify-center ${
                  loadError.kind === "network"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-amber-500/10 text-amber-600"
                }`}
              >
                {loadError.kind === "network" ? (
                  <WifiOff className="h-7 w-7" />
                ) : (
                  <AlertCircle className="h-7 w-7" />
                )}
              </div>
              <div>
                <p className="font-semibold">
                  {loadError.kind === "timeout"
                    ? "Chargement trop long"
                    : loadError.kind === "network"
                    ? "Connexion interrompue"
                    : "Une erreur est survenue"}
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  {loadError.message}
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <Button onClick={fetchLearners}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réessayer
                </Button>
              </div>
            </div>
          ) : learners.length === 0 ? (
            <div className="text-center py-16 px-6 space-y-3">
              <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Aucun apprenant pour le moment</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Créez un compte apprenant, importez depuis une source existante, ou démarrez un diagnostic rapide avec un code d'accès.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2 flex-wrap">
                <CreateLearnerDialog onCreated={fetchLearners} />
                <ImportFromSourceDialog onImported={fetchLearners} />
                <Button variant="outline" onClick={() => handleCreatePlacement(null)}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Code de positionnement
                </Button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-6 space-y-3">
              <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                <SearchX className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">Aucun apprenant ne correspond</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  {search.trim()
                    ? `Aucun résultat pour "${search.trim()}"`
                    : "Aucun apprenant ne correspond aux filtres sélectionnés."}
                  {" "}Ajustez votre recherche ou réinitialisez les filtres.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setLevelFilter("all");
                    setActivityFilter("all");
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Réinitialiser les filtres
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                {learners.length} apprenant{learners.length > 1 ? "s" : ""} au total
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={
                          filtered.length > 0 &&
                          filtered.every((l) => selectedIds.has(l.learner_id))
                        }
                        onCheckedChange={(v) => {
                          if (v) {
                            setSelectedIds(
                              new Set(filtered.map((l) => l.learner_id)),
                            );
                          } else {
                            clearSelection();
                          }
                        }}
                        aria-label="Tout sélectionner"
                      />
                    </TableHead>
                    <TableHead>Apprenant</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => {
                    const level = (l.estimated_level || l.french_level_cecrl || "").toUpperCase();
                    const isChecked = selectedIds.has(l.learner_id);
                    return (
                      <TableRow
                        key={l.learner_id}
                        data-state={isChecked ? "selected" : undefined}
                        className="cursor-pointer group"
                        onClick={() => openSheet(l)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleId(l.learner_id)}
                            aria-label={`Sélectionner ${l.full_name || l.email || ""}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                              {(l.full_name || l.email || "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{l.full_name || "—"}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {l.email || "Pas d'email"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {level ? (
                            <Badge variant="outline" className="font-semibold">{level}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Trophy className="h-3.5 w-3.5 text-amber-500" />
                            {l.total_xp}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatRelative(l.last_activity_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className="flex justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCreatePlacement(l)}
                              disabled={creatingPlacement === l.learner_id}
                              title="Test de positionnement"
                            >
                              {creatingPlacement === l.learner_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <GraduationCap className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCreateDiagnostic(l)}
                              disabled={creatingDiagnostic === l.learner_id}
                              title="Diagnostic partagé"
                            >
                              {creatingDiagnostic === l.learner_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openSheet(l)}
                              title="Voir la fiche"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drill-down sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
          {selected && (() => {
            const level = (selected.estimated_level || selected.french_level_cecrl || "—").toUpperCase();
            const isActive7d = selected.last_activity_at
              ? (Date.now() - new Date(selected.last_activity_at).getTime()) / 86400000 <= 7
              : false;
            const isInactive30d = selected.last_activity_at
              ? (Date.now() - new Date(selected.last_activity_at).getTime()) / 86400000 > 30
              : true;

            const timeline: TimelineEvent[] = [
              ...history.placements.map<TimelineEvent>((p) => ({
                id: `pl-${p.id}`,
                kind: "placement",
                date: p.created_at,
                title: p.level_estimated
                  ? `Test de positionnement — niveau ${p.level_estimated}`
                  : "Test de positionnement",
                subtitle: p.access_code ? `Code ${p.access_code}` : (p.status || "—"),
                href: `/formateur/apprenants?placement=${p.id}`,
                badge: p.status === "completed"
                  ? { label: "Terminé", tone: "secondary" }
                  : p.status === "pending"
                  ? { label: "En attente", tone: "outline" }
                  : { label: p.status || "—", tone: "outline" },
              })),
              ...history.diagnostics.map<TimelineEvent>((d) => ({
                id: `di-${d.id}`,
                kind: "diagnostic",
                date: d.created_at,
                title: "Diagnostic partagé",
                subtitle: d.access_code ? `Code ${d.access_code}` : (d.status || "—"),
                href: `/diagnostic-partage?id=${d.id}`,
                badge: d.status === "completed"
                  ? { label: "Terminé", tone: "secondary" }
                  : { label: d.status || "En cours", tone: "outline" },
              })),
              ...history.audios.map<TimelineEvent>((a) => ({
                id: `au-${a.id}`,
                kind: "audio",
                date: a.created_at,
                title: "Production orale soumise",
                subtitle: a.reviewed_at ? "Évaluée" : "À évaluer",
                href: `/formateur/evaluations?submission=${a.id}`,
                badge: a.status === "approved"
                  ? { label: "Validée", tone: "secondary" }
                  : a.status === "needs_revision"
                  ? { label: "À revoir", tone: "destructive" }
                  : { label: "En attente", tone: "outline" },
              })),
              ...history.notifications.map<TimelineEvent>((n) => ({
                id: `nt-${n.id}`,
                kind: "notification",
                date: n.created_at,
                title: n.title,
                subtitle: n.read_at ? "Lue par l'apprenant" : "Non lue",
                badge: n.read_at
                  ? { label: "Lue", tone: "secondary" }
                  : { label: "Envoyée", tone: "outline" },
              })),
            ]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 12);

            const lastPlacement = history.placements[0];
            const lastDiagnostic = history.diagnostics[0];
            const pendingAudio = history.audios.find((a) => !a.reviewed_at);

            const copyEmail = async () => {
              if (!selected.email) return;
              try {
                await navigator.clipboard.writeText(selected.email);
                toast.success("Email copié");
              } catch {
                toast.error("Impossible de copier");
              }
            };

            return (
              <>
                {/* Header */}
                <SheetHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-b from-muted/40 to-transparent">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold shrink-0">
                      {(selected.full_name || selected.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <SheetTitle className="text-left truncate text-lg">
                        {selected.full_name || "Apprenant"}
                      </SheetTitle>
                      <SheetDescription className="text-left truncate flex items-center gap-1.5">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{selected.email || "Pas d'email"}</span>
                        {selected.email && (
                          <button
                            onClick={copyEmail}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Copier l'email"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        )}
                      </SheetDescription>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <Badge variant="outline" className="font-semibold">{level}</Badge>
                        {isActive7d ? (
                          <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/20">
                            <Activity className="h-3 w-3 mr-1" />
                            Actif
                          </Badge>
                        ) : isInactive30d ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            Inactif &gt;30j
                          </Badge>
                        ) : (
                          <Badge variant="outline">Récent</Badge>
                        )}
                        {history.progress?.placement_completed && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Positionné
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetHeader>

                <div className="px-6 py-4 space-y-5">
                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <StatBox
                      label="XP"
                      value={String(selected.total_xp)}
                      icon={Trophy}
                      iconClass="text-amber-500"
                    />
                    <StatBox
                      label="Série"
                      value={`${history.progress?.streak_days ?? 0}j`}
                      icon={Flame}
                      iconClass="text-orange-500"
                    />
                    <StatBox
                      label="Temps"
                      value={formatMinutes(history.progress?.total_time_minutes)}
                      icon={Clock}
                      iconClass="text-sky-500"
                    />
                    <StatBox
                      label="Mots"
                      value={String(history.progress?.words_learned ?? 0)}
                      icon={BookOpen}
                      iconClass="text-violet-500"
                    />
                    <StatBox
                      label="Phrases"
                      value={String(history.progress?.phrases_mastered ?? 0)}
                      icon={Sparkles}
                      iconClass="text-pink-500"
                    />
                    <StatBox
                      label="Activité"
                      value={formatRelative(selected.last_activity_at)}
                      small
                    />
                  </div>

                  {/* Recent shortcuts */}
                  {(lastPlacement || lastDiagnostic || pendingAudio) && (
                    <div className="rounded-lg border bg-muted/20 p-3 space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                        Reprendre rapidement
                      </p>
                      {pendingAudio && (
                        <ShortcutLink
                          icon={Mic}
                          label="Évaluer la dernière production"
                          hint={formatRelative(pendingAudio.created_at)}
                          tone="warning"
                          onClick={() => {
                            navigate(`/formateur/evaluations?submission=${pendingAudio.id}`);
                            setSelected(null);
                          }}
                        />
                      )}
                      {lastDiagnostic && (
                        <ShortcutLink
                          icon={Sparkles}
                          label={`Ouvrir le dernier diagnostic${lastDiagnostic.access_code ? ` (${lastDiagnostic.access_code})` : ""}`}
                          hint={formatRelative(lastDiagnostic.created_at)}
                          onClick={() => {
                            navigate(`/diagnostic-partage?id=${lastDiagnostic.id}`);
                            setSelected(null);
                          }}
                        />
                      )}
                      {lastPlacement && (
                        <ShortcutLink
                          icon={GraduationCap}
                          label={`Dernier positionnement${lastPlacement.level_estimated ? ` — ${lastPlacement.level_estimated}` : ""}`}
                          hint={formatRelative(lastPlacement.created_at)}
                          onClick={() => {
                            if (lastPlacement.access_code) {
                              navigator.clipboard.writeText(lastPlacement.access_code).catch(() => {});
                              toast.success(`Code ${lastPlacement.access_code} copié`);
                            }
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Quick actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreatePlacement(selected)}
                      disabled={creatingPlacement === selected.learner_id}
                    >
                      {creatingPlacement === selected.learner_id ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Positionner
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateDiagnostic(selected)}
                      disabled={creatingDiagnostic === selected.learner_id}
                    >
                      {creatingDiagnostic === selected.learner_id ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Diagnostic
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedIds(new Set([selected.learner_id]));
                        setNotifyOpen(true);
                      }}
                    >
                      <Bell className="mr-1.5 h-3.5 w-3.5" />
                      Notifier
                    </Button>
                  </div>

                  {/* Unified timeline */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold">Activité récente</h3>
                      </div>
                      {timeline.length > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {timeline.length} événement{timeline.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {historyLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-14 w-full rounded-md" />
                        ))}
                      </div>
                    ) : timeline.length === 0 ? (
                      <div className="text-center py-8 text-xs text-muted-foreground italic border border-dashed rounded-md">
                        Aucune activité enregistrée pour cet apprenant.
                      </div>
                    ) : (
                      <ol className="relative border-l border-border ml-2 space-y-3">
                        {timeline.map((ev) => (
                          <TimelineItem
                            key={ev.id}
                            event={ev}
                            onOpen={() => {
                              if (ev.href) {
                                navigate(ev.href);
                                setSelected(null);
                              }
                            }}
                          />
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* Bulk notification dialog */}
      <Dialog open={notifyOpen} onOpenChange={setNotifyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Envoyer une notification
            </DialogTitle>
            <DialogDescription>
              {selectedIds.size} apprenant{selectedIds.size > 1 ? "s" : ""} recevront ce message.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Type</label>
              <Select value={notifyKind} onValueChange={(v: any) => setNotifyKind(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="success">Encouragement</SelectItem>
                  <SelectItem value="warning">Rappel important</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Titre</label>
              <Input
                value={notifyTitle}
                onChange={(e) => setNotifyTitle(e.target.value)}
                placeholder="Ex. Nouveau module disponible"
                maxLength={120}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Message</label>
              <Textarea
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                placeholder="Votre message…"
                rows={4}
                maxLength={1000}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setNotifyOpen(false)} disabled={bulkBusy}>
              Annuler
            </Button>
            <Button onClick={bulkSendNotification} disabled={bulkBusy}>
              {bulkBusy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bell className="mr-2 h-4 w-4" />
              )}
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatMinutes(mins: number | null | undefined): string {
  const m = mins ?? 0;
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h${String(r).padStart(2, "0")}` : `${h}h`;
}

function StatBox({
  label,
  value,
  small,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string;
  small?: boolean;
  icon?: any;
  iconClass?: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-2.5 text-center">
      <div className="flex items-center justify-center gap-1">
        {Icon && <Icon className={`h-3.5 w-3.5 ${iconClass || "text-muted-foreground"}`} />}
        <div className={`font-bold ${small ? "text-xs" : "text-base"}`}>{value}</div>
      </div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
}

function ShortcutLink({
  icon: Icon,
  label,
  hint,
  tone,
  onClick,
}: {
  icon: any;
  label: string;
  hint?: string;
  tone?: "warning" | "default";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
        tone === "warning"
          ? "bg-amber-500/5 hover:bg-amber-500/10 text-amber-900 dark:text-amber-200"
          : "hover:bg-muted"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${tone === "warning" ? "text-amber-600" : "text-muted-foreground"}`} />
      <span className="flex-1 truncate font-medium">{label}</span>
      {hint && <span className="text-[10px] text-muted-foreground whitespace-nowrap">{hint}</span>}
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
    </button>
  );
}

function TimelineItem({
  event,
  onOpen,
}: {
  event: {
    id: string;
    kind: "placement" | "diagnostic" | "audio" | "notification";
    date: string;
    title: string;
    subtitle: string;
    href?: string;
    badge?: { label: string; tone: "default" | "secondary" | "outline" | "destructive" };
  };
  onOpen: () => void;
}) {
  const iconMap = {
    placement: { Icon: GraduationCap, color: "text-blue-600 bg-blue-500/10" },
    diagnostic: { Icon: Sparkles, color: "text-violet-600 bg-violet-500/10" },
    audio: { Icon: Mic, color: "text-amber-600 bg-amber-500/10" },
    notification: { Icon: Bell, color: "text-emerald-600 bg-emerald-500/10" },
  };
  const { Icon, color } = iconMap[event.kind];
  const date = new Date(event.date);
  const relative =
    Math.floor((Date.now() - date.getTime()) / 86400000) < 1
      ? "Aujourd'hui"
      : date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  return (
    <li className="ml-3">
      <span
        className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background ${color}`}
      >
        <Icon className="h-2.5 w-2.5" />
      </span>
      <div
        className={`rounded-md border bg-card px-3 py-2 text-sm group ${
          event.href ? "cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-colors" : ""
        }`}
        onClick={event.href ? onOpen : undefined}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate flex items-center gap-1.5">
              {event.title}
              {event.href && (
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate capitalize">
              {event.subtitle}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{relative}</span>
            {event.badge && (
              <Badge variant={event.badge.tone} className="text-[10px] py-0 px-1.5 h-4">
                {event.badge.label}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

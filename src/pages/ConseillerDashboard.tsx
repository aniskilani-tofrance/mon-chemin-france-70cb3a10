import { useEffect, useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  MapPin,
  Languages,
  Clock,
  MessageCircle,
  Loader2,
  ArrowLeft,
  PhoneCall,
  CheckCircle2,
  StickyNote,
  ArrowRight,
  History,
} from "lucide-react";
import { RECOMMENDED_PATH_LABEL } from "@/lib/orientationRouter";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useAdminCheck } from "@/hooks/useAdminCheck";

type Status = Database["public"]["Enums"]["follow_up_status"];
type EventType = "status_change" | "call" | "whatsapp" | "note" | "callback_done" | "assignment";

const STATUS_LABELS: Record<Status, string> = {
  nouveau_diagnostic: "Nouveau diagnostic",
  a_rappeler: "À rappeler",
  contacte: "Contacté",
  besoin_confirme: "Besoin confirmé",
  oriente: "Orienté",
  rdv_propose: "RDV proposé",
  inscrit: "Inscrit",
  en_formation: "En formation",
  en_accompagnement: "En accompagnement",
  en_emploi: "En emploi",
  a_relancer: "À relancer",
  frein_identifie: "Frein identifié",
  sortie_positive: "Sortie positive",
  dossier_cloture: "Dossier clôturé",
};

const STATUS_ORDER: Status[] = [
  "nouveau_diagnostic",
  "a_rappeler",
  "contacte",
  "besoin_confirme",
  "oriente",
  "rdv_propose",
  "inscrit",
  "en_formation",
  "en_accompagnement",
  "en_emploi",
  "a_relancer",
  "frein_identifie",
  "sortie_positive",
  "dossier_cloture",
];

const LANG_LABEL: Record<string, string> = {
  fr: "Français", ar: "العربية", en: "English", es: "Español", pt: "Português", ru: "Русский", uk: "Українська",
};

interface BeneficiaryRow {
  id: string;
  created_at: string;
  first_name: string | null;
  phone: string | null;
  email: string | null;
  language: string | null;
  postal_code?: string | null;
  recommended_path: keyof typeof RECOMMENDED_PATH_LABEL | null;
  secondary_path: keyof typeof RECOMMENDED_PATH_LABEL | null;
  follow_up_status: Status;
  callback_requested_at: string | null;
  callback_done_at: string | null;
  advisor_notes: string | null;
  french_level_cecrl: string | null;
  main_goal: string | null;
  barriers: string[] | null;
  answers: Record<string, unknown> | null;
}

interface FollowUpEvent {
  id: string;
  onboarding_result_id: string;
  advisor_id: string | null;
  event_type: EventType;
  from_status: Status | null;
  to_status: Status | null;
  note: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const ConseillerDashboard = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [rows, setRows] = useState<BeneficiaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("a_rappeler");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("onboarding_results")
        .select(
          "id,created_at,first_name,phone,email,language,recommended_path,secondary_path,follow_up_status,callback_requested_at,callback_done_at,advisor_notes,french_level_cecrl,main_goal,barriers,answers"
        )
        .order("callback_requested_at", { ascending: true, nullsFirst: false })
        .limit(200);
      if (!mounted) return;
      if (error) {
        toast.error("Impossible de charger la file de rappel.");
        console.error(error);
      } else {
        setRows((data ?? []) as unknown as BeneficiaryRow[]);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const languages = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.language && set.add(r.language));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        (statusFilter === "all" || r.follow_up_status === statusFilter) &&
        (languageFilter === "all" || r.language === languageFilter)
      ),
    [rows, statusFilter, languageFilter]
  );

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  const logEvent = useCallback(async (resultId: string, payload: Partial<FollowUpEvent>) => {
    const { data: userData } = await supabase.auth.getUser();
    const advisor_id = userData.user?.id ?? null;
    const { error } = await supabase.from("onboarding_follow_up_events").insert({
      onboarding_result_id: resultId,
      advisor_id,
      event_type: payload.event_type,
      from_status: payload.from_status ?? null,
      to_status: payload.to_status ?? null,
      note: payload.note ?? null,
      metadata: payload.metadata ?? {},
    });
    if (error) console.error("Failed to log event", error);
  }, []);

  const updateRow = useCallback(async (
    id: string,
    patch: Partial<BeneficiaryRow>,
    eventType?: EventType,
    eventNote?: string,
  ) => {
    setSavingId(id);
    const current = rows.find((r) => r.id === id);
    const update: Record<string, unknown> = { ...patch };

    // Quand on passe à "contacte", on horodate l'appel effectif
    if (patch.follow_up_status === "contacte" && !current?.callback_done_at) {
      update.callback_done_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("onboarding_results")
      .update(update as never)
      .eq("id", id);
    setSavingId(null);

    if (error) {
      toast.error("Mise à jour impossible.");
      console.error(error);
      return;
    }

    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...patch,
              ...(update.callback_done_at
                ? { callback_done_at: update.callback_done_at as string }
                : {}),
            }
          : r,
      ),
    );

    // Historisation
    if (eventType) {
      const isStatusChange = eventType === "status_change" && patch.follow_up_status;
      await logEvent(id, {
        event_type: eventType,
        from_status: isStatusChange ? current?.follow_up_status ?? null : null,
        to_status: isStatusChange ? (patch.follow_up_status as Status) : null,
        note: eventNote,
      });
    }
    toast.success("Mis à jour.");
  }, [rows, logEvent]);

  // Action sans changement DB (ex: bouton Appeler, WhatsApp) → on log seulement
  const trackContactAction = useCallback(async (id: string, kind: "call" | "whatsapp") => {
    await logEvent(id, { event_type: kind });
  }, [logEvent]);

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background"><Header /><div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Espace conseiller — ToFrance</title>
        <meta name="description" content="File de rappel des bénéficiaires ToFrance et suivi de parcours." />
      </Helmet>
      <Header />
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Espace conseiller</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Bénéficiaires en attente de rappel sous 48h, suivi de parcours.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "all")}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes langues</SelectItem>
                {languages.map((l) => (
                  <SelectItem key={l} value={l}>{LANG_LABEL[l] || l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!isAdmin && (
          <Card className="mb-4 border-amber-300 bg-amber-50/50">
            <CardContent className="p-3 text-xs text-amber-900">
              Vue conseiller — l'accès complet nécessite le rôle "conseiller" ou "admin".
            </CardContent>
          </Card>
        )}

        {selected ? (
          <BeneficiaryDetail
            row={selected}
            saving={savingId === selected.id}
            onBack={() => setSelectedId(null)}
            onUpdate={updateRow}
            onTrackContact={trackContactAction}
          />
        ) : (
          <div className="grid gap-3">
            {loading ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">Aucun bénéficiaire pour ces filtres.</CardContent></Card>
            ) : (
              filtered.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className="text-left"
                >
                  <Card className="transition hover:border-primary/40 hover:shadow-md">
                    <CardContent className="flex flex-wrap items-center gap-4 p-4">
                      <div className="flex-1 min-w-[180px]">
                        <p className="font-semibold text-foreground">{r.first_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          Reçu {new Date(r.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {r.language && <Badge variant="outline" className="gap-1"><Languages className="h-3 w-3" />{LANG_LABEL[r.language] || r.language}</Badge>}
                        {r.phone && <Badge variant="outline" className="gap-1"><Phone className="h-3 w-3" />{r.phone}</Badge>}
                        {r.recommended_path && <Badge className="bg-primary/10 text-primary hover:bg-primary/15">{RECOMMENDED_PATH_LABEL[r.recommended_path]}</Badge>}
                      </div>
                      <Badge variant="secondary">{STATUS_LABELS[r.follow_up_status]}</Badge>
                    </CardContent>
                  </Card>
                </button>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

function BeneficiaryDetail({
  row,
  saving,
  onBack,
  onUpdate,
  onTrackContact,
}: {
  row: BeneficiaryRow;
  saving: boolean;
  onBack: () => void;
  onUpdate: (
    id: string,
    patch: Partial<BeneficiaryRow>,
    eventType?: EventType,
    eventNote?: string,
  ) => Promise<void> | void;
  onTrackContact: (id: string, kind: "call" | "whatsapp") => Promise<void> | void;
}) {
  const [notes, setNotes] = useState(row.advisor_notes ?? "");
  const [events, setEvents] = useState<FollowUpEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [reload, setReload] = useState(0);

  useEffect(() => setNotes(row.advisor_notes ?? ""), [row.id, row.advisor_notes]);

  useEffect(() => {
    let mounted = true;
    setLoadingEvents(true);
    (async () => {
      const { data, error } = await supabase
        .from("onboarding_follow_up_events")
        .select("*")
        .eq("onboarding_result_id", row.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!mounted) return;
      if (error) console.error(error);
      setEvents((data ?? []) as unknown as FollowUpEvent[]);
      setLoadingEvents(false);
    })();
    return () => { mounted = false; };
  }, [row.id, reload]);

  const triggerReload = () => setReload((n) => n + 1);

  const answers = (row.answers ?? {}) as Record<string, unknown>;
  const postal = (answers.postal_code as string) || "";
  const goal = (answers.main_goal as string) || row.main_goal || "—";

  const handleStatusChange = async (next: Status) => {
    await onUpdate(row.id, { follow_up_status: next }, "status_change");
    triggerReload();
  };

  const handleSaveNotes = async () => {
    await onUpdate(row.id, { advisor_notes: notes }, "note", notes);
    triggerReload();
  };

  const handleCall = async () => {
    await onTrackContact(row.id, "call");
    triggerReload();
  };

  const handleWhatsApp = async () => {
    await onTrackContact(row.id, "whatsapp");
    triggerReload();
  };

  const handleMarkContacted = async () => {
    await onUpdate(row.id, { follow_up_status: "contacte" }, "callback_done");
    triggerReload();
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Retour à la file
      </Button>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">{row.first_name || "Bénéficiaire"}</h2>
              <p className="text-xs text-muted-foreground">Reçu {new Date(row.created_at).toLocaleString("fr-FR")}</p>
            </div>
            <Badge variant="secondary">{STATUS_LABELS[row.follow_up_status]}</Badge>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <Field icon={<Languages className="h-4 w-4" />} label="Langue" value={row.language ? (LANG_LABEL[row.language] || row.language) : "—"} />
            <Field icon={<Phone className="h-4 w-4" />} label="Téléphone" value={row.phone || "—"} />
            <Field icon={<MapPin className="h-4 w-4" />} label="Code postal" value={postal || "—"} />
            <Field icon={<Clock className="h-4 w-4" />} label="Demande de rappel" value={row.callback_requested_at ? new Date(row.callback_requested_at).toLocaleString("fr-FR") : "—"} />
            <Field label="Email" value={row.email || "—"} />
            <Field label="Niveau français" value={row.french_level_cecrl || "—"} />
            <Field label="Objectif principal" value={goal} />
            <Field label="Freins" value={row.barriers && row.barriers.length ? row.barriers.join(", ") : "—"} />
          </div>

          {(row.recommended_path || row.secondary_path) && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Parcours recommandé</p>
              <div className="flex flex-wrap items-center gap-2">
                {row.recommended_path && <Badge className="bg-primary text-primary-foreground">{RECOMMENDED_PATH_LABEL[row.recommended_path]}</Badge>}
                {row.secondary_path && (
                  <>
                    <span className="text-xs text-muted-foreground">puis</span>
                    <Badge variant="outline">{RECOMMENDED_PATH_LABEL[row.secondary_path]}</Badge>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions de contact */}
          <div className="grid gap-2 sm:grid-cols-3">
            {row.phone ? (
              <>
                <Button variant="outline" asChild className="gap-2" onClick={handleCall}>
                  <a href={`tel:${row.phone}`}>
                    <PhoneCall className="h-4 w-4" /> Appeler
                  </a>
                </Button>
                <Button variant="outline" asChild className="gap-2" onClick={handleWhatsApp}>
                  <a
                    href={`https://wa.me/${row.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </Button>
              </>
            ) : (
              <div className="sm:col-span-2 rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                Aucun numéro de téléphone fourni
              </div>
            )}
            <Button
              variant="default"
              className="gap-2"
              onClick={handleMarkContacted}
              disabled={saving || row.follow_up_status === "contacte"}
            >
              <CheckCircle2 className="h-4 w-4" /> Marquer contacté
            </Button>
          </div>

          {/* Statut + Notes */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Statut de suivi (14)</label>
              <Select
                value={row.follow_up_status}
                onValueChange={(v) => handleStatusChange(v as Status)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Dernier contact effectif
              </label>
              <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                {row.callback_done_at
                  ? new Date(row.callback_done_at).toLocaleString("fr-FR")
                  : "Pas encore contacté"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Notes du conseiller</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Contexte, retours d'appel, prochain pas convenu…"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={saving || notes === (row.advisor_notes ?? "")}
                onClick={handleSaveNotes}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer la note"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Historique du suivi</h3>
            <span className="text-xs text-muted-foreground">({events.length})</span>
          </div>
          {loadingEvents ? (
            <div className="flex h-20 items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Aucune action enregistrée pour l'instant.
            </p>
          ) : (
            <ol className="relative space-y-4 border-l border-border pl-5">
              {events.map((e) => (
                <TimelineItem key={e.id} event={e} />
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TimelineItem({ event }: { event: FollowUpEvent }) {
  const meta = EVENT_META[event.event_type];
  const Icon = meta.icon;
  return (
    <li className="relative">
      <span
        className={`absolute -left-[26px] flex h-5 w-5 items-center justify-center rounded-full ${meta.bg} ring-4 ring-background`}
      >
        <Icon className="h-3 w-3 text-white" />
      </span>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-foreground">{meta.label}</span>
        {event.event_type === "status_change" && event.to_status && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {event.from_status && (
              <>
                <Badge variant="outline" className="text-[10px]">
                  {STATUS_LABELS[event.from_status]}
                </Badge>
                <ArrowRight className="h-3 w-3" />
              </>
            )}
            <Badge variant="secondary" className="text-[10px]">
              {STATUS_LABELS[event.to_status]}
            </Badge>
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {new Date(event.created_at).toLocaleString("fr-FR", {
          dateStyle: "short",
          timeStyle: "short",
        })}
      </p>
      {event.note && (
        <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted/40 p-2 text-xs text-foreground">
          {event.note}
        </p>
      )}
    </li>
  );
}

const EVENT_META: Record<EventType, { label: string; icon: typeof Phone; bg: string }> = {
  status_change: { label: "Changement de statut", icon: ArrowRight, bg: "bg-primary" },
  call: { label: "Appel téléphonique", icon: PhoneCall, bg: "bg-blue-500" },
  whatsapp: { label: "Message WhatsApp", icon: MessageCircle, bg: "bg-green-500" },
  note: { label: "Note ajoutée", icon: StickyNote, bg: "bg-amber-500" },
  callback_done: { label: "Rappel effectué", icon: CheckCircle2, bg: "bg-emerald-600" },
  assignment: { label: "Attribution", icon: History, bg: "bg-purple-500" },
};

function Field({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border p-3">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div className="min-w-0">
        <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default ConseillerDashboard;

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import { Phone, MapPin, Languages, Clock, MessageCircle, Loader2, ArrowLeft } from "lucide-react";
import { RECOMMENDED_PATH_LABEL } from "@/lib/orientationRouter";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useAdminCheck } from "@/hooks/useAdminCheck";

type Status = Database["public"]["Enums"]["follow_up_status"];

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

  const updateRow = async (id: string, patch: Partial<BeneficiaryRow>) => {
    setSavingId(id);
    const update: Record<string, unknown> = { ...patch };
    if (patch.follow_up_status === "contacte" && !rows.find((r) => r.id === id)?.callback_done_at) {
      update.callback_done_at = new Date().toISOString();
    }
    const { error } = await supabase.from("onboarding_results").update(update as any).eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error("Mise à jour impossible.");
      console.error(error);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch, ...(update.callback_done_at ? { callback_done_at: update.callback_done_at as string } : {}) } : r)));
    toast.success("Mis à jour.");
  };

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
            onUpdate={(patch) => updateRow(selected.id, patch)}
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
}: {
  row: BeneficiaryRow;
  saving: boolean;
  onBack: () => void;
  onUpdate: (patch: Partial<BeneficiaryRow>) => void;
}) {
  const [notes, setNotes] = useState(row.advisor_notes ?? "");
  useEffect(() => setNotes(row.advisor_notes ?? ""), [row.id, row.advisor_notes]);
  const answers = (row.answers ?? {}) as Record<string, unknown>;
  const postal = (answers.postal_code as string) || "";
  const goal = (answers.main_goal as string) || row.main_goal || "—";

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

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Statut de suivi</label>
              <Select
                value={row.follow_up_status}
                onValueChange={(v) => onUpdate({ follow_up_status: v as Status })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              {row.phone && (
                <Button variant="outline" asChild className="flex-1 gap-2">
                  <a href={`tel:${row.phone}`}><Phone className="h-4 w-4" /> Appeler</a>
                </Button>
              )}
              {row.phone && (
                <Button variant="outline" asChild className="flex-1 gap-2">
                  <a href={`https://wa.me/${row.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </Button>
              )}
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
                onClick={() => onUpdate({ advisor_notes: notes })}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer les notes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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

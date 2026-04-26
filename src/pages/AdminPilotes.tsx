import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, MapPin, PhoneCall, Printer, RefreshCcw, Route, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const QUALIFIED_SCORE = 70;

type SourceFields = {
  source_location_id: string | null;
  source_name: string | null;
  source_type: string | null;
  source_campaign: string | null;
};

type PilotDiagnostic = SourceFields & {
  id: string;
  created_at: string;
  email: string | null;
  language: string;
  lead_route: string | null;
  lead_score: number | null;
  statut_lead: string | null;
  first_name: string | null;
  phone: string | null;
  answers: Record<string, unknown> | null;
};

type PilotProfile = SourceFields & {
  id: string;
  created_at: string;
  email: string | null;
  first_name: string | null;
  full_name: string | null;
  phone: string | null;
  lead_route: string | null;
  lead_score: number | null;
  statut_lead: string | null;
};

type PilotLead = SourceFields & {
  id: string;
  created_at: string;
  status: string | null;
  statut_lead: string | null;
  match_score: number | null;
  first_name: string | null;
  phone: string | null;
};

type PilotRow = {
  kind: "Diagnostic" | "Profil" | "Orientation";
  id: string;
  createdAt: string;
  sourceId: string;
  sourceName: string;
  sourceType: string;
  sourceCampaign: string;
  firstName: string;
  phone: string;
  email: string;
  route: string;
  score: number | null;
  status: string;
};

type SourceStat = {
  id: string;
  name: string;
  type: string;
  campaign: string;
  diagnostics: number;
  qualifiedProfiles: number;
  orientations: number;
  contactable: number;
  scoreTotal: number;
  scoreCount: number;
  routes: Record<string, number>;
  statuses: Record<string, number>;
};

const csvEscape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const sourceId = (row: SourceFields) => row.source_location_id || "tofrance";
const sourceLabel = (row: SourceFields) => row.source_name || row.source_location_id || "ToFrance";
const sourceType = (row: SourceFields) => row.source_type || "direct";
const sourceCampaign = (row: SourceFields) => row.source_campaign || "organique";
const isQualified = (score: number | null) => (score ?? 0) >= QUALIFIED_SCORE;
const answerText = (answers: Record<string, unknown> | null, key: string) => String(answers?.[key] || "");

function addCount(target: Record<string, number>, key?: string | null) {
  const label = key?.trim() || "Non défini";
  target[label] = (target[label] || 0) + 1;
}

function mergeSourceOption(rows: SourceFields[]) {
  return Array.from(new Map(rows.map((row) => [sourceId(row), sourceLabel(row)])).entries()).sort((a, b) => a[1].localeCompare(b[1]));
}

export default function AdminPilotes() {
  const { toast } = useToast();
  const [diagnostics, setDiagnostics] = useState<PilotDiagnostic[]>([]);
  const [profiles, setProfiles] = useState<PilotProfile[]>([]);
  const [leads, setLeads] = useState<PilotLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ source: "all", type: "all", campaign: "all", route: "all", status: "all", date: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [diagnosticResult, profileResult, leadResult] = await Promise.all([
        (supabase as any)
          .from("onboarding_results")
          .select("id, created_at, email, language, lead_route, lead_score, statut_lead, first_name, phone, source_location_id, source_name, source_type, source_campaign, answers")
          .order("created_at", { ascending: false })
          .limit(1000),
        (supabase as any)
          .from("profiles")
          .select("id, created_at, email, first_name, full_name, phone, lead_route, lead_score, statut_lead, source_location_id, source_name, source_type, source_campaign")
          .order("created_at", { ascending: false })
          .limit(1000),
        (supabase as any)
          .from("leads")
          .select("id, created_at, status, statut_lead, match_score, first_name, phone, source_location_id, source_name, source_type, source_campaign")
          .order("created_at", { ascending: false })
          .limit(1000),
      ]);

      if (diagnosticResult.error) throw diagnosticResult.error;
      if (profileResult.error) throw profileResult.error;
      if (leadResult.error) throw leadResult.error;

      setDiagnostics((diagnosticResult.data || []) as PilotDiagnostic[]);
      setProfiles((profileResult.data || []) as PilotProfile[]);
      setLeads((leadResult.data || []) as PilotLead[]);
    } catch (error) {
      toast({ variant: "destructive", title: "Chargement impossible", description: error instanceof Error ? error.message : "Erreur inconnue" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const rows = useMemo<PilotRow[]>(() => {
    const diagnosticRows = diagnostics.map((row) => ({
      kind: "Diagnostic" as const,
      id: row.id,
      createdAt: row.created_at,
      sourceId: sourceId(row),
      sourceName: sourceLabel(row),
      sourceType: sourceType(row),
      sourceCampaign: sourceCampaign(row),
      firstName: row.first_name || answerText(row.answers, "contact_firstname"),
      phone: row.phone || answerText(row.answers, "contact_phone"),
      email: row.email || "",
      route: row.lead_route || "",
      score: row.lead_score,
      status: row.statut_lead || "Diagnostic complété",
    }));

    const profileRows = profiles.map((row) => ({
      kind: "Profil" as const,
      id: row.id,
      createdAt: row.created_at,
      sourceId: sourceId(row),
      sourceName: sourceLabel(row),
      sourceType: sourceType(row),
      sourceCampaign: sourceCampaign(row),
      firstName: row.first_name || row.full_name || "",
      phone: row.phone || "",
      email: row.email || "",
      route: row.lead_route || "",
      score: row.lead_score,
      status: row.statut_lead || "Profil créé",
    }));

    const leadRows = leads.map((row) => ({
      kind: "Orientation" as const,
      id: row.id,
      createdAt: row.created_at,
      sourceId: sourceId(row),
      sourceName: sourceLabel(row),
      sourceType: sourceType(row),
      sourceCampaign: sourceCampaign(row),
      firstName: row.first_name || "",
      phone: row.phone || "",
      email: "",
      route: "Orientation partenaire",
      score: row.match_score,
      status: row.statut_lead || row.status || "Orientation créée",
    }));

    return [...diagnosticRows, ...profileRows, ...leadRows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [diagnostics, profiles, leads]);

  const filteredRows = useMemo(() => rows.filter((row) => {
    const matchesSource = filters.source === "all" || row.sourceId === filters.source;
    const matchesType = filters.type === "all" || row.sourceType === filters.type;
    const matchesCampaign = filters.campaign === "all" || row.sourceCampaign === filters.campaign;
    const matchesRoute = filters.route === "all" || row.route === filters.route;
    const matchesStatus = filters.status === "all" || row.status === filters.status;
    const matchesDate = !filters.date || row.createdAt.slice(0, 10) === filters.date;
    return matchesSource && matchesType && matchesCampaign && matchesRoute && matchesStatus && matchesDate;
  }), [rows, filters]);

  const sourceOptions = useMemo(() => mergeSourceOption([...diagnostics, ...profiles, ...leads]), [diagnostics, profiles, leads]);
  const typeOptions = useMemo(() => Array.from(new Set(rows.map((row) => row.sourceType).filter(Boolean))).sort(), [rows]);
  const campaignOptions = useMemo(() => Array.from(new Set(rows.map((row) => row.sourceCampaign).filter(Boolean))).sort(), [rows]);
  const routeOptions = useMemo(() => Array.from(new Set(rows.map((row) => row.route).filter(Boolean))).sort(), [rows]);
  const statusOptions = useMemo(() => Array.from(new Set(rows.map((row) => row.status).filter(Boolean))).sort(), [rows]);

  const stats = useMemo(() => {
    const grouped = new Map<string, SourceStat>();
    for (const row of filteredRows) {
      const stat = grouped.get(row.sourceId) || {
        id: row.sourceId,
        name: row.sourceName,
        type: row.sourceType,
        campaign: row.sourceCampaign,
        diagnostics: 0,
        qualifiedProfiles: 0,
        orientations: 0,
        contactable: 0,
        scoreTotal: 0,
        scoreCount: 0,
        routes: {},
        statuses: {},
      };

      if (row.kind === "Diagnostic") stat.diagnostics += 1;
      if (row.kind === "Profil" && isQualified(row.score)) stat.qualifiedProfiles += 1;
      if (row.kind === "Orientation") stat.orientations += 1;
      if (row.phone) stat.contactable += 1;
      if (typeof row.score === "number") {
        stat.scoreTotal += row.score;
        stat.scoreCount += 1;
      }
      addCount(stat.routes, row.route);
      addCount(stat.statuses, row.status);
      grouped.set(row.sourceId, stat);
    }
    return Array.from(grouped.values()).map((stat) => ({ ...stat, scoreAvg: stat.scoreCount ? Math.round(stat.scoreTotal / stat.scoreCount) : 0 }));
  }, [filteredRows]);

  const totals = useMemo(() => {
    const diagnosticsCount = filteredRows.filter((row) => row.kind === "Diagnostic").length;
    const qualifiedProfiles = filteredRows.filter((row) => row.kind === "Profil" && isQualified(row.score)).length;
    const orientations = filteredRows.filter((row) => row.kind === "Orientation").length;
    const contactable = filteredRows.filter((row) => row.phone).length;
    const scoredRows = filteredRows.filter((row) => typeof row.score === "number");
    const scoreAvg = scoredRows.length ? Math.round(scoredRows.reduce((sum, row) => sum + (row.score || 0), 0) / scoredRows.length) : 0;
    return { diagnosticsCount, qualifiedProfiles, orientations, contactRate: filteredRows.length ? Math.round((contactable / filteredRows.length) * 100) : 0, scoreAvg };
  }, [filteredRows]);

  const exportCsv = () => {
    const headers = ["Type", "Date", "Lieu", "Source ID", "Type source", "Campagne", "Prénom", "Téléphone", "Email", "Orientation", "Score", "Statut", "ID"];
    const csvRows = filteredRows.map((row) => [row.kind, row.createdAt.slice(0, 10), row.sourceName, row.sourceId, row.sourceType, row.sourceCampaign, row.firstName, row.phone, row.email, row.route, row.score ?? "", row.status, row.id]);
    const csv = [headers, ...csvRows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bilan-pilotes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background print:bg-background">
      <SEO title="Admin pilotes — ToFrance" description="Pilotage des diagnostics par lieu ToFrance" path="/admin/pilotes" />
      <Header />
      <main className="container mx-auto px-4 py-24 print:py-6">
        <div className="mb-8 hidden print:block">
          <h1 className="text-2xl font-bold text-foreground">Bilan pilotes ToFrance</h1>
          <p className="text-sm text-muted-foreground">Édité le {new Date().toLocaleDateString("fr-FR")} · {filteredRows.length} ligne{filteredRows.length > 1 ? "s" : ""}</p>
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between print:hidden">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground"><MapPin className="h-8 w-8 text-primary" />Vue pilotes</h1>
            <p className="mt-1 text-muted-foreground">Diagnostics, profils qualifiés, orientations et statuts par lieu source.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild><Link to="/admin">Admin</Link></Button>
            <Button variant="outline" onClick={fetchData} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4" />Actualiser</Button>
            <Button variant="outline" onClick={() => window.print()} disabled={!filteredRows.length}><Printer className="mr-2 h-4 w-4" />Bilan imprimable</Button>
            <Button onClick={exportCsv} disabled={!filteredRows.length}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6 print:hidden">
          <Select value={filters.source} onValueChange={(source) => setFilters((current) => ({ ...current, source }))}>
            <SelectTrigger><SelectValue placeholder="Lieu source" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tous les lieux</SelectItem>{sourceOptions.map(([id, label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.type} onValueChange={(type) => setFilters((current) => ({ ...current, type }))}>
            <SelectTrigger><SelectValue placeholder="Type source" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tous les types</SelectItem>{typeOptions.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.campaign} onValueChange={(campaign) => setFilters((current) => ({ ...current, campaign }))}>
            <SelectTrigger><SelectValue placeholder="Campagne" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Toutes campagnes</SelectItem>{campaignOptions.map((campaign) => <SelectItem key={campaign} value={campaign}>{campaign}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.route} onValueChange={(route) => setFilters((current) => ({ ...current, route }))}>
            <SelectTrigger><SelectValue placeholder="Orientation" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Toutes orientations</SelectItem>{routeOptions.map((route) => <SelectItem key={route} value={route}>{route}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(status) => setFilters((current) => ({ ...current, status }))}>
            <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tous les statuts</SelectItem>{statusOptions.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} />
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" />Diagnostics</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{totals.diagnosticsCount}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Target className="h-4 w-4" />Profils qualifiés</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{totals.qualifiedProfiles}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Route className="h-4 w-4" />Orientations</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{totals.orientations}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><PhoneCall className="h-4 w-4" />Contactables</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{totals.contactRate}%</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Score moyen</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{totals.scoreAvg}/100</CardContent></Card>
        </section>

        <Card className="mb-6">
          <CardHeader><CardTitle>Indicateurs par lieu/source</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Lieu</TableHead><TableHead>Diagnostics</TableHead><TableHead>Profils qualifiés</TableHead><TableHead>Orientations</TableHead><TableHead>Score moyen</TableHead><TableHead>Statuts</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></TableCell></TableRow>
                  ) : stats.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Aucune donnée pilote trouvée</TableCell></TableRow>
                  ) : stats.map((stat) => (
                    <TableRow key={stat.id}>
                      <TableCell className="font-medium"><div>{stat.name}</div><div className="text-xs text-muted-foreground">{stat.type} · {stat.campaign}</div></TableCell>
                      <TableCell>{stat.diagnostics}</TableCell>
                      <TableCell>{stat.qualifiedProfiles}</TableCell>
                      <TableCell>{stat.orientations}</TableCell>
                      <TableCell>{stat.scoreAvg}/100</TableCell>
                      <TableCell><div className="flex max-w-xl flex-wrap gap-1">{Object.entries(stat.statuses).map(([status, count]) => <Badge key={status} variant="secondary">{status}: {count}</Badge>)}</div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Détail exportable</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead>Lieu</TableHead><TableHead>Prénom</TableHead><TableHead>Téléphone</TableHead><TableHead>Orientation</TableHead><TableHead>Score</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8} className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></TableCell></TableRow>
                  ) : filteredRows.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">Aucune ligne ne correspond aux filtres</TableCell></TableRow>
                  ) : filteredRows.map((row) => (
                    <TableRow key={`${row.kind}-${row.id}`}>
                      <TableCell><Badge variant="outline">{row.kind}</Badge></TableCell>
                      <TableCell>{new Date(row.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>{row.sourceName}</TableCell>
                      <TableCell>{row.firstName || "—"}</TableCell>
                      <TableCell>{row.phone || "—"}</TableCell>
                      <TableCell>{row.route || "—"}</TableCell>
                      <TableCell><Badge variant={isQualified(row.score) ? "default" : "outline"}>{row.score ?? 0}/100</Badge></TableCell>
                      <TableCell>{row.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

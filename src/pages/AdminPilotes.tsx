import { useEffect, useMemo, useState } from "react";
import { Download, Printer, RefreshCcw, Users, MapPin, Target, PhoneCall, ClipboardCheck } from "lucide-react";
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

type PilotDiagnostic = {
  id: string;
  created_at: string;
  email: string | null;
  language: string;
  lead_route: string | null;
  lead_score: number | null;
  source_location_id: string | null;
  source_name: string | null;
  source_type: string | null;
  source_campaign: string | null;
  answers: Record<string, unknown>;
};

type PilotLead = {
  id: string;
  status: string;
  match_score: number | null;
  source_location_id: string | null;
  created_at: string;
};

const csvEscape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const sourceLabel = (row: PilotDiagnostic) => row.source_name || row.source_location_id || "ToFrance";
const sourceId = (row: PilotDiagnostic) => row.source_location_id || "tofrance";
const isQualified = (score: number | null) => (score ?? 0) >= 70;

export default function AdminPilotes() {
  const { toast } = useToast();
  const [diagnostics, setDiagnostics] = useState<PilotDiagnostic[]>([]);
  const [leads, setLeads] = useState<PilotLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ source: "all", campaign: "all", route: "all", date: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: diagnosticRows, error: diagnosticsError }, { data: leadRows, error: leadsError }] = await Promise.all([
        (supabase as any).from("onboarding_results").select("id, created_at, email, language, lead_route, lead_score, source_location_id, source_name, source_type, source_campaign, answers").order("created_at", { ascending: false }).limit(1000),
        (supabase as any).from("leads").select("id, status, match_score, source_location_id, created_at").order("created_at", { ascending: false }).limit(1000),
      ]);
      if (diagnosticsError) throw diagnosticsError;
      if (leadsError) throw leadsError;
      setDiagnostics((diagnosticRows || []) as PilotDiagnostic[]);
      setLeads((leadRows || []) as PilotLead[]);
    } catch (error) {
      toast({ variant: "destructive", title: "Chargement impossible", description: error instanceof Error ? error.message : "Erreur inconnue" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDiagnostics = useMemo(() => diagnostics.filter((row) => {
    const matchesSource = filters.source === "all" || sourceId(row) === filters.source;
    const matchesCampaign = filters.campaign === "all" || (row.source_campaign || "") === filters.campaign;
    const matchesRoute = filters.route === "all" || (row.lead_route || "") === filters.route;
    const matchesDate = !filters.date || row.created_at.slice(0, 10) === filters.date;
    return matchesSource && matchesCampaign && matchesRoute && matchesDate;
  }), [diagnostics, filters]);

  const sourceOptions = useMemo(() => Array.from(new Map(diagnostics.map((row) => [sourceId(row), sourceLabel(row)])).entries()), [diagnostics]);
  const campaignOptions = useMemo(() => Array.from(new Set(diagnostics.map((row) => row.source_campaign).filter(Boolean))) as string[], [diagnostics]);
  const routeOptions = useMemo(() => Array.from(new Set(diagnostics.map((row) => row.lead_route).filter(Boolean))) as string[], [diagnostics]);

  const sourceStats = useMemo(() => {
    const grouped = new Map<string, { name: string; diagnostics: number; qualified: number; phone: number; scoreTotal: number; orientations: Record<string, number>; statuses: Record<string, number> }>();
    for (const row of filteredDiagnostics) {
      const id = sourceId(row);
      const stat = grouped.get(id) || { name: sourceLabel(row), diagnostics: 0, qualified: 0, phone: 0, scoreTotal: 0, orientations: {}, statuses: {} };
      stat.diagnostics += 1;
      stat.qualified += isQualified(row.lead_score) ? 1 : 0;
      stat.phone += row.answers?.contact_phone ? 1 : 0;
      stat.scoreTotal += row.lead_score || 0;
      const route = row.lead_route || "Non défini";
      stat.orientations[route] = (stat.orientations[route] || 0) + 1;
      const relatedStatuses = leads.filter((lead) => (lead.source_location_id || "tofrance") === id).map((lead) => lead.status);
      for (const status of relatedStatuses.length ? relatedStatuses : ["diagnostic"]) stat.statuses[status] = (stat.statuses[status] || 0) + 1;
      grouped.set(id, stat);
    }
    return Array.from(grouped.entries()).map(([id, stat]) => ({ id, ...stat, scoreAvg: stat.diagnostics ? Math.round(stat.scoreTotal / stat.diagnostics) : 0 }));
  }, [filteredDiagnostics, leads]);

  const totals = useMemo(() => {
    const diagnosticsCount = filteredDiagnostics.length;
    const qualified = filteredDiagnostics.filter((row) => isQualified(row.lead_score)).length;
    const phone = filteredDiagnostics.filter((row) => row.answers?.contact_phone).length;
    const orientations = new Set(filteredDiagnostics.map((row) => row.lead_route).filter(Boolean)).size;
    const scoreAvg = diagnosticsCount ? Math.round(filteredDiagnostics.reduce((sum, row) => sum + (row.lead_score || 0), 0) / diagnosticsCount) : 0;
    return { diagnosticsCount, qualified, phoneRate: diagnosticsCount ? Math.round((phone / diagnosticsCount) * 100) : 0, orientations, scoreAvg };
  }, [filteredDiagnostics]);

  const exportCsv = () => {
    const headers = ["Date", "Lieu", "Campagne", "Type", "Prénom", "Téléphone", "Email", "Route", "Score", "Langue"];
    const rows = filteredDiagnostics.map((row) => [row.created_at.slice(0, 10), sourceLabel(row), row.source_campaign, row.source_type, row.answers?.contact_firstname, row.answers?.contact_phone, row.email, row.lead_route, row.lead_score, row.language]);
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
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
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between print:hidden">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground"><MapPin className="h-8 w-8 text-primary" />Vue pilotes</h1>
            <p className="mt-1 text-muted-foreground">Diagnostics, orientations et statuts par lieu source.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild><Link to="/admin">Admin</Link></Button>
            <Button variant="outline" onClick={fetchData} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4" />Actualiser</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Bilan imprimable</Button>
            <Button onClick={exportCsv} disabled={!filteredDiagnostics.length}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-4 print:hidden">
          <Select value={filters.source} onValueChange={(source) => setFilters((current) => ({ ...current, source }))}>
            <SelectTrigger><SelectValue placeholder="Lieu source" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tous les lieux</SelectItem>{sourceOptions.map(([id, label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.campaign} onValueChange={(campaign) => setFilters((current) => ({ ...current, campaign }))}>
            <SelectTrigger><SelectValue placeholder="Campagne" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Toutes campagnes</SelectItem>{campaignOptions.map((campaign) => <SelectItem key={campaign} value={campaign}>{campaign}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.route} onValueChange={(route) => setFilters((current) => ({ ...current, route }))}>
            <SelectTrigger><SelectValue placeholder="Orientation" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Toutes orientations</SelectItem>{routeOptions.map((route) => <SelectItem key={route} value={route}>{route}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} />
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><ClipboardCheck className="h-4 w-4" />Diagnostics</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{totals.diagnosticsCount}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Target className="h-4 w-4" />Qualifiés</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{totals.qualified}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><PhoneCall className="h-4 w-4" />Contactables</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{totals.phoneRate}%</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" />Orientations</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{totals.orientations}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Score moyen</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{totals.scoreAvg}/100</CardContent></Card>
        </section>

        <Card className="mb-6">
          <CardHeader><CardTitle>Diagnostics par lieu</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Lieu</TableHead><TableHead>Diagnostics</TableHead><TableHead>Qualifiés</TableHead><TableHead>Score moyen</TableHead><TableHead>Orientations</TableHead><TableHead>Statuts</TableHead></TableRow></TableHeader>
              <TableBody>{sourceStats.map((stat) => <TableRow key={stat.id}><TableCell className="font-medium">{stat.name}</TableCell><TableCell>{stat.diagnostics}</TableCell><TableCell>{stat.qualified}</TableCell><TableCell>{stat.scoreAvg}/100</TableCell><TableCell className="space-x-1">{Object.entries(stat.orientations).map(([route, count]) => <Badge key={route} variant="outline">{route}: {count}</Badge>)}</TableCell><TableCell className="space-x-1">{Object.entries(stat.statuses).map(([status, count]) => <Badge key={status} variant="secondary">{status}: {count}</Badge>)}</TableCell></TableRow>)}</TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Détail des diagnostics</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Prénom</TableHead><TableHead>Téléphone</TableHead><TableHead>Lieu</TableHead><TableHead>Orientation</TableHead><TableHead>Score</TableHead><TableHead>Langue</TableHead></TableRow></TableHeader>
              <TableBody>{filteredDiagnostics.map((row) => <TableRow key={row.id}><TableCell>{new Date(row.created_at).toLocaleDateString("fr-FR")}</TableCell><TableCell>{String(row.answers?.contact_firstname || "—")}</TableCell><TableCell>{String(row.answers?.contact_phone || "—")}</TableCell><TableCell>{sourceLabel(row)}</TableCell><TableCell>{row.lead_route || "—"}</TableCell><TableCell><Badge variant={isQualified(row.lead_score) ? "default" : "outline"}>{row.lead_score ?? 0}/100</Badge></TableCell><TableCell>{row.language}</TableCell></TableRow>)}</TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

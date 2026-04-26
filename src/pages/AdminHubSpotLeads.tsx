import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, ExternalLink, Eye, Loader2, RefreshCcw, Search, UserPlus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface HubSpotLead {
  id: string;
  dealId: string | null;
  hubspotUrl: string;
  firstname: string;
  phone: string;
  email: string;
  source_location: string;
  source_slug: string;
  route_orientation: string;
  statut_lead: string;
  score_qualification: number | null;
  date_diagnostic: string;
  diagnostic_id: string;
  langue_diagnostic: string;
  niveau_francais: string;
  besoin_principal: string;
  secteur_metier: string;
  freins_identifies: string;
  disponibilite: string;
  mobilite: string;
}

interface HubSpotOwner {
  id: string;
  name: string;
  email: string;
}

const LEAD_STATUSES = [
  "Nouveau diagnostic",
  "À rappeler",
  "Contacté",
  "Orienté",
  "RDV fixé",
  "En suivi",
  "Converti",
  "Non qualifié",
  "Injoignable",
  "Perdu",
];

const csvEscape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function uniqueValues(leads: HubSpotLead[], key: keyof HubSpotLead) {
  return Array.from(new Set(leads.map((lead) => String(lead[key] || "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export default function AdminHubSpotLeads() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<HubSpotLead[]>([]);
  const [owners, setOwners] = useState<HubSpotOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [taskOpen, setTaskOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<HubSpotLead | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [filters, setFilters] = useState({ source: "all", route: "all", status: "all", date: "" });
  const [search, setSearch] = useState("");
  const [taskForm, setTaskForm] = useState({ title: "", description: "", dueDate: "", ownerId: "none" });

  const invokeHubSpot = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("admin-hubspot-leads", { body });
    if (error) throw error;
    if (data?.error) throw new Error(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
    return data;
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await invokeHubSpot({ action: "list" });
      setLeads(data.contacts || []);
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur HubSpot", description: error instanceof Error ? error.message : "Chargement impossible" });
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const data = await invokeHubSpot({ action: "owners" });
      setOwners(data.owners || []);
    } catch (error) {
      toast({ variant: "destructive", title: "Utilisateurs HubSpot", description: error instanceof Error ? error.message : "Liste indisponible" });
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchOwners();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSource = filters.source === "all" || lead.source_location === filters.source;
      const matchesRoute = filters.route === "all" || lead.route_orientation === filters.route;
      const matchesStatus = filters.status === "all" || lead.statut_lead === filters.status;
      const matchesDate = !filters.date || lead.date_diagnostic === filters.date;
      const haystack = [lead.firstname, lead.phone, lead.email, lead.source_location, lead.route_orientation, lead.diagnostic_id].join(" ").toLowerCase();
      return matchesSource && matchesRoute && matchesStatus && matchesDate && haystack.includes(search.toLowerCase());
    });
  }, [leads, filters, search]);

  const sourceOptions = useMemo(() => uniqueValues(leads, "source_location"), [leads]);
  const routeOptions = useMemo(() => uniqueValues(leads, "route_orientation"), [leads]);

  const handleStatusChange = async (lead: HubSpotLead, status: string) => {
    setUpdatingId(lead.id);
    try {
      const data = await invokeHubSpot({ action: "updateStatus", contactId: lead.id, dealId: lead.dealId, status });
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, statut_lead: status } : item));
      toast({ title: data.warning || "Statut HubSpot mis à jour" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur de mise à jour", description: error instanceof Error ? error.message : "Action impossible" });
    } finally {
      setUpdatingId(null);
    }
  };

  const openTask = (lead: HubSpotLead) => {
    setSelectedLead(lead);
    setTaskForm({ title: `Relancer ${lead.firstname || "le bénéficiaire"}`, description: "", dueDate: "", ownerId: "none" });
    setTaskOpen(true);
  };

  const openDetails = (lead: HubSpotLead) => {
    setSelectedLead(lead);
    setDetailsOpen(true);
  };

  const handleCreateTask = async () => {
    if (!selectedLead || !taskForm.title || !taskForm.dueDate) {
      toast({ variant: "destructive", title: "Titre et date requis" });
      return;
    }
    setCreatingTask(true);
    try {
      await invokeHubSpot({
        action: "createTask",
        contactId: selectedLead.id,
        title: taskForm.title,
        description: taskForm.description,
        dueDate: taskForm.dueDate,
        ownerId: taskForm.ownerId === "none" ? null : taskForm.ownerId,
      });
      toast({ title: "Tâche HubSpot créée" });
      setTaskOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Création impossible", description: error instanceof Error ? error.message : "Erreur HubSpot" });
    } finally {
      setCreatingTask(false);
    }
  };

  const exportCsv = () => {
    const headers = ["Prénom", "Téléphone", "Email", "Lieu source", "Route orientation", "Statut lead", "Score qualification", "Date diagnostic", "Diagnostic ID"];
    const rows = filteredLeads.map((lead) => [lead.firstname, lead.phone, lead.email, lead.source_location, lead.route_orientation, lead.statut_lead, lead.score_qualification ?? "", lead.date_diagnostic, lead.diagnostic_id]);
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-hubspot-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Admin leads HubSpot — ToFrance" description="Gestion des leads HubSpot ToFrance" path="/admin/leads" />
      <Header />

      <main className="container mx-auto px-4 py-24">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
              <Users className="h-8 w-8 text-primary" />
              Leads HubSpot
            </h1>
            <p className="mt-1 text-muted-foreground">{filteredLeads.length} lead{filteredLeads.length > 1 ? "s" : ""} affiché{filteredLeads.length > 1 ? "s" : ""}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin">Admin</Link>
            </Button>
            <Button variant="outline" onClick={fetchLeads} disabled={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
            <Button onClick={exportCsv} disabled={filteredLeads.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <CardTitle>Contacts synchronisés</CardTitle>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher" className="pl-10" />
              </div>
              <Select value={filters.source} onValueChange={(source) => setFilters((current) => ({ ...current, source }))}>
                <SelectTrigger><SelectValue placeholder="Source location" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sources</SelectItem>
                  {sourceOptions.map((source) => <SelectItem key={source} value={source}>{source}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.route} onValueChange={(route) => setFilters((current) => ({ ...current, route }))}>
                <SelectTrigger><SelectValue placeholder="Route orientation" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les routes</SelectItem>
                  {routeOptions.map((route) => <SelectItem key={route} value={route}>{route}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={(status) => setFilters((current) => ({ ...current, status }))}>
                <SelectTrigger><SelectValue placeholder="Statut lead" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {LEAD_STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prénom</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Lieu source</TableHead>
                  <TableHead>Route orientation</TableHead>
                  <TableHead>Statut lead</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></TableCell></TableRow>
                ) : filteredLeads.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Aucun lead HubSpot trouvé</TableCell></TableRow>
                ) : filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.firstname || "—"}</TableCell>
                    <TableCell>{lead.phone || "—"}</TableCell>
                    <TableCell>{lead.source_location || "—"}</TableCell>
                    <TableCell>{lead.route_orientation || "—"}</TableCell>
                    <TableCell>
                      <Select value={lead.statut_lead || "Nouveau diagnostic"} onValueChange={(value) => handleStatusChange(lead, value)} disabled={updatingId === lead.id}>
                        <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{LEAD_STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {lead.score_qualification == null ? "—" : <Badge variant={lead.score_qualification >= 70 ? "default" : "secondary"}>{lead.score_qualification}/100</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDetails(lead)} aria-label="Voir fiche complète"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openTask(lead)} aria-label="Créer tâche"><UserPlus className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" asChild aria-label="Voir dans HubSpot"><a href={lead.hubspotUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Fiche complète</DialogTitle></DialogHeader>
          {selectedLead && (
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {Object.entries({
                Prénom: selectedLead.firstname,
                Téléphone: selectedLead.phone,
                Email: selectedLead.email,
                "Lieu source": selectedLead.source_location,
                "Slug source": selectedLead.source_slug,
                "Route orientation": selectedLead.route_orientation,
                "Statut lead": selectedLead.statut_lead,
                "Score qualification": selectedLead.score_qualification ?? "—",
                "Date diagnostic": selectedLead.date_diagnostic,
                "Diagnostic ID": selectedLead.diagnostic_id,
                Langue: selectedLead.langue_diagnostic,
                "Niveau français": selectedLead.niveau_francais,
                "Besoin principal": selectedLead.besoin_principal,
                Secteur: selectedLead.secteur_metier,
                Freins: selectedLead.freins_identifies,
                Disponibilité: selectedLead.disponibilite,
                Mobilité: selectedLead.mobilite,
              }).map(([label, value]) => (
                <div key={label} className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="mt-1 break-words font-medium">{String(value || "—")}</div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Créer une tâche HubSpot</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Titre tâche</Label><Input value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={taskForm.description} onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))} /></div>
            <div className="space-y-2"><Label>Date échéance</Label><Input type="datetime-local" value={taskForm.dueDate} onChange={(event) => setTaskForm((current) => ({ ...current, dueDate: event.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Assigné à</Label>
              <Select value={taskForm.ownerId} onValueChange={(ownerId) => setTaskForm((current) => ({ ...current, ownerId }))}>
                <SelectTrigger><SelectValue placeholder="Choisir un utilisateur" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Non assigné</SelectItem>
                  {owners.map((owner) => <SelectItem key={owner.id} value={owner.id}>{owner.name}{owner.email ? ` — ${owner.email}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleCreateTask} disabled={creatingTask}>
              {creatingTask && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer tâche
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

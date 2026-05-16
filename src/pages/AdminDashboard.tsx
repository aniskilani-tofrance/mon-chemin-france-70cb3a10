import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Plus, Pencil, Building2, Users, Search, Mail, ExternalLink,
  CreditCard, MoreHorizontal, Globe, MapPin, CheckCircle2, XCircle,
  Briefcase, GraduationCap, Phone, BarChart3, Filter, TrendingUp, Sparkles,
  Home, KeyRound, ShieldCheck, Tag, X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { AdminContactRequests } from "@/components/AdminContactRequests";
import { AdminLeadsManager } from "@/components/AdminLeadsManager";
import { AdminAnalytics } from "@/components/AdminAnalytics";
import { AdminCheckpointAnalytics } from "@/components/AdminCheckpointAnalytics";
import { AdminPlacementTestAnalytics } from "@/components/AdminPlacementTestAnalytics";
import { AdminMarianneCodes } from "@/components/AdminMarianneCodes";
import { AdminHubSpotSyncLogs } from "@/components/AdminHubSpotSyncLogs";

type ProviderType = "employer" | "training_org" | "housing";

interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  website: string | null;
  description: string | null;
  provider_type: ProviderType;
  is_active: boolean | null;
  city: string | null;
  postal_code: string | null;
  address: string | null;
  user_id: string | null;
  tags: string[] | null;
  created_at: string;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  website: "",
  description: "",
  provider_type: "training_org" as ProviderType,
  city: "",
  postal_code: "",
  address: "",
  is_active: true,
  create_access: false,
  tags: [] as string[],
};

const PROVIDER_TYPE_META: Record<ProviderType, { label: string; short: string }> = {
  training_org: { label: "Organisme de formation", short: "Formation" },
  employer: { label: "Employeur", short: "Employeur" },
  housing: { label: "Hébergeur", short: "Hébergeur" },
};

const QUICK_LINKS = [
  { to: "/admin/subscriptions", label: "Abonnements", icon: CreditCard },
  { to: "/admin/leads", label: "Leads HubSpot", icon: ExternalLink },
  { to: "/admin/pilotes", label: "Vue pilotes", icon: BarChart3 },
  { to: "/admin/fle", label: "Suivi FLE", icon: Users },
  { to: "/admin/email-preview", label: "Aperçu emails", icon: Mail },
  { to: "/admin/email-logs", label: "Envois emails", icon: Mail },
];

export default function AdminDashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ProviderType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const { toast } = useToast();

  const fetchProviders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("training_providers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      setProviders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Provider) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      email: p.email,
      phone: p.phone || "",
      website: p.website || "",
      description: p.description || "",
      provider_type: p.provider_type,
      city: p.city || "",
      postal_code: p.postal_code || "",
      address: p.address || "",
      is_active: p.is_active ?? true,
      create_access: false,
      tags: p.tags ?? [],
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast({ variant: "destructive", title: "Erreur", description: "Nom et email requis" });
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("training_providers")
          .update({
            name: form.name,
            email: form.email,
            phone: form.phone || null,
            website: form.website || null,
            description: form.description || null,
            provider_type: form.provider_type,
            city: form.city || null,
            postal_code: form.postal_code || null,
            address: form.address || null,
            is_active: form.is_active,
            tags: form.tags,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Partenaire modifié" });
      } else {
        const { data, error } = await supabase.functions.invoke("admin-create-partner", {
          body: {
            name: form.name,
            email: form.email,
            phone: form.phone || null,
            website: form.website || null,
            description: form.description || null,
            provider_type: form.provider_type,
            city: form.city || null,
            postal_code: form.postal_code || null,
            address: form.address || null,
            is_active: form.is_active,
            create_access: form.create_access,
            tags: form.tags,
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        const inviteMsg =
          data?.invite_status === "sent" ? " — invitation envoyée par email"
          : data?.invite_status === "existing" ? " — compte existant rattaché"
          : data?.invite_status === "failed" ? " — partenaire créé mais invitation échouée"
          : "";
        toast({ title: "Partenaire créé" + inviteMsg });
      }

      setDialogOpen(false);
      fetchProviders();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean | null) => {
    const { error } = await supabase
      .from("training_providers")
      .update({ is_active: !currentActive })
      .eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      fetchProviders();
    }
  };

  const handleSendAccess = async (p: Provider) => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-partner", {
        body: {
          // re-use the existing partner: we pass create_access only, the function will invite by email
          // but since this would create a duplicate, instead we just call auth invite directly via a tiny RPC pattern:
          name: p.name, email: p.email, provider_type: p.provider_type, is_active: p.is_active,
          create_access: true, _existing_provider_id: p.id,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Invitation envoyée", description: `Un email d'accès a été envoyé à ${p.email}.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erreur", description: e.message });
    }
  };
  const stats = useMemo(() => {
    const total = providers.length;
    const active = providers.filter((p) => p.is_active).length;
    const employers = providers.filter((p) => p.provider_type === "employer").length;
    const trainingOrgs = providers.filter((p) => p.provider_type === "training_org").length;
    const housing = providers.filter((p) => p.provider_type === "housing").length;
    const withAccess = providers.filter((p) => !!p.user_id).length;
    return { total, active, inactive: total - active, employers, trainingOrgs, housing, withAccess };
  }, [providers]);

  const filteredProviders = useMemo(() => {
    const q = search.toLowerCase();
    return providers.filter((p) => {
      if (typeFilter !== "all" && p.provider_type !== typeFilter) return false;
      if (statusFilter === "active" && !p.is_active) return false;
      if (statusFilter === "inactive" && p.is_active) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.city || "").toLowerCase().includes(q)
      );
    });
  }, [providers, search, typeFilter, statusFilter]);

  const initials = (name: string) =>
    name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Admin — Gestion des partenaires" description="Back-office ToFrance" path="/admin" />
      <Header />

      <main className="container mx-auto px-4 py-24">
        {/* Hero header */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Back-office ToFrance
              </div>
              <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Building2 className="h-6 w-6" />
                </span>
                Partenaires & écosystème
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground">
                Pilotez les organismes de formation, employeurs et outils administratifs depuis un espace unifié.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-background/70 backdrop-blur">
                    <ExternalLink className="h-4 w-4" /> Outils admin
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Espaces admin</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
                    <DropdownMenuItem key={to} asChild>
                      <Link to={to} className="cursor-pointer">
                        <Icon className="mr-2 h-4 w-4" /> {label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreate} size="sm" className="gap-2 shadow-sm">
                    <Plus className="h-4 w-4" /> Ajouter un partenaire
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Modifier le partenaire" : "Nouveau partenaire"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Type de structure</Label>
                      <Select value={form.provider_type} onValueChange={(v) => setForm({ ...form, provider_type: v as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="training_org">Organisme de formation</SelectItem>
                          <SelectItem value="employer">Employeur</SelectItem>
                          <SelectItem value="housing">Hébergeur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nom *</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom de l'organisme" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@organisme.fr" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Téléphone</Label>
                        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01 23 45 67 89" />
                      </div>
                      <div className="space-y-2">
                        <Label>Site web</Label>
                        <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Adresse</Label>
                      <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 rue..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ville</Label>
                        <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Paris" />
                      </div>
                      <div className="space-y-2">
                        <Label>Code postal</Label>
                        <Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} placeholder="75001" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Description de l'activité..." />
                    </div>
                    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <Label className="text-sm font-medium">Structure active</Label>
                          <p className="text-xs text-muted-foreground">Visible dans les annuaires et matching</p>
                        </div>
                        <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                      </div>
                      {!editingId && (
                        <div className="flex items-center justify-between gap-2 border-t pt-3">
                          <div className="flex items-start gap-2">
                            <KeyRound className="mt-0.5 h-4 w-4 text-primary" />
                            <div>
                              <Label className="text-sm font-medium">Créer un accès partenaire</Label>
                              <p className="text-xs text-muted-foreground">Envoie un email d'invitation pour activer le compte</p>
                            </div>
                          </div>
                          <Switch checked={form.create_access} onCheckedChange={(v) => setForm({ ...form, create_access: v })} />
                        </div>
                      )}
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="w-full">
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingId ? "Enregistrer" : "Créer le partenaire"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* KPI cards (cliquables pour filtrer) */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <KpiCard
            label="Partenaires"
            value={stats.total}
            icon={Building2}
            tone="primary"
            hint="total répertoriés"
            active={typeFilter === "all" && statusFilter === "all"}
            onClick={() => { setTypeFilter("all"); setStatusFilter("all"); }}
          />
          <KpiCard
            label="Actifs"
            value={stats.active}
            icon={CheckCircle2}
            tone="success"
            hint={stats.total ? `${Math.round((stats.active / stats.total) * 100)}% du réseau` : "—"}
            active={statusFilter === "active"}
            onClick={() => setStatusFilter(statusFilter === "active" ? "all" : "active")}
          />
          <KpiCard
            label="Organismes"
            value={stats.trainingOrgs}
            icon={GraduationCap}
            tone="muted"
            hint="formation"
            active={typeFilter === "training_org"}
            onClick={() => setTypeFilter(typeFilter === "training_org" ? "all" : "training_org")}
          />
          <KpiCard
            label="Employeurs"
            value={stats.employers}
            icon={Briefcase}
            tone="muted"
            hint="recruteurs"
            active={typeFilter === "employer"}
            onClick={() => setTypeFilter(typeFilter === "employer" ? "all" : "employer")}
          />
          <KpiCard
            label="Hébergeurs"
            value={stats.housing}
            icon={Home}
            tone="muted"
            hint="logement / accueil"
            active={typeFilter === "housing"}
            onClick={() => setTypeFilter(typeFilter === "housing" ? "all" : "housing")}
          />
        </div>

        {/* Partners table */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-md">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Users className="h-4 w-4 text-primary" />
                Liste des partenaires
                <Badge variant="outline" className="ml-1 font-mono text-[11px]">
                  {filteredProviders.length}/{providers.length}
                </Badge>
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher nom, email, ville…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-64 pl-9"
                  />
                </div>
                <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                  <TabsList className="h-9">
                    <TabsTrigger value="all" className="text-xs">Tous</TabsTrigger>
                    <TabsTrigger value="training_org" className="text-xs">Formation</TabsTrigger>
                    <TabsTrigger value="employer" className="text-xs">Employeurs</TabsTrigger>
                    <TabsTrigger value="housing" className="text-xs">Hébergeurs</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger className="h-9 w-[140px]">
                    <Filter className="mr-1 h-3.5 w-3.5" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="inactive">Inactifs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-2 p-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border/40 p-3">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Partenaire</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[60px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProviders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-20 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-muted-foreground">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                            <Building2 className="h-7 w-7 opacity-50" />
                          </div>
                          <p className="font-semibold text-foreground">Aucun partenaire trouvé</p>
                          <p className="text-xs">
                            {providers.length === 0
                              ? "Commencez par ajouter votre premier partenaire pour structurer votre réseau."
                              : "Essayez d'ajuster vos filtres ou la recherche pour élargir les résultats."}
                          </p>
                          {providers.length === 0 && (
                            <Button size="sm" onClick={openCreate} className="mt-2 gap-2">
                              <Plus className="h-4 w-4" /> Ajouter un partenaire
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProviders.map((p) => (
                      <TableRow key={p.id} className="group transition-colors hover:bg-primary/[0.03]">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary/15 to-primary/5 text-xs font-semibold text-primary ring-1 ring-primary/10">
                              {initials(p.name) || <Building2 className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-medium">{p.name}</div>
                              {p.description && (
                                <div className="truncate text-xs text-muted-foreground max-w-[260px]">
                                  {p.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={p.provider_type === "training_org" ? "default" : "secondary"}
                            className="gap-1"
                          >
                            {p.provider_type === "employer" && <><Briefcase className="h-3 w-3" /> Employeur</>}
                            {p.provider_type === "training_org" && <><GraduationCap className="h-3 w-3" /> Formation</>}
                            {p.provider_type === "housing" && <><Home className="h-3 w-3" /> Hébergeur</>}
                          </Badge>
                          {p.user_id ? (
                            <Badge variant="outline" className="ml-1 gap-1 border-success/30 bg-success/10 text-success text-[10px]">
                              <ShieldCheck className="h-2.5 w-2.5" /> accès
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{p.email}</div>
                          {p.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" /> {p.phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {p.city ? (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              {p.city}
                              {p.postal_code && <span className="text-muted-foreground">· {p.postal_code}</span>}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {p.is_active ? (
                            <Badge variant="outline" className="gap-1 border-success/30 bg-success/10 text-success">
                              <CheckCircle2 className="h-3 w-3" /> Actif
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-muted-foreground">
                              <XCircle className="h-3 w-3" /> Inactif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(p)}>
                                <Pencil className="mr-2 h-4 w-4" /> Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(p.id, p.is_active)}>
                                {p.is_active ? (
                                  <><XCircle className="mr-2 h-4 w-4" /> Désactiver</>
                                ) : (
                                  <><CheckCircle2 className="mr-2 h-4 w-4" /> Activer</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendAccess(p)}>
                                <KeyRound className="mr-2 h-4 w-4" />
                                {p.user_id ? "Renvoyer l'accès" : "Créer un accès"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild disabled={!p.website}>
                                <a href={p.website || "#"} target="_blank" rel="noreferrer">
                                  <Globe className="mr-2 h-4 w-4" /> Site web
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href={`mailto:${p.email}`}>
                                  <Mail className="mr-2 h-4 w-4" /> Envoyer un email
                                </a>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Secondary sections grouped by tabs */}
        <div className="mt-10">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">Pilotage & analytics</h2>
            <span className="text-xs text-muted-foreground">— Données plateforme et synchronisations</span>
          </div>
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
              <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
              <TabsTrigger value="placement" className="text-xs">Test positionnement</TabsTrigger>
              <TabsTrigger value="checkpoint" className="text-xs">Checkpoints</TabsTrigger>
              <TabsTrigger value="leads" className="text-xs">Leads</TabsTrigger>
              <TabsTrigger value="contacts" className="text-xs">Contacts</TabsTrigger>
              <TabsTrigger value="codes" className="text-xs">Codes Marianne</TabsTrigger>
              <TabsTrigger value="hubspot" className="text-xs">HubSpot sync</TabsTrigger>
            </TabsList>
            <TabsContent value="analytics" className="mt-4"><AdminAnalytics /></TabsContent>
            <TabsContent value="placement" className="mt-4"><AdminPlacementTestAnalytics /></TabsContent>
            <TabsContent value="checkpoint" className="mt-4"><AdminCheckpointAnalytics /></TabsContent>
            <TabsContent value="leads" className="mt-4"><AdminLeadsManager /></TabsContent>
            <TabsContent value="contacts" className="mt-4"><AdminContactRequests /></TabsContent>
            <TabsContent value="codes" className="mt-4"><AdminMarianneCodes /></TabsContent>
            <TabsContent value="hubspot" className="mt-4"><AdminHubSpotSyncLogs /></TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function KpiCard({
  label, value, icon: Icon, tone, hint, active, onClick,
}: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tone: "primary" | "success" | "muted"; hint?: string; active?: boolean; onClick?: () => void }) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  const interactive = !!onClick;
  return (
    <Card
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(); } } : undefined}
      className={`group relative overflow-hidden transition-all ${interactive ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" : ""} ${active ? "ring-2 ring-primary shadow-md" : ""}`}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses} transition-transform group-hover:scale-105`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-bold leading-none tracking-tight">{value}</div>
          <div className="mt-1 text-xs font-medium text-foreground">{label}</div>
          {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CreditCard,
  Euro,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Product = "marianne" | "placement_test" | "shared_diagnostic";
type Status =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

interface Subscription {
  id: string;
  user_id: string;
  email: string | null;
  product: Product;
  status: Status;
  amount_cents: number;
  currency: string;
  interval: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_end: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

const PRODUCT_LABELS: Record<Product, { label: string; price: number; emoji: string }> = {
  marianne: { label: "Marianne (tronc)", price: 6900, emoji: "🤖" },
  placement_test: { label: "Test de positionnement", price: 3900, emoji: "🎯" },
  shared_diagnostic: { label: "Diagnostic partagé", price: 2900, emoji: "🤝" },
};

const STATUS_META: Record<Status, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Actif", variant: "default" },
  trialing: { label: "Essai", variant: "secondary" },
  past_due: { label: "Impayé", variant: "destructive" },
  canceled: { label: "Annulé", variant: "outline" },
  incomplete: { label: "Incomplet", variant: "outline" },
  incomplete_expired: { label: "Expiré", variant: "outline" },
  unpaid: { label: "Non payé", variant: "destructive" },
  paused: { label: "En pause", variant: "secondary" },
};

const emptyForm = {
  email: "",
  user_id: "",
  product: "marianne" as Product,
  status: "active" as Status,
  amount_cents: 6900,
  currency: "eur",
  interval: "month",
  stripe_customer_id: "",
  stripe_subscription_id: "",
  stripe_price_id: "",
  current_period_start: "",
  current_period_end: "",
  cancel_at_period_end: false,
};

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState<Product | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSubs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      setSubs((data || []) as Subscription[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubs();
    const channel = supabase
      .channel("admin-subscriptions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions" },
        (payload) => {
          setSubs((prev) => {
            if (payload.eventType === "DELETE") {
              return prev.filter((s) => s.id !== (payload.old as any).id);
            }
            const row = payload.new as Subscription;
            const idx = prev.findIndex((s) => s.id === row.id);
            if (idx === -1) return [row, ...prev];
            const copy = [...prev];
            copy[idx] = row;
            return copy;
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: Subscription) => {
    setEditingId(s.id);
    setForm({
      email: s.email || "",
      user_id: s.user_id,
      product: s.product,
      status: s.status,
      amount_cents: s.amount_cents,
      currency: s.currency,
      interval: s.interval,
      stripe_customer_id: s.stripe_customer_id || "",
      stripe_subscription_id: s.stripe_subscription_id || "",
      stripe_price_id: s.stripe_price_id || "",
      current_period_start: s.current_period_start?.slice(0, 10) || "",
      current_period_end: s.current_period_end?.slice(0, 10) || "",
      cancel_at_period_end: s.cancel_at_period_end,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.user_id) {
      toast({ variant: "destructive", title: "Erreur", description: "user_id requis" });
      return;
    }
    setSaving(true);
    const payload = {
      user_id: form.user_id,
      email: form.email || null,
      product: form.product,
      status: form.status,
      amount_cents: form.amount_cents,
      currency: form.currency,
      interval: form.interval,
      stripe_customer_id: form.stripe_customer_id || null,
      stripe_subscription_id: form.stripe_subscription_id || null,
      stripe_price_id: form.stripe_price_id || null,
      current_period_start: form.current_period_start || null,
      current_period_end: form.current_period_end || null,
      cancel_at_period_end: form.cancel_at_period_end,
    };
    const { error } = editingId
      ? await supabase.from("subscriptions").update(payload).eq("id", editingId)
      : await supabase.from("subscriptions").insert(payload);
    setSaving(false);
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      toast({ title: editingId ? "Abonnement modifié" : "Abonnement créé" });
      setDialogOpen(false);
      fetchSubs();
    }
  };

  const updateStatus = async (id: string, patch: Partial<Subscription>) => {
    const { error } = await supabase.from("subscriptions").update(patch).eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      toast({ title: "Mis à jour" });
      fetchSubs();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement cet abonnement ?")) return;
    const { error } = await supabase.from("subscriptions").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      toast({ title: "Supprimé" });
      fetchSubs();
    }
  };

  const filtered = useMemo(() => {
    return subs.filter((s) => {
      if (productFilter !== "all" && s.product !== productFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (s.email || "").toLowerCase().includes(q) ||
          (s.stripe_customer_id || "").toLowerCase().includes(q) ||
          (s.stripe_subscription_id || "").toLowerCase().includes(q) ||
          s.user_id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [subs, productFilter, statusFilter, search]);

  const kpis = useMemo(() => {
    const active = subs.filter((s) => s.status === "active" || s.status === "trialing");
    const mrr = active.reduce((acc, s) => {
      const monthly = s.interval === "year" ? s.amount_cents / 12 : s.amount_cents;
      return acc + monthly;
    }, 0);
    const uniqueCustomers = new Set(active.map((s) => s.user_id)).size;
    const pastDue = subs.filter((s) => s.status === "past_due" || s.status === "unpaid").length;
    return { active: active.length, mrr, uniqueCustomers, pastDue };
  }, [subs]);

  const formatMoney = (cents: number, currency = "eur") =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: currency.toUpperCase() }).format(
      cents / 100
    );

  const formatDate = (d: string | null) =>
    d ? format(new Date(d), "dd MMM yyyy", { locale: fr }) : "—";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Admin — Abonnements et souscriptions"
        description="Gestion des abonnements ToFrance"
        path="/admin/subscriptions"
      />
      <Header />

      <main className="container mx-auto px-4 py-24">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-primary" />
              Abonnements & souscriptions
            </h1>
            <p className="mt-1 text-muted-foreground">
              Suivi des souscriptions Marianne, test de positionnement et diagnostic partagé.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchSubs} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Rafraîchir
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel abonnement
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            label="Abonnements actifs"
            value={kpis.active.toString()}
          />
          <KpiCard
            icon={<Euro className="h-5 w-5 text-primary" />}
            label="MRR estimé"
            value={formatMoney(kpis.mrr)}
          />
          <KpiCard
            icon={<Users className="h-5 w-5 text-primary" />}
            label="Clients uniques"
            value={kpis.uniqueCustomers.toString()}
          />
          <KpiCard
            icon={<XCircle className="h-5 w-5 text-destructive" />}
            label="Impayés"
            value={kpis.pastDue.toString()}
          />
        </div>

        {/* Filtres */}
        <Card className="mb-4">
          <CardContent className="pt-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher (email, user_id, Stripe id...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={productFilter} onValueChange={(v) => setProductFilter(v as any)}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Produit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les produits</SelectItem>
                {Object.entries(PRODUCT_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.emoji} {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(STATUS_META).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Tableau */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {filtered.length} abonnement{filtered.length > 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Aucun abonnement à afficher.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Période en cours</TableHead>
                      <TableHead>Renouvellement</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s) => {
                      const p = PRODUCT_LABELS[s.product];
                      const st = STATUS_META[s.status];
                      return (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div className="font-medium">{s.email || "—"}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {s.user_id.slice(0, 8)}…
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {p.emoji} {p.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={st.variant}>{st.label}</Badge>
                            {s.cancel_at_period_end && (
                              <Badge variant="outline" className="ml-1">
                                Résiliation programmée
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatMoney(s.amount_cents, s.currency)}
                            <span className="text-xs text-muted-foreground"> / {s.interval}</span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(s.current_period_start)} →{" "}
                            {formatDate(s.current_period_end)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {s.status === "canceled"
                              ? `Annulé ${formatDate(s.canceled_at)}`
                              : s.cancel_at_period_end
                              ? "Non"
                              : "Auto"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(s)}>
                                  Modifier
                                </DropdownMenuItem>
                                {!s.cancel_at_period_end && s.status === "active" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateStatus(s.id, { cancel_at_period_end: true })
                                    }
                                  >
                                    Résilier en fin de période
                                  </DropdownMenuItem>
                                )}
                                {s.cancel_at_period_end && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateStatus(s.id, { cancel_at_period_end: false })
                                    }
                                  >
                                    Annuler la résiliation
                                  </DropdownMenuItem>
                                )}
                                {s.status !== "canceled" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateStatus(s.id, {
                                        status: "canceled",
                                        canceled_at: new Date().toISOString(),
                                      })
                                    }
                                  >
                                    Marquer comme annulé
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(s.id)}
                                  className="text-destructive"
                                >
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Modifier l'abonnement" : "Nouvel abonnement"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Email du client</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="client@example.com"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>User ID (UUID)</Label>
                <Input
                  value={form.user_id}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  placeholder="00000000-0000-0000-0000-000000000000"
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label>Produit</Label>
                <Select
                  value={form.product}
                  onValueChange={(v) => {
                    const p = v as Product;
                    setForm({ ...form, product: p, amount_cents: PRODUCT_LABELS[p].price });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRODUCT_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.emoji} {v.label} — {(v.price / 100).toFixed(0)}€
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_META).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Montant (centimes)</Label>
                <Input
                  type="number"
                  value={form.amount_cents}
                  onChange={(e) => setForm({ ...form, amount_cents: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Intervalle</Label>
                <Select value={form.interval} onValueChange={(v) => setForm({ ...form, interval: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mensuel</SelectItem>
                    <SelectItem value="year">Annuel</SelectItem>
                    <SelectItem value="one_time">Paiement unique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Début période</Label>
                <Input
                  type="date"
                  value={form.current_period_start}
                  onChange={(e) => setForm({ ...form, current_period_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fin période</Label>
                <Input
                  type="date"
                  value={form.current_period_end}
                  onChange={(e) => setForm({ ...form, current_period_end: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Stripe Customer ID</Label>
                <Input
                  value={form.stripe_customer_id}
                  onChange={(e) => setForm({ ...form, stripe_customer_id: e.target.value })}
                  placeholder="cus_..."
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Stripe Subscription ID</Label>
                <Input
                  value={form.stripe_subscription_id}
                  onChange={(e) => setForm({ ...form, stripe_subscription_id: e.target.value })}
                  placeholder="sub_..."
                  className="font-mono text-xs"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Enregistrer" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              {label}
            </div>
            <div className="text-2xl font-bold mt-1">{value}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Building2, Users, Search, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { AdminContactRequests } from "@/components/AdminContactRequests";
import { AdminLeadsManager } from "@/components/AdminLeadsManager";
import { AdminAnalytics } from "@/components/AdminAnalytics";
import { AdminCheckpointAnalytics } from "@/components/AdminCheckpointAnalytics";

interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  website: string | null;
  description: string | null;
  provider_type: "employer" | "training_org";
  is_active: boolean | null;
  city: string | null;
  postal_code: string | null;
  address: string | null;
  user_id: string | null;
  created_at: string;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  website: "",
  description: "",
  provider_type: "training_org" as "employer" | "training_org",
  city: "",
  postal_code: "",
  address: "",
  is_active: true,
};

export default function AdminDashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
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
          })
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Partenaire modifié" });
      } else {
        // Use edge function to create (handles role assignment too if needed)
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
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        toast({ title: "Partenaire créé" });
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

  const filteredProviders = providers.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.city || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Admin — Gestion des partenaires" description="Back-office ToFrance" path="/admin" />
      <Header />

      <main className="container mx-auto px-4 py-24">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Gestion des partenaires
            </h1>
            <p className="mt-1 text-muted-foreground">
              <Users className="mr-1 inline h-4 w-4" />
              {providers.length} partenaire{providers.length > 1 ? "s" : ""} enregistré{providers.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/fle">
                <Users className="mr-2 h-4 w-4" />
                Suivi FLE
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/email-preview">
                <Mail className="mr-2 h-4 w-4" />
                Prévisualiser les emails
              </Link>
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un partenaire
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                  <div className="flex items-center gap-2">
                    <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                    <Label>Actif</Label>
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

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProviders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucun partenaire trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProviders.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>
                          <Badge variant={p.provider_type === "employer" ? "secondary" : "default"}>
                            {p.provider_type === "employer" ? "Employeur" : "Formation"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.email}</TableCell>
                        <TableCell>{p.city || "—"}</TableCell>
                        <TableCell>
                          <Switch
                            checked={p.is_active ?? true}
                            onCheckedChange={() => handleToggleActive(p.id, p.is_active)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <div className="mt-10">
          <AdminAnalytics />
        </div>

        <div className="mt-10">
          <AdminLeadsManager />
        </div>

        <div className="mt-10">
          <AdminContactRequests />
        </div>
      </main>

      <Footer />
    </div>
  );
}

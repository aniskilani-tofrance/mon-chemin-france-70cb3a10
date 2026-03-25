import { useState, useRef, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/AnimatedContainer";
import {
  Building2, Mail, Phone, Globe, MapPin, Pencil, Save, X,
  GraduationCap, CalendarPlus, Trash2, Calendar, Users, Upload,
  CreditCard, ExternalLink, Loader2, Plus, BookOpen, Check,
} from "lucide-react";
import { useProviderProfile, useProviderTrainings, useCreateTraining, useDeleteTraining } from "@/hooks/useProviderData";
import { useAllProviderSessions, useCreateSession, useDeleteSession } from "@/hooks/useProviderSessions";
import { trainingCatalog } from "@/lib/trainingCatalog";
import { useRequireAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function PartnerProfile() {
  useRequireAuth("/login");
  const { data: provider, isLoading } = useProviderProfile();
  const { data: trainings } = useProviderTrainings();
  const { data: sessions } = useAllProviderSessions();
  const createSession = useCreateSession();
  const deleteSession = useDeleteSession();
  const createTraining = useCreateTraining();
  const deleteTraining = useDeleteTraining();
  const qc = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Session form
  const [sessionForm, setSessionForm] = useState({ training_id: "", start_date: "", end_date: "", max_seats: "", location: "", notes: "" });
  const [showSessionForm, setShowSessionForm] = useState(false);

  // Training catalog picker
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [selectedCatalogItems, setSelectedCatalogItems] = useState<string[]>([]);

  // Compute already-added catalog IDs from existing trainings
  const existingCatalogIds = useMemo(() => {
    if (!trainings) return new Set<string>();
    return new Set(trainings.map(t => t.title));
  }, [trainings]);
  // Payment history
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  useEffect(() => {
    if (!provider) return;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-payment-history");
        if (error) throw error;
        setPayments(data?.payments || []);
      } catch {
        setPayments([]);
      }
      setPaymentsLoading(false);
    })();
  }, [provider]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12"><div className="mx-auto max-w-4xl px-4 space-y-4">
          <Skeleton className="h-10 w-64" /><Skeleton className="h-48 w-full" /><Skeleton className="h-32 w-full" />
        </div></main>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12 flex items-center justify-center">
          <Card className="max-w-md"><CardContent className="p-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">Votre compte n'est pas associé à un organisme partenaire.</p>
          </CardContent></Card>
        </main>
        <Footer />
      </div>
    );
  }

  const startEdit = () => {
    setForm({
      name: provider.name || "",
      email: provider.email || "",
      phone: provider.phone || "",
      website: provider.website || "",
      address: provider.address || "",
      city: provider.city || "",
      postal_code: provider.postal_code || "",
      description: provider.description || "",
    });
    setEditing(true);
  };

  const saveProfile = async () => {
    const { error } = await supabase.from("training_providers").update({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      website: form.website || null,
      address: form.address || null,
      city: form.city || null,
      postal_code: form.postal_code || null,
      description: form.description || null,
    }).eq("id", provider.id);
    if (error) { toast.error("Erreur lors de la sauvegarde"); return; }
    toast.success("Profil mis à jour");
    qc.invalidateQueries({ queryKey: ["provider-profile"] });
    setEditing(false);
  };

  const uploadLogo = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${provider.id}/logo.${ext}`;
    const { error: upErr } = await supabase.storage.from("provider-logos").upload(path, file, { upsert: true });
    if (upErr) { toast.error("Erreur upload"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("provider-logos").getPublicUrl(path);
    await supabase.from("training_providers").update({ logo_url: urlData.publicUrl }).eq("id", provider.id);
    qc.invalidateQueries({ queryKey: ["provider-profile"] });
    toast.success("Logo mis à jour");
    setUploading(false);
  };

  const addSession = () => {
    if (!sessionForm.training_id || !sessionForm.start_date) { toast.error("Formation et date de début requises"); return; }
    createSession.mutate({
      training_id: sessionForm.training_id,
      start_date: sessionForm.start_date,
      end_date: sessionForm.end_date || undefined,
      max_seats: sessionForm.max_seats ? parseInt(sessionForm.max_seats) : undefined,
      location: sessionForm.location || undefined,
      notes: sessionForm.notes || undefined,
    }, {
      onSuccess: () => { toast.success("Session ajoutée"); setSessionForm({ training_id: "", start_date: "", end_date: "", max_seats: "", location: "", notes: "" }); setShowSessionForm(false); },
    });
  };

  const toggleCatalogItem = (label: string) => {
    setSelectedCatalogItems(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const addSelectedTrainings = () => {
    if (!selectedCatalogItems.length) { toast.error("Sélectionnez au moins une formation"); return; }
    const allItems = trainingCatalog.flatMap(c => c.items);
    const toAdd = selectedCatalogItems.filter(label => !existingCatalogIds.has(label));
    if (!toAdd.length) { toast.error("Ces formations sont déjà ajoutées"); return; }
    
    Promise.all(toAdd.map(label => {
      const item = allItems.find(i => i.label === label)!;
      return createTraining.mutateAsync({
        provider_id: provider.id,
        title: item.label,
        training_type: item.training_type,
        certification_type: item.certification_type,
        target_sectors: item.sectors,
      });
    })).then(() => {
      toast.success(`${toAdd.length} formation(s) ajoutée(s)`);
      setSelectedCatalogItems([]);
      setShowTrainingForm(false);
    }).catch(() => toast.error("Erreur lors de l'ajout"));
  };

  const infoItems = [
    { icon: Mail, label: "Email", value: provider.email },
    { icon: Phone, label: "Téléphone", value: provider.phone },
    { icon: Globe, label: "Site web", value: provider.website },
    { icon: MapPin, label: "Adresse", value: [provider.address, provider.postal_code, provider.city].filter(Boolean).join(", ") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">

          {/* Profile Card */}
          <AnimatedContainer>
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Logo */}
                  <div className="relative group shrink-0">
                    <div className="h-24 w-24 rounded-2xl bg-muted/30 border-2 border-border flex items-center justify-center overflow-hidden">
                      {provider.logo_url ? (
                        <img src={provider.logo_url} alt={provider.name} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="absolute inset-0 bg-foreground/40 text-background rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Upload className="h-5 w-5" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
                  </div>

                  {/* Info or Edit */}
                  <div className="flex-1 min-w-0">
                    {!editing ? (
                      <>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <h1 className="text-2xl font-bold text-foreground">{provider.name}</h1>
                            {provider.description && <p className="text-sm text-muted-foreground mt-1">{provider.description}</p>}
                          </div>
                          <Button variant="outline" size="sm" onClick={startEdit}>
                            <Pencil className="h-4 w-4 mr-1" /> Modifier
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {infoItems.map((item) => (
                            <div key={item.label} className="flex items-center gap-2 text-sm">
                              <item.icon className="h-4 w-4 text-primary shrink-0" />
                              <span className="text-muted-foreground">{item.label} :</span>
                              <span className="text-foreground font-medium truncate">{item.value || "—"}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Nom</label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Email</label>
                            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Téléphone</label>
                            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Site web</label>
                            <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Adresse</label>
                            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Code postal</label>
                            <Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Ville</label>
                            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Description</label>
                          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveProfile}><Save className="h-4 w-4 mr-1" /> Sauvegarder</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditing(false)}><X className="h-4 w-4 mr-1" /> Annuler</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>

          {/* Formations */}
          <AnimatedContainer delay={0.1}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" /> Formations
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setShowTrainingForm(!showTrainingForm)}>
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Catalog picker */}
                {showTrainingForm && (
                  <div className="mb-4 p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3 max-h-[60vh] overflow-y-auto">
                    <p className="text-sm text-muted-foreground">Cochez les formations que vous proposez :</p>
                    <Accordion type="multiple" className="w-full">
                      {trainingCatalog.map((category) => {
                        const availableItems = category.items.filter(i => !existingCatalogIds.has(i.label));
                        const selectedInCategory = category.items.filter(i => selectedCatalogItems.includes(i.label)).length;
                        return (
                          <AccordionItem key={category.id} value={category.id}>
                            <AccordionTrigger className="text-sm hover:no-underline">
                              <div className="flex items-center gap-2">
                                <span>{category.label}</span>
                                {selectedInCategory > 0 && (
                                  <Badge variant="default" className="text-xs">{selectedInCategory}</Badge>
                                )}
                                {availableItems.length === 0 && (
                                  <Badge variant="secondary" className="text-xs">Toutes ajoutées</Badge>
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 pl-1">
                                {category.items.map((item) => {
                                  const alreadyAdded = existingCatalogIds.has(item.label);
                                  const isSelected = selectedCatalogItems.includes(item.label);
                                  return (
                                    <div key={item.id} className="flex items-center gap-2">
                                      <Checkbox
                                        id={item.id}
                                        checked={alreadyAdded || isSelected}
                                        disabled={alreadyAdded}
                                        onCheckedChange={() => !alreadyAdded && toggleCatalogItem(item.label)}
                                      />
                                      <label
                                        htmlFor={item.id}
                                        className={`text-sm cursor-pointer ${alreadyAdded ? "text-muted-foreground line-through" : "text-foreground"}`}
                                      >
                                        {item.label}
                                      </label>
                                      {alreadyAdded && <Check className="h-3 w-3 text-primary" />}
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                    <div className="flex gap-2 sticky bottom-0 bg-primary/5 pt-2">
                      <Button size="sm" onClick={addSelectedTrainings} disabled={createTraining.isPending || !selectedCatalogItems.length}>
                        <Save className="h-4 w-4 mr-1" /> Ajouter {selectedCatalogItems.length > 0 ? `(${selectedCatalogItems.length})` : ""}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setShowTrainingForm(false); setSelectedCatalogItems([]); }}>
                        <X className="h-4 w-4 mr-1" /> Annuler
                      </Button>
                    </div>
                  </div>
                )}
                {!trainings?.length && !showTrainingForm ? (
                  <p className="text-muted-foreground text-sm text-center py-6">Aucune formation enregistrée.</p>
                ) : (
                  <StaggerContainer className="space-y-3" staggerDelay={0.05}>
                    {trainings?.map((t) => (
                      <StaggerItem key={t.id}>
                        <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-foreground">{t.title}</span>
                              <Badge variant="outline" className="text-xs">{t.certification_type?.toUpperCase() || "—"}</Badge>
                              {t.is_remote && <Badge variant="secondary" className="text-xs">Distanciel</Badge>}
                              {!t.is_active && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                              {t.duration_weeks && <span>{t.duration_weeks} semaines</span>}
                              {t.target_sectors && t.target_sectors.length > 0 && <span>Secteurs : {t.target_sectors.join(", ")}</span>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive shrink-0"
                            onClick={() => deleteTraining.mutate(t.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedContainer>

          {/* Sessions */}
          <AnimatedContainer delay={0.2}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" /> Sessions de formation
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setShowSessionForm(!showSessionForm)}>
                    <CalendarPlus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Add session form */}
                {showSessionForm && (
                  <div className="mb-4 p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Formation *</label>
                        <Select value={sessionForm.training_id} onValueChange={(v) => setSessionForm({ ...sessionForm, training_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                          <SelectContent>
                            {trainings?.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Lieu</label>
                        <Input value={sessionForm.location} onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })} placeholder="Paris, en ligne…" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Date de début *</label>
                        <Input type="date" value={sessionForm.start_date} onChange={(e) => setSessionForm({ ...sessionForm, start_date: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Date de fin</label>
                        <Input type="date" value={sessionForm.end_date} onChange={(e) => setSessionForm({ ...sessionForm, end_date: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Places max</label>
                        <Input type="number" value={sessionForm.max_seats} onChange={(e) => setSessionForm({ ...sessionForm, max_seats: e.target.value })} placeholder="12" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Notes</label>
                        <Input value={sessionForm.notes} onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })} placeholder="Infos complémentaires…" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addSession} disabled={createSession.isPending}>
                        <Save className="h-4 w-4 mr-1" /> Enregistrer
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowSessionForm(false)}>
                        <X className="h-4 w-4 mr-1" /> Annuler
                      </Button>
                    </div>
                  </div>
                )}

                {/* Sessions list */}
                {!sessions?.length && !showSessionForm ? (
                  <p className="text-muted-foreground text-sm text-center py-6">Aucune session planifiée.</p>
                ) : (
                  <StaggerContainer className="space-y-2" staggerDelay={0.05}>
                    {sessions?.map((s: any) => (
                      <StaggerItem key={s.id}>
                        <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-foreground text-sm">{s.trainings?.title || "—"}</span>
                              {s.location && <Badge variant="outline" className="text-xs">{s.location}</Badge>}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(s.start_date).toLocaleDateString("fr-FR")}
                                {s.end_date && ` → ${new Date(s.end_date).toLocaleDateString("fr-FR")}`}
                              </span>
                              {s.max_seats && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {s.enrolled || 0}/{s.max_seats} places
                                </span>
                              )}
                              {s.notes && <span>{s.notes}</span>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive shrink-0"
                            onClick={() => deleteSession.mutate(s.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedContainer>
          {/* Historique des paiements */}
          <AnimatedContainer delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Historique des paiements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : payments.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">Aucun paiement enregistré.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="pb-2 font-medium text-muted-foreground">Date</th>
                          <th className="pb-2 font-medium text-muted-foreground">Montant</th>
                          <th className="pb-2 font-medium text-muted-foreground">Statut</th>
                          <th className="pb-2 font-medium text-muted-foreground">Lead</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {payments.map((p: any) => (
                          <tr key={p.id}>
                            <td className="py-3 text-foreground">
                              {new Date(p.created * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="py-3 font-semibold text-foreground">
                              {((p.amount || 0) / 100).toFixed(2)} {(p.currency || "eur").toUpperCase()}
                            </td>
                            <td className="py-3">
                              <Badge variant={p.status === "paid" ? "default" : "outline"} className="text-xs">
                                {p.status === "paid" ? "Payé" : p.status === "unpaid" ? "Non payé" : p.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-muted-foreground text-xs font-mono">
                              {p.lead_id ? p.lead_id.substring(0, 8) + "…" : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>
      </main>
      <Footer />
    </div>
  );
}
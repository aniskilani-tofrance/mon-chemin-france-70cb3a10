import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Mail, MailCheck, UserPlus } from "lucide-react";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/AnimatedContainer";
import {
  Users,
  TrendingUp,
  CheckCircle2,
  Phone,
  Building2,
  GraduationCap,
  ShoppingCart,
  Download,
} from "lucide-react";
import { useProviderProfile, useProviderLeads, useUpdateLeadStatus, useProviderTrainings, useProviderMembers, useInviteProviderMember } from "@/hooks/useProviderData";
import { useRequireAuth } from "@/hooks/useAuth";
import type { Lead } from "@/hooks/useProviderData";
import { Constants } from "@/integrations/supabase/types";
import { LeadCard } from "@/components/LeadCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_LABELS: Record<string, string> = {};
Constants.public.Enums.lead_status.forEach((s) => {
  const map: Record<string, string> = {
    pending: "En attente", a_qualifier: "À qualifier", qualifie_fle: "Qualifié FLE",
    qualifie_of: "Qualifié OF", qualifie_employeur: "Qualifié Employeur", contacted: "Contacté",
    transmis_partenaire: "Transmis", rdv_fixe: "RDV fixé", sas_insertion: "SAS insertion",
    entre_formation: "En formation", converted: "Converti", recrute: "Recruté",
    rejected: "Rejeté", perdu_injoignable: "Perdu",
  };
  STATUS_LABELS[s] = map[s] || s;
});

const TEAM_ROLE_LABELS: Record<string, string> = {
  benevole: "Bénévole",
  cip: "CIP",
  accueil: "Accueil",
  formateur: "Formateur",
};

export default function PartnerDashboard() {
  useRequireAuth("/login");
  const { data: provider, isLoading: providerLoading } = useProviderProfile();
  const { data: leads, isLoading: leadsLoading } = useProviderLeads();
  const { data: trainings } = useProviderTrainings();
  const { data: members, isLoading: membersLoading } = useProviderMembers();
  const updateLead = useUpdateLeadStatus();
  const inviteMember = useInviteProviderMember();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({ full_name: "", email: "", phone: "", role: "benevole" as "benevole" | "cip" | "accueil" | "formateur" });
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();

  const exportLeadsCSV = () => {
    const purchased = leads?.filter((l: any) => l.purchased_at) || [];
    if (purchased.length === 0) {
      toast.info("Aucun profil acheté à exporter.");
      return;
    }
    const headers = ["Date", "Nom", "Email", "Téléphone", "Ville", "Secteur", "Niveau FR", "Score", "Statut"];
    const rows = purchased.map((l: any) => {
      const p = l.profiles;
      return [
        new Date(l.created_at).toLocaleDateString("fr-FR"),
        p?.full_name || `${p?.first_name || ""} ${p?.last_name || ""}`.trim() || "—",
        p?.email || "—",
        p?.phone || "—",
        p?.city || "—",
        p?.target_sector || "—",
        p?.french_level_cecrl || "—",
        l.match_score ?? "—",
        STATUS_LABELS[l.status] || l.status,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });
    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profils-tofrance-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${purchased.length} profil(s) exporté(s)`);
  };

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    const leadId = searchParams.get("lead_id");

    if (payment === "success" && sessionId && leadId) {
      (async () => {
        try {
          const { data, error } = await supabase.functions.invoke("verify-lead-payment", {
            body: { sessionId, leadId },
          });
          if (error) throw error;
          if (data?.success) {
            toast.success("Profil débloqué avec succès !");
            qc.invalidateQueries({ queryKey: ["provider-leads"] });
          } else {
            toast.error(data?.error || "Erreur de vérification du paiement");
          }
        } catch (e: any) {
          toast.error("Erreur de vérification : " + (e.message || ""));
        }
        // Clean URL
        setSearchParams({});
      })();
    } else if (payment === "canceled") {
      toast.info("Paiement annulé");
      setSearchParams({});
    }
  }, []);

  // Realtime: listen for new leads for this provider
  useEffect(() => {
    if (!provider?.id) return;

    const channel = supabase
      .channel(`leads-provider-${provider.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "leads",
          filter: `provider_id=eq.${provider.id}`,
        },
        (payload) => {
          const score = payload.new.match_score;
          const tier = (score ?? 50) >= 80 ? "🌟 Premium" : (score ?? 50) >= 50 ? "✅ Standard" : "📋 Éco";
          toast.success(`Nouveau profil ${tier}`, {
            description: `Score de match : ${score ?? "—"}% — Consultez vos profils pour plus de détails.`,
            duration: 8000,
          });
          // Refresh leads data
          qc.invalidateQueries({ queryKey: ["provider-leads"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [provider?.id, qc]);

  const handlePurchase = async (leadId: string) => {
    setPurchasingId(leadId);
    try {
      const { data, error } = await supabase.functions.invoke("create-lead-payment", {
        body: { leadId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error(data?.error || "Erreur création du paiement");
      }
    } catch (e: any) {
      toast.error("Erreur : " + (e.message || ""));
    }
    setPurchasingId(null);
  };

  if (providerLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="mx-auto max-w-5xl px-4 space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
              <p className="text-muted-foreground">
                Votre compte n'est pas associé à un organisme partenaire.
                Contactez l'équipe ToFrance pour configurer votre accès.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredLeads = leads?.filter(
    (l) => statusFilter === "all" || l.status === statusFilter
  ) || [];

  const totalLeads = leads?.length || 0;
  const contactedLeads = leads?.filter((l) => l.contacted_at).length || 0;
  const purchasedLeads = leads?.filter((l) => l.purchased_at).length || 0;
  const convertedLeads = leads?.filter((l) => ["converted", "recrute", "entre_formation"].includes(l.status)).length || 0;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const handleStatusChange = (leadId: string, status: Lead["status"], notes?: string) => {
    updateLead.mutate({ leadId, status, notes });
  };

  const handleInviteMember = async (event: FormEvent) => {
    event.preventDefault();
    if (!provider?.id) return;
    try {
      await inviteMember.mutateAsync({
        provider_id: provider.id,
        email: memberForm.email,
        role: memberForm.role,
        full_name: memberForm.full_name || undefined,
        phone: memberForm.phone || undefined,
      });
      toast.success("Membre affilié à la structure");
      setMemberForm({ full_name: "", email: "", phone: "", role: "benevole" });
    } catch (e: any) {
      toast.error(e.message || "Impossible d'affilier ce membre");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Header */}
          <AnimatedContainer className="mb-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  {provider.name}
                </h1>
                <p className="text-muted-foreground">
                  {provider.city} — Dashboard partenaire
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={provider.provider_type === "employer" ? "default" : "outline"}>
                  {provider.provider_type === "employer" ? (
                    <><Briefcase className="mr-1 h-3 w-3" /> Employeur</>
                  ) : (
                    <><GraduationCap className="mr-1 h-3 w-3" /> Organisme de formation</>
                  )}
                </Badge>
                <Badge variant="outline">
                  <GraduationCap className="mr-1 h-3 w-3" />
                  {trainings?.length || 0} {provider.provider_type === "employer" ? "offre(s)" : "formation(s)"}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/partner-profile">
                    <Building2 className="mr-1 h-4 w-4" />
                    Mon profil
                  </Link>
                </Button>
              </div>
            </div>
          </AnimatedContainer>

          {/* KPIs */}
          <AnimatedContainer delay={0.1} className="mb-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {[
                { label: "Profils total", value: totalLeads, icon: Users, bg: "bg-primary/10", color: "text-primary" },
                { label: "Achetés", value: purchasedLeads, icon: ShoppingCart, bg: "bg-accent", color: "text-accent-foreground" },
                { label: "Contactés", value: contactedLeads, icon: Phone, bg: "bg-secondary/10", color: "text-secondary" },
                { label: "Convertis", value: convertedLeads, icon: CheckCircle2, bg: "bg-success/15", color: "text-success" },
                { label: "Taux conversion", value: `${conversionRate}%`, icon: TrendingUp, bg: "bg-primary/10", color: "text-primary" },
              ].map((kpi) => (
                <Card key={kpi.label} variant="feature" className="border-border">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${kpi.bg}`}>
                      <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                      <div className="text-xs text-muted-foreground font-medium">{kpi.label}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnimatedContainer>

          <AnimatedContainer delay={0.2}>
            <Tabs defaultValue="leads" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                <TabsTrigger value="leads">Profils</TabsTrigger>
                <TabsTrigger value="team">Équipe</TabsTrigger>
              </TabsList>

              <TabsContent value="leads">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <CardTitle className="text-lg">Profils reçus</CardTitle>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button variant="outline" size="sm" onClick={exportLeadsCSV} disabled={!leads?.some((l: any) => l.purchased_at)}>
                          <Download className="mr-1 h-4 w-4" />
                          Export CSV
                        </Button>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filtrer par statut" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            {Constants.public.Enums.lead_status.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s] || s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {leadsLoading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div> : filteredLeads.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">
                        <Users className="mx-auto h-10 w-10 mb-3 opacity-40" />
                        <p>Aucun lead pour le moment.</p>
                        <p className="text-sm">Les profils apparaîtront ici dès qu'un candidat correspondra à vos formations.</p>
                      </div>
                    ) : (
                      <StaggerContainer className="space-y-3" staggerDelay={0.05}>
                        {filteredLeads.map((lead) => <StaggerItem key={lead.id}><LeadCard lead={lead} onStatusChange={handleStatusChange} onPurchase={handlePurchase} purchasing={purchasingId === lead.id} /></StaggerItem>)}
                      </StaggerContainer>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team">
                <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Affilier un membre</CardTitle></CardHeader>
                    <CardContent>
                      <form onSubmit={handleInviteMember} className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="member-name">Nom</Label><Input id="member-name" value={memberForm.full_name} onChange={(e) => setMemberForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="Nom du membre" /></div>
                        <div className="space-y-2"><Label htmlFor="member-email">Email</Label><Input id="member-email" type="email" required value={memberForm.email} onChange={(e) => setMemberForm((f) => ({ ...f, email: e.target.value }))} placeholder="prenom@structure.fr" /></div>
                        <div className="space-y-2"><Label htmlFor="member-phone">Téléphone</Label><Input id="member-phone" value={memberForm.phone} onChange={(e) => setMemberForm((f) => ({ ...f, phone: e.target.value }))} placeholder="06…" /></div>
                        <div className="space-y-2">
                          <Label>Rôle</Label>
                          <Select value={memberForm.role} onValueChange={(role: any) => setMemberForm((f) => ({ ...f, role }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{Object.entries(TEAM_ROLE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full" disabled={inviteMember.isPending}><UserPlus className="mr-2 h-4 w-4" />Affilier</Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-lg">Membres affiliés</CardTitle>
                        <Button variant="outline" size="sm" asChild><Link to="/partner-invitations"><MailCheck className="mr-2 h-4 w-4" />Suivi</Link></Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {membersLoading ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />) : !members?.length ? (
                        <div className="py-10 text-center text-muted-foreground"><Mail className="mx-auto mb-3 h-9 w-9 opacity-40" /><p>Aucun membre affilié.</p></div>
                      ) : members.map((member) => (
                        <div key={member.id} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div><p className="font-medium text-foreground">{member.full_name || member.email}</p><p className="text-sm text-muted-foreground">{member.email}{member.phone ? ` · ${member.phone}` : ""}</p></div>
                          <div className="flex items-center gap-2"><Badge variant="outline">{TEAM_ROLE_LABELS[member.role] || member.role}</Badge><Badge variant={member.status === "active" ? "default" : "secondary"}>{member.status === "active" ? "Actif" : member.status === "disabled" ? "Désactivé" : "Invité"}</Badge></div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </AnimatedContainer>
        </div>
      </main>
      <Footer />
    </div>
  );
}

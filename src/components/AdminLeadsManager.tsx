import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, Eye, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Lead {
  id: string;
  profile_id: string | null;
  provider_id: string;
  training_id: string | null;
  status: string;
  match_score: number | null;
  price_charged: number | null;
  created_at: string;
  notes: string | null;
}

interface Profile {
  id: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  postal_code: string | null;
}

interface OnboardingData {
  target_sector: string | null;
  french_level_cecrl: string | null;
  lead_score: number | null;
  main_goal: string | null;
  lead_route: string | null;
  barriers: string[] | null;
}

interface Provider {
  id: string;
  name: string;
  provider_type: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  a_qualifier: "À qualifier",
  qualifie_fle: "Qualifié FLE",
  qualifie_of: "Qualifié OF",
  qualifie_employeur: "Qualifié Employeur",
  sas_insertion: "SAS Insertion",
  transmis_partenaire: "Transmis",
  rdv_fixe: "RDV fixé",
  entre_formation: "En formation",
  recrute: "Recruté",
  contacted: "Contacté",
  converted: "Converti",
  rejected: "Rejeté",
  perdu_injoignable: "Perdu / Injoignable",
};

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  rejected: "destructive",
  perdu_injoignable: "destructive",
  converted: "default",
  recrute: "default",
  entre_formation: "default",
};

export function AdminLeadsManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [onboardingMap, setOnboardingMap] = useState<Record<string, OnboardingData>>({});
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigningProfileId, setAssigningProfileId] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [leadsRes, profilesRes, providersRes, onboardingRes] = await Promise.all([
      supabase.from("leads").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, user_id, first_name, last_name, email, phone, city, postal_code"),
      supabase.from("training_providers").select("id, name, provider_type"),
      supabase.from("onboarding_results").select("user_id, target_sector, french_level_cecrl, lead_score, main_goal, lead_route, barriers"),
    ]);

    if (leadsRes.data) setLeads(leadsRes.data);
    if (profilesRes.data) {
      const map: Record<string, Profile> = {};
      profilesRes.data.forEach((p) => (map[p.id] = p));
      setProfiles(map);
    }
    if (providersRes.data) setProviders(providersRes.data);

    // Build onboarding data map keyed by profile.id (via user_id)
    if (onboardingRes.data && profilesRes.data) {
      const obMap: Record<string, OnboardingData> = {};
      // Map user_id → profile.id
      const userToProfile: Record<string, string> = {};
      profilesRes.data.forEach((p) => {
        if (p.user_id) userToProfile[p.user_id] = p.id;
      });
      onboardingRes.data.forEach((ob: any) => {
        if (ob.user_id && userToProfile[ob.user_id]) {
          obMap[userToProfile[ob.user_id]] = ob;
        }
      });
      setOnboardingMap(obMap);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getProviderName = (id: string) => providers.find((p) => p.id === id)?.name || "—";

  const handleViewProfile = (profileId: string) => {
    if (profiles[profileId]) {
      setSelectedProfileId(profileId);
      setDetailOpen(true);
    }
  };

  const handleOpenAssign = (profileId: string) => {
    setAssigningProfileId(profileId);
    setSelectedProviderId("");
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!assigningProfileId || !selectedProviderId) return;
    setAssigning(true);

    const { error } = await supabase.from("leads").insert({
      profile_id: assigningProfileId,
      provider_id: selectedProviderId,
      status: "transmis_partenaire" as const,
    });

    setAssigning(false);
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      toast({ title: "Lead attribué avec succès" });
      setAssignOpen(false);
      fetchData();
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus as any })
      .eq("id", leadId);

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      fetchData();
    }
  };

  const filteredLeads = statusFilter === "all" ? leads : leads.filter((l) => l.status === statusFilter);

  // Get unique profiles that have no lead yet (for assignment)
  const profilesWithoutLead = Object.values(profiles).filter(
    (p) => !leads.some((l) => l.profile_id === p.id)
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Gestion des leads
              <Badge variant="secondary">{leads.length}</Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {profilesWithoutLead.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    setAssigningProfileId(null);
                    setAssignOpen(true);
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  Attribuer un lead
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Candidat</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Partenaire</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Aucun lead trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => {
                  const profile = lead.profile_id ? profiles[lead.profile_id] : null;
                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {format(new Date(lead.created_at), "dd MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {profile
                          ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.email || "—"
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm">{profile?.city || "—"}</TableCell>
                      <TableCell>
                        {lead.match_score != null ? (
                          <Badge variant={lead.match_score >= 80 ? "default" : lead.match_score >= 50 ? "secondary" : "outline"}>
                            {lead.match_score}%
                          </Badge>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-sm">{getProviderName(lead.provider_id)}</TableCell>
                      <TableCell>
                        <Select
                          value={lead.status}
                          onValueChange={(v) => handleStatusChange(lead.id, v)}
                        >
                          <SelectTrigger className="h-8 w-40 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {lead.profile_id && (
                            <Button variant="ghost" size="icon" onClick={() => handleViewProfile(lead.profile_id!)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {lead.profile_id && (
                            <Button variant="ghost" size="icon" onClick={() => handleOpenAssign(lead.profile_id!)}>
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Profile Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détail du profil</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-3 pt-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-medium text-muted-foreground">Prénom :</span> {selectedProfile.first_name || "—"}</div>
                <div><span className="font-medium text-muted-foreground">Nom :</span> {selectedProfile.last_name || "—"}</div>
                <div><span className="font-medium text-muted-foreground">Email :</span> {selectedProfile.email || "—"}</div>
                <div><span className="font-medium text-muted-foreground">Tél :</span> {selectedProfile.phone || "—"}</div>
                <div><span className="font-medium text-muted-foreground">Ville :</span> {selectedProfile.city || "—"}</div>
                <div><span className="font-medium text-muted-foreground">CP :</span> {selectedProfile.postal_code || "—"}</div>
                <div><span className="font-medium text-muted-foreground">Secteur :</span> {selectedProfile.target_sector || "—"}</div>
                <div><span className="font-medium text-muted-foreground">Français :</span> {selectedProfile.french_level_cecrl || "—"}</div>
                <div><span className="font-medium text-muted-foreground">Objectif :</span> {selectedProfile.main_goal || "—"}</div>
                <div><span className="font-medium text-muted-foreground">Score :</span> {selectedProfile.lead_score ?? "—"}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Lead Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Attribuer un lead à un partenaire</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {!assigningProfileId && (
              <div className="space-y-2">
                <Label>Candidat</Label>
                <Select value={assigningProfileId || ""} onValueChange={setAssigningProfileId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un candidat" />
                  </SelectTrigger>
                  <SelectContent>
                    {profilesWithoutLead.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {`${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email || p.id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {assigningProfileId && profiles[assigningProfileId] && (
              <p className="text-sm text-muted-foreground">
                Candidat : <strong>{`${profiles[assigningProfileId].first_name || ""} ${profiles[assigningProfileId].last_name || ""}`.trim() || profiles[assigningProfileId].email}</strong>
              </p>
            )}
            <div className="space-y-2">
              <Label>Partenaire</Label>
              <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un partenaire" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.provider_type === "employer" ? "Employeur" : "Formation"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAssign}
              disabled={!assigningProfileId || !selectedProviderId || assigning}
              className="w-full gap-2"
            >
              {assigning && <Loader2 className="h-4 w-4 animate-spin" />}
              Attribuer le lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

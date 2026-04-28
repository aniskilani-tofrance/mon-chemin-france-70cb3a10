import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MailCheck, RotateCw, ShieldOff, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAuth } from "@/hooks/useAuth";
import { useManageProviderInvitation, useProviderMembers, useProviderProfile } from "@/hooks/useProviderData";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  benevole: "Bénévole",
  cip: "CIP",
  accueil: "Accueil",
  formateur: "Formateur",
};

const STATUS_LABELS: Record<string, string> = {
  invited: "Invité",
  active: "Actif",
  disabled: "Désactivé",
};

const STATUS_BADGES: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  invited: "secondary",
  active: "default",
  disabled: "outline",
};

export default function PartnerInvitations() {
  useRequireAuth("/login");
  const { data: provider, isLoading: providerLoading } = useProviderProfile();
  const { data: members, isLoading: membersLoading } = useProviderMembers();
  const manageInvitation = useManageProviderInvitation();
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredMembers = useMemo(() => {
    return (members || []).filter((member) => statusFilter === "all" || member.status === statusFilter);
  }, [members, statusFilter]);

  const counts = useMemo(() => {
    return (members || []).reduce(
      (acc, member) => {
        acc.total += 1;
        acc[member.status as "invited" | "active" | "disabled"] += 1;
        return acc;
      },
      { total: 0, invited: 0, active: 0, disabled: 0 },
    );
  }, [members]);

  const handleAction = async (memberId: string, action: "resend" | "revoke") => {
    try {
      await manageInvitation.mutateAsync({ member_id: memberId, action });
      toast.success(action === "resend" ? "Invitation renvoyée" : "Invitation révoquée");
    } catch (e: any) {
      toast.error(e.message || "Action impossible");
    }
  };

  if (providerLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="mx-auto max-w-6xl px-4 space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12 flex items-center justify-center px-4">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h1 className="mb-2 text-xl font-semibold">Accès refusé</h1>
              <p className="text-muted-foreground">Votre compte n'est pas associé à une structure.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <AnimatedContainer className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link to="/partner-dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Dashboard structure</Link>
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Invitations équipe</h1>
                <p className="text-muted-foreground">{provider.name} — suivi des accès bénévoles, CIP, accueil et formateurs</p>
              </div>
              <Button asChild><Link to="/partner-dashboard">Inviter un membre</Link></Button>
            </div>
          </AnimatedContainer>

          <AnimatedContainer delay={0.1} className="mb-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                ["Total", counts.total],
                ["Invités", counts.invited],
                ["Actifs", counts.active],
                ["Désactivés", counts.disabled],
              ].map(([label, value]) => (
                <Card key={label}>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-foreground">{value}</div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnimatedContainer>

          <AnimatedContainer delay={0.2}>
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg"><MailCheck className="h-5 w-5 text-primary" />Suivi des invitations</CardTitle>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="invited">Invités</SelectItem>
                      <SelectItem value="active">Actifs</SelectItem>
                      <SelectItem value="disabled">Désactivés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {membersLoading ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />) : filteredMembers.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <MailCheck className="mx-auto mb-3 h-10 w-10 opacity-40" />
                    <p>Aucune invitation pour ce filtre.</p>
                  </div>
                ) : filteredMembers.map((member) => (
                  <div key={member.id} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{member.full_name || member.email}</p>
                        <Badge variant={STATUS_BADGES[member.status] || "outline"}>{STATUS_LABELS[member.status] || member.status}</Badge>
                        <Badge variant="outline">{ROLE_LABELS[member.role] || member.role}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground break-all">{member.email}{member.phone ? ` · ${member.phone}` : ""}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Invitée le {new Date(member.invited_at).toLocaleDateString("fr-FR")}
                        {member.accepted_at ? ` · activée le ${new Date(member.accepted_at).toLocaleDateString("fr-FR")}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                      <Button variant="outline" size="sm" disabled={member.status === "disabled" || manageInvitation.isPending} onClick={() => handleAction(member.id, "resend")}>
                        <RotateCw className="mr-2 h-4 w-4" />Renvoyer
                      </Button>
                      <Button variant="destructive" size="sm" disabled={member.status === "disabled" || manageInvitation.isPending} onClick={() => handleAction(member.id, "revoke")}>
                        <ShieldOff className="mr-2 h-4 w-4" />Révoquer
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>
      </main>
      <Footer />
    </div>
  );
}

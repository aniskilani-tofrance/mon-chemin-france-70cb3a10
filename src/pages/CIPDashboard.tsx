import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingScreen } from "@/components/LoadingScreen";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Navigate } from "react-router-dom";
import { ClipboardList, FileText, Plus, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

interface DiagRow {
  id: string;
  access_code: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  learner_id: string | null;
  formateur_id: string;
  learner_name?: string | null;
  learner_email?: string | null;
}

export default function CIPDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      const { data: isCip } = await supabase.rpc("has_role", { _user_id: user.id, _role: "cip" });
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setAllowed(!!isCip || !!isAdmin);
    })();
  }, [user, authLoading]);

  useEffect(() => {
    if (!allowed) return;
    fetchData();
  }, [allowed]);

  const fetchData = async () => {
    setLoading(true);
    const { data: diags } = await supabase
      .from("shared_diagnostics")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    const learnerIds = (diags || []).map((d: any) => d.learner_id).filter(Boolean);
    const { data: profiles } = learnerIds.length
      ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", learnerIds)
      : { data: [] };

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
    setDiagnostics((diags || []).map((d: any) => ({
      ...d,
      learner_name: profileMap.get(d.learner_id)?.full_name,
      learner_email: profileMap.get(d.learner_id)?.email,
    })));
    setLoading(false);
  };

  const createBlankDiagnostic = async () => {
    setCreating(true);
    try {
      const { data: codeData } = await supabase.rpc("generate_access_code");
      const { data, error } = await supabase
        .from("shared_diagnostics")
        .insert({
          formateur_id: user!.id,
          access_code: codeData as string,
          learner_language: "fr",
          status: "in_progress",
        })
        .select()
        .single();
      if (error) throw error;
      toast.success(`Diagnostic créé — code : ${data.access_code}`);
      navigator.clipboard.writeText(data.access_code).catch(() => {});
      navigate(`/diagnostic-partage?id=${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || allowed === null) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed) return <Navigate to="/dashboard" replace />;

  const inProgress = diagnostics.filter((d) => d.status === "in_progress").length;
  const completed = diagnostics.filter((d) => d.status === "completed").length;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Espace CIP — ToFrance" description="Tableau de bord chargé d'insertion" path="/cip" />
      <Header />
      <main className="pt-24 pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-primary" />
                Espace Chargé d'insertion (CIP)
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Créez et suivez les diagnostics partagés des bénéficiaires.
              </p>
            </div>
            <Button onClick={createBlankDiagnostic} disabled={creating}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Nouveau diagnostic (avec code)
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={FileText} label="Diagnostics totaux" value={diagnostics.length} />
            <StatCard icon={Loader2} label="En cours" value={inProgress} />
            <StatCard icon={Users} label="Terminés" value={completed} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tous les diagnostics récents</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
              ) : diagnostics.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  Aucun diagnostic pour le moment. Cliquez sur « Nouveau diagnostic » pour démarrer.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Bénéficiaire</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Créé le</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diagnostics.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-mono">{d.access_code}</TableCell>
                        <TableCell>
                          {d.learner_name || d.learner_email || <span className="text-muted-foreground">— non rattaché —</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={d.status === "completed" ? "default" : "secondary"}>
                            {d.status === "completed" ? "Terminé" : "En cours"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(d.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/diagnostic-partage?id=${d.id}`)}>
                            Ouvrir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

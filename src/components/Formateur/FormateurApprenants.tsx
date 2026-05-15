import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, User, FileText, Copy, Sparkles, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { CreateLearnerDialog } from "./CreateLearnerDialog";
import { ImportFromSourceDialog } from "./ImportFromSourceDialog";

interface Learner {
  learner_id: string;
  email: string | null;
  full_name: string | null;
  french_level_cecrl: string | null;
  last_activity_at: string | null;
  total_xp: number;
  estimated_level: string | null;
}

export function FormateurApprenants() {
  const navigate = useNavigate();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingDiagnostic, setCreatingDiagnostic] = useState<string | null>(null);
  const [creatingPlacement, setCreatingPlacement] = useState<string | null>(null);

  const fetchLearners = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: links } = await supabase
      .from("formateur_learners")
      .select("learner_id")
      .eq("formateur_id", user.id);

    if (!links || links.length === 0) {
      setLearners([]);
      setLoading(false);
      return;
    }

    const learnerIds = links.map((l) => l.learner_id);

    const [{ data: profiles }, { data: progress }] = await Promise.all([
      supabase.from("profiles").select("user_id, email, full_name, french_level_cecrl").in("user_id", learnerIds),
      supabase.from("fle_user_progress").select("user_id, total_xp, estimated_level, last_activity_at").in("user_id", learnerIds),
    ]);

    const merged: Learner[] = learnerIds.map((id) => {
      const profile = profiles?.find((p) => p.user_id === id);
      const prog = progress?.find((p) => p.user_id === id);
      return {
        learner_id: id,
        email: profile?.email ?? null,
        full_name: profile?.full_name ?? null,
        french_level_cecrl: profile?.french_level_cecrl ?? null,
        last_activity_at: prog?.last_activity_at ?? null,
        total_xp: prog?.total_xp ?? 0,
        estimated_level: prog?.estimated_level ?? null,
      };
    });

    setLearners(merged);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLearners(); }, [fetchLearners]);

  const handleCreateDiagnostic = async (learner: Learner) => {
    setCreatingDiagnostic(learner.learner_id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate access code
      const { data: codeData } = await supabase.rpc("generate_access_code");
      const accessCode = codeData as string;

      const { data: diag, error } = await supabase
        .from("shared_diagnostics")
        .insert({
          formateur_id: user.id,
          learner_id: learner.learner_id,
          access_code: accessCode,
          learner_language: "fr",
          status: "in_progress",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Diagnostic créé — code : ${accessCode}`);
      navigate(`/diagnostic-partage?id=${diag.id}`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création");
    } finally {
      setCreatingDiagnostic(null);
    }
  };

  const handleQuickDiagnostic = async () => {
    setCreatingDiagnostic("quick");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: codeData } = await supabase.rpc("generate_access_code");
      const accessCode = codeData as string;

      const { data: diag, error } = await supabase
        .from("shared_diagnostics")
        .insert({
          formateur_id: user.id,
          learner_id: null,
          access_code: accessCode,
          learner_language: "fr",
          status: "in_progress",
        })
        .select()
        .single();

      if (error) throw error;
      toast.success(`Code généré : ${accessCode}`);
      navigator.clipboard.writeText(accessCode).catch(() => {});
      navigate(`/diagnostic-partage?id=${diag.id}`);
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setCreatingDiagnostic(null);
    }
  };

  const handleCreatePlacement = async (learner: Learner | null) => {
    const key = learner?.learner_id ?? "quick";
    setCreatingPlacement(key);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: codeData } = await supabase.rpc("generate_access_code");
      const accessCode = codeData as string;

      const { error } = await supabase
        .from("placement_test_sessions")
        .insert({
          formateur_id: user.id,
          learner_id: learner?.learner_id ?? null,
          candidate_name: learner?.full_name ?? null,
          candidate_email: learner?.email ?? null,
          access_code: accessCode,
          status: "pending",
        });

      if (error) throw error;

      await navigator.clipboard.writeText(accessCode).catch(() => {});
      toast.success(
        learner
          ? `Test de positionnement assigné à ${learner.full_name || learner.email} — code : ${accessCode} (copié)`
          : `Code de positionnement généré : ${accessCode} (copié)`
      );
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création du test");
    } finally {
      setCreatingPlacement(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Mes apprenants ({learners.length})
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleQuickDiagnostic}
            disabled={creatingDiagnostic === "quick"}
          >
            {creatingDiagnostic === "quick"
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <Sparkles className="mr-2 h-4 w-4" />}
            Diagnostic rapide (avec code)
          </Button>
          <ImportFromSourceDialog onImported={fetchLearners} />
          <CreateLearnerDialog onCreated={fetchLearners} />
        </div>
      </CardHeader>
      <CardContent>
        {learners.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <User className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <div>
              <p className="font-medium">Aucun apprenant pour le moment</p>
              <p className="text-sm text-muted-foreground mt-1">
                Créez un compte directement ou démarrez un diagnostic rapide avec un code.
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Dernière activité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {learners.map((l) => (
                <TableRow key={l.learner_id}>
                  <TableCell className="font-medium">{l.full_name || "—"}</TableCell>
                  <TableCell>{l.email || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {(l.estimated_level || l.french_level_cecrl || "—").toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{l.total_xp} XP</TableCell>
                  <TableCell>
                    {l.last_activity_at
                      ? new Date(l.last_activity_at).toLocaleDateString("fr-FR")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCreateDiagnostic(l)}
                      disabled={creatingDiagnostic === l.learner_id}
                    >
                      {creatingDiagnostic === l.learner_id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <FileText className="h-4 w-4" />}
                      <span className="ml-2">Diagnostic</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

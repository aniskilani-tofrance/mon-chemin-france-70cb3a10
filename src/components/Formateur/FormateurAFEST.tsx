import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Loader2, Plus, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Observation = Tables<"afest_observations">;

export function FormateurAFEST() {
  const [observations, setObservations] = useState<(Observation & { learner_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [learnerIds, setLearnerIds] = useState<string[]>([]);
  const [learnerProfiles, setLearnerProfiles] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formLearner, setFormLearner] = useState("");
  const [formSituation, setFormSituation] = useState("");
  const [formAppreciation, setFormAppreciation] = useState("2");
  const [formComment, setFormComment] = useState("");

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: links } = await supabase
      .from("formateur_learners")
      .select("learner_id")
      .eq("formateur_id", user.id);
    const ids = links?.map((l) => l.learner_id) || [];
    setLearnerIds(ids);

    if (ids.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", ids);
      const map: Record<string, string> = {};
      profiles?.forEach((p) => { map[p.user_id!] = p.full_name || p.email || "—"; });
      setLearnerProfiles(map);
    }

    const { data: obs } = await supabase
      .from("afest_observations")
      .select("*")
      .eq("formateur_id", user.id)
      .order("observation_date", { ascending: false });

    setObservations(
      (obs || []).map((o) => ({
        ...o,
        learner_name: learnerProfiles[o.learner_id] || "—",
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!formLearner || !formSituation) return;
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("afest_observations").insert({
      learner_id: formLearner,
      formateur_id: user.id,
      situation: formSituation,
      appreciation: parseInt(formAppreciation),
      commentaire: formComment || null,
    });

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      toast({ title: "Observation enregistrée ✓" });
      setDialogOpen(false);
      setFormSituation("");
      setFormComment("");
      setFormAppreciation("2");
      fetchData();
    }
    setSubmitting(false);
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
          <FileText className="h-5 w-5" />
          Suivi AFEST ({observations.length})
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" /> Exporter PDF
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={learnerIds.length === 0}>
                <Plus className="h-4 w-4 mr-1" /> Nouvelle observation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle observation AFEST</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Apprenant</Label>
                  <Select value={formLearner} onValueChange={setFormLearner}>
                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>
                      {learnerIds.map((id) => (
                        <SelectItem key={id} value={id}>
                          {learnerProfiles[id] || id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Situation de travail</Label>
                  <Input
                    value={formSituation}
                    onChange={(e) => setFormSituation(e.target.value)}
                    placeholder="Ex: Accueil d'un client au comptoir"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Appréciation (1-4)</Label>
                  <Select value={formAppreciation} onValueChange={setFormAppreciation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Non acquis</SelectItem>
                      <SelectItem value="2">2 - En cours</SelectItem>
                      <SelectItem value="3">3 - Acquis</SelectItem>
                      <SelectItem value="4">4 - Maîtrisé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Commentaire</Label>
                  <Textarea
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Observations..."
                  />
                </div>
                <Button onClick={handleCreate} disabled={submitting || !formLearner || !formSituation} className="w-full">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {observations.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Aucune observation AFEST.</p>
        ) : (
          <div className="print:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Apprenant</TableHead>
                  <TableHead>Situation</TableHead>
                  <TableHead>Appréciation</TableHead>
                  <TableHead>Commentaire</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {observations.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{new Date(o.observation_date).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>{o.learner_name}</TableCell>
                    <TableCell>{o.situation}</TableCell>
                    <TableCell>
                      <span className="font-semibold">{o.appreciation}/4</span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{o.commentaire || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

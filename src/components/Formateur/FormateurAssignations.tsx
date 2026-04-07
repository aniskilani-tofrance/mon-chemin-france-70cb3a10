import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Assignment = Tables<"assignments">;

const statusColors: Record<string, string> = {
  a_faire: "bg-muted text-muted-foreground",
  en_cours: "bg-blue-100 text-blue-800",
  termine: "bg-green-100 text-green-800",
  en_retard: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  termine: "Terminé",
  en_retard: "En retard",
};

export function FormateurAssignations() {
  const [assignments, setAssignments] = useState<(Assignment & { module_title?: string; learner_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<{ id: string; title: string }[]>([]);
  const [learnerIds, setLearnerIds] = useState<string[]>([]);
  const [learnerProfiles, setLearnerProfiles] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedLearner, setSelectedLearner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get learner IDs
    const { data: links } = await supabase
      .from("formateur_learners")
      .select("learner_id")
      .eq("formateur_id", user.id);
    const ids = links?.map((l) => l.learner_id) || [];
    setLearnerIds(ids);

    // Get profiles for names
    if (ids.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", ids);
      const map: Record<string, string> = {};
      profiles?.forEach((p) => { map[p.user_id!] = p.full_name || p.email || "—"; });
      setLearnerProfiles(map);
    }

    // Get assignments
    const { data: assigns } = await supabase
      .from("assignments")
      .select("*")
      .eq("assigned_by", user.id)
      .order("created_at", { ascending: false });

    // Get modules for titles
    const { data: mods } = await supabase
      .from("fle_modules")
      .select("id, title")
      .eq("is_active", true)
      .order("sort_order");
    setModules(mods || []);

    const moduleMap: Record<string, string> = {};
    mods?.forEach((m) => { moduleMap[m.id] = m.title; });

    setAssignments(
      (assigns || []).map((a) => ({
        ...a,
        module_title: moduleMap[a.module_id] || "—",
        learner_name: learnerProfiles[a.learner_id] || "—",
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async () => {
    if (!selectedModule || !selectedLearner) return;
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("assignments").insert({
      module_id: selectedModule,
      learner_id: selectedLearner,
      assigned_by: user.id,
      due_date: dueDate || null,
    });

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      toast({ title: "Module assigné !" });
      setDialogOpen(false);
      setSelectedModule("");
      setSelectedLearner("");
      setDueDate("");
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
          <ClipboardList className="h-5 w-5" />
          Assignations ({assignments.length})
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={learnerIds.length === 0}>
              <Plus className="h-4 w-4 mr-1" /> Assigner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assigner un module</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Apprenant</Label>
                <Select value={selectedLearner} onValueChange={setSelectedLearner}>
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
                <Label>Module</Label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    {modules.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date limite (optionnel)</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <Button onClick={handleAssign} disabled={submitting || !selectedModule || !selectedLearner} className="w-full">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assigner
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Aucune assignation.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Apprenant</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date limite</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.learner_name}</TableCell>
                  <TableCell>{a.module_title}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[a.status] || ""}>
                      {statusLabels[a.status] || a.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {a.due_date ? new Date(a.due_date).toLocaleDateString("fr-FR") : "—"}
                  </TableCell>
                  <TableCell>{a.score != null ? `${a.score}%` : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

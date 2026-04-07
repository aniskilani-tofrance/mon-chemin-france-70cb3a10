import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Headphones, Loader2, CheckCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Submission = Tables<"audio_submissions">;

export function FormateurEvaluations() {
  const [submissions, setSubmissions] = useState<(Submission & { learner_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get learner IDs
    const { data: links } = await supabase
      .from("formateur_learners")
      .select("learner_id")
      .eq("formateur_id", user.id);
    const ids = links?.map((l) => l.learner_id) || [];
    if (ids.length === 0) { setLoading(false); return; }

    const { data: subs } = await supabase
      .from("audio_submissions")
      .select("*")
      .in("learner_id", ids)
      .order("created_at", { ascending: false });

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .in("user_id", ids);

    const nameMap: Record<string, string> = {};
    profiles?.forEach((p) => { nameMap[p.user_id!] = p.full_name || p.email || "—"; });

    setSubmissions((subs || []).map((s) => ({ ...s, learner_name: nameMap[s.learner_id] || "—" })));
    setLoading(false);
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const handleReview = async (id: string, status: "validated" | "rework") => {
    setUpdating(id);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("audio_submissions")
      .update({
        status,
        formateur_comment: comments[id] || null,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      toast({ title: status === "validated" ? "Validé ✓" : "À retravailler" });
      fetchSubmissions();
    }
    setUpdating(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pending = submissions.filter((s) => s.status === "pending");
  const reviewed = submissions.filter((s) => s.status !== "pending");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            En attente de revue ({pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pending.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucune soumission en attente.</p>
          ) : (
            pending.map((s) => (
              <div key={s.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.learner_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <Badge>En attente</Badge>
                </div>
                <audio controls src={s.audio_url} className="w-full" />
                <Textarea
                  placeholder="Commentaire (optionnel)..."
                  value={comments[s.id] || ""}
                  onChange={(e) => setComments((prev) => ({ ...prev, [s.id]: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReview(s.id, "validated")}
                    disabled={updating === s.id}
                  >
                    {updating === s.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                    Valider
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReview(s.id, "rework")}
                    disabled={updating === s.id}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" /> À retravailler
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {reviewed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Déjà évaluées ({reviewed.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewed.map((s) => (
              <div key={s.id} className="border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{s.learner_name}</p>
                  <p className="text-xs text-muted-foreground">{s.formateur_comment || "Pas de commentaire"}</p>
                </div>
                <Badge variant={s.status === "validated" ? "default" : "destructive"}>
                  {s.status === "validated" ? "Validé" : "À retravailler"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

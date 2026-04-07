import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, User } from "lucide-react";

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
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearners = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get learner IDs from formateur_learners
      const { data: links } = await supabase
        .from("formateur_learners")
        .select("learner_id")
        .eq("formateur_id", user.id);

      if (!links || links.length === 0) {
        setLoading(false);
        return;
      }

      const learnerIds = links.map((l) => l.learner_id);

      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email, full_name, french_level_cecrl")
        .in("user_id", learnerIds);

      // Get progress
      const { data: progress } = await supabase
        .from("fle_user_progress")
        .select("user_id, total_xp, estimated_level, last_activity_at")
        .in("user_id", learnerIds);

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
    };

    fetchLearners();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Mes apprenants ({learners.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {learners.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aucun apprenant assigné. Contactez l'administrateur pour ajouter des apprenants.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Dernière activité</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface OnboardingRow {
  id: string;
  email: string | null;
  language: string;
  main_goal: string | null;
  target_sector: string | null;
  french_level_cecrl: string | null;
  work_right: string | null;
  literacy: string | null;
  barriers: string[] | null;
  lead_route: string | null;
  lead_score: number | null;
  completed_at: string | null;
  answers: Record<string, unknown>;
}

const goalLabels: Record<string, string> = {
  work: "Trouver un emploi",
  learn_french: "Apprendre le français",
  training: "Suivre une formation",
  admin: "Démarches administratives",
  housing: "Trouver un logement",
};

const sectorLabels: Record<string, string> = {
  btp: "BTP / Construction",
  hotellerie: "Hôtellerie-Restauration",
  aide_personne: "Aide à la personne",
  proprete: "Propreté",
  logistique: "Logistique",
  commerce: "Commerce",
  agriculture: "Agriculture",
};

export function DirecteurOnboardingResults() {
  const [results, setResults] = useState<OnboardingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<OnboardingRow | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    setLoading(true);
    const { data } = await supabase
      .from("onboarding_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    setResults((data || []) as OnboardingRow[]);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Résultats onboarding Marianne ({results.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucun résultat d'onboarding</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Langue</TableHead>
                  <TableHead>Objectif</TableHead>
                  <TableHead>Secteur</TableHead>
                  <TableHead>Niveau FR</TableHead>
                  <TableHead>Score lead</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-sm">{r.email || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{r.language.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {goalLabels[r.main_goal || ""] || r.main_goal || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {sectorLabels[r.target_sector || ""] || r.target_sector || "—"}
                    </TableCell>
                    <TableCell>
                      {r.french_level_cecrl ? (
                        <Badge variant="secondary">{r.french_level_cecrl.toUpperCase()}</Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {r.lead_score != null ? (
                        <Badge className={
                          r.lead_score >= 80 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                          r.lead_score >= 50 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }>
                          {r.lead_score}
                        </Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      {r.lead_route ? (
                        <Badge variant="outline" className="text-xs">{r.lead_route}</Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.completed_at ? new Date(r.completed_at).toLocaleDateString("fr-FR") : "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedResult(r)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détail onboarding — {selectedResult?.email || "Anonyme"}</DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <DetailRow label="Langue" value={selectedResult.language.toUpperCase()} />
                <DetailRow label="Objectif" value={goalLabels[selectedResult.main_goal || ""] || selectedResult.main_goal} />
                <DetailRow label="Secteur visé" value={sectorLabels[selectedResult.target_sector || ""] || selectedResult.target_sector} />
                <DetailRow label="Niveau français" value={selectedResult.french_level_cecrl?.toUpperCase()} />
                <DetailRow label="Droit au travail" value={selectedResult.work_right} />
                <DetailRow label="Littéracie" value={selectedResult.literacy} />
                <DetailRow label="Score lead" value={selectedResult.lead_score?.toString()} />
                <DetailRow label="Route" value={selectedResult.lead_route} />
              </div>

              {selectedResult.barriers && selectedResult.barriers.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Freins identifiés</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedResult.barriers.map((b, i) => (
                      <Badge key={i} variant="destructive" className="text-xs">{b}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-foreground mb-1">Réponses complètes</p>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-60">
                  {JSON.stringify(selectedResult.answers, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

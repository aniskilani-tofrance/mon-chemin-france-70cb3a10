import { useEffect, useState } from "react";
import { RefreshCcw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface HubSpotSyncLog {
  id: string;
  diagnostic_type: "marianne" | "shared_diagnostic";
  diagnostic_id: string;
  hubspot_contact_id: string | null;
  hubspot_company_id: string | null;
  hubspot_deal_id: string | null;
  score_qualification: number | null;
  status: "success" | "failure" | "warning";
  error_message: string | null;
  created_at: string;
}

const statusVariant: Record<HubSpotSyncLog["status"], "default" | "destructive" | "secondary"> = {
  success: "default",
  warning: "secondary",
  failure: "destructive",
};

const statusLabel: Record<HubSpotSyncLog["status"], string> = {
  success: "Succès",
  warning: "À vérifier",
  failure: "Échec",
};

export function AdminHubSpotSyncLogs() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<HubSpotSyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("hubspot_diagnostic_sync_logs")
      .select("id, diagnostic_type, diagnostic_id, hubspot_contact_id, hubspot_company_id, hubspot_deal_id, score_qualification, status, error_message, created_at")
      .order("created_at", { ascending: false })
      .limit(25);

    if (error) {
      toast({ variant: "destructive", title: "Erreur HubSpot", description: error.message });
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Synchronisations HubSpot</CardTitle>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Diagnostic</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>HubSpot</TableHead>
              <TableHead>Erreur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  {loading ? "Chargement…" : "Aucune synchronisation HubSpot pour le moment"}
                </TableCell>
              </TableRow>
            ) : logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(log.created_at).toLocaleString("fr-FR")}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{log.diagnostic_type === "marianne" ? "Marianne" : "Partagé"}</div>
                  <div className="max-w-[180px] truncate text-xs text-muted-foreground">{log.diagnostic_id}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[log.status]}>{statusLabel[log.status]}</Badge>
                </TableCell>
                <TableCell>{log.score_qualification ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {log.hubspot_contact_id && <span className="inline-flex items-center gap-1">Contact <ExternalLink className="h-3 w-3" /></span>}
                    {log.hubspot_company_id && <span>Entreprise</span>}
                    {log.hubspot_deal_id && <span>Deal</span>}
                    {!log.hubspot_contact_id && !log.hubspot_deal_id && "—"}
                  </div>
                </TableCell>
                <TableCell className="max-w-[260px] truncate text-sm text-muted-foreground">
                  {log.error_message || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

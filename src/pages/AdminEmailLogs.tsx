import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, RefreshCw, Search, Mail, AlertTriangle, CheckCircle2, XCircle, Inbox } from "lucide-react";
import { Link } from "react-router-dom";

type EmailStatus = "sent" | "failed" | "permanent_failed";

interface EmailLog {
  id: string;
  template: string;
  source_function: string | null;
  recipient: string;
  subject: string | null;
  status: EmailStatus;
  http_status: number | null;
  attempts: number;
  duration_ms: number | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const STATUS_LABEL: Record<EmailStatus, string> = {
  sent: "Envoyé",
  failed: "Échec (transitoire)",
  permanent_failed: "Échec définitif",
};

function StatusBadge({ status }: { status: EmailStatus }) {
  if (status === "sent") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 hover:bg-emerald-500/20">
        <CheckCircle2 className="h-3 w-3 mr-1" /> {STATUS_LABEL[status]}
      </Badge>
    );
  }
  if (status === "permanent_failed") {
    return (
      <Badge className="bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/20">
        <XCircle className="h-3 w-3 mr-1" /> {STATUS_LABEL[status]}
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-500/15 text-amber-700 border border-amber-500/30 hover:bg-amber-500/20">
      <AlertTriangle className="h-3 w-3 mr-1" /> {STATUS_LABEL[status]}
    </Badge>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AdminEmailLogs() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EmailStatus>("all");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [rangeHours, setRangeHours] = useState<number>(24 * 7);
  const [selected, setSelected] = useState<EmailLog | null>(null);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - rangeHours * 3600 * 1000).toISOString();
    const { data, error } = await supabase
      .from("email_logs")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(500);

    if (!error && data) {
      setLogs(data as EmailLog[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeHours]);

  const templates = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => set.add(l.template));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (templateFilter !== "all" && l.template !== templateFilter) return false;
      if (!q) return true;
      return (
        l.recipient.toLowerCase().includes(q) ||
        (l.subject ?? "").toLowerCase().includes(q) ||
        l.template.toLowerCase().includes(q) ||
        (l.error_message ?? "").toLowerCase().includes(q)
      );
    });
  }, [logs, search, statusFilter, templateFilter]);

  const stats = useMemo(() => {
    const sent = logs.filter((l) => l.status === "sent").length;
    const failed = logs.filter((l) => l.status === "failed").length;
    const permanent = logs.filter((l) => l.status === "permanent_failed").length;
    const total = logs.length;
    const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;
    return { sent, failed, permanent, total, successRate };
  }, [logs]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Suivi des emails — Admin" description="Logs d'envoi des emails Outlook" />
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin" className="hover:underline">Admin</Link>
              <span>›</span>
              <span>Suivi des emails</span>
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Mail className="h-7 w-7" /> Suivi des envois
            </h1>
            <p className="text-muted-foreground mt-1">
              Journal de tous les emails envoyés via le connecteur Outlook.
            </p>
          </div>
          <Button onClick={load} variant="outline" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Rafraîchir
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Envoyés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{stats.sent}</div>
              <div className="text-xs text-muted-foreground">{stats.successRate}% de succès</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Échecs transitoires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{stats.failed}</div>
              <div className="text-xs text-muted-foreground">retentés au prochain cycle</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Échecs définitifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.permanent}</div>
              <div className="text-xs text-muted-foreground">action requise</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Destinataire, sujet, erreur…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="sent">Envoyés</SelectItem>
                  <SelectItem value="failed">Échecs transitoires</SelectItem>
                  <SelectItem value="permanent_failed">Échecs définitifs</SelectItem>
                </SelectContent>
              </Select>
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger><SelectValue placeholder="Type d'email" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(rangeHours)} onValueChange={(v) => setRangeHours(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Période" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Dernière heure</SelectItem>
                  <SelectItem value="24">24 dernières heures</SelectItem>
                  <SelectItem value={String(24 * 7)}>7 derniers jours</SelectItem>
                  <SelectItem value={String(24 * 30)}>30 derniers jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <Inbox className="h-10 w-10 mb-3" />
                <p>Aucun envoi pour ces filtres.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Destinataire</TableHead>
                      <TableHead>Sujet</TableHead>
                      <TableHead className="text-center">Tentatives</TableHead>
                      <TableHead className="text-right">Détails</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs whitespace-nowrap">{formatDate(log.created_at)}</TableCell>
                        <TableCell><StatusBadge status={log.status} /></TableCell>
                        <TableCell className="text-xs font-mono">{log.template}</TableCell>
                        <TableCell className="text-sm">{log.recipient}</TableCell>
                        <TableCell className="text-sm max-w-[300px] truncate">{log.subject ?? "—"}</TableCell>
                        <TableCell className="text-center text-sm">{log.attempts}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => setSelected(log)}>
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'envoi</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><StatusBadge status={selected.status} /></div>
              <dl className="grid grid-cols-3 gap-2">
                <dt className="text-muted-foreground">Date</dt>
                <dd className="col-span-2">{formatDate(selected.created_at)}</dd>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="col-span-2 font-mono text-xs">{selected.template}</dd>
                <dt className="text-muted-foreground">Fonction</dt>
                <dd className="col-span-2 font-mono text-xs">{selected.source_function ?? "—"}</dd>
                <dt className="text-muted-foreground">Destinataire</dt>
                <dd className="col-span-2">{selected.recipient}</dd>
                <dt className="text-muted-foreground">Sujet</dt>
                <dd className="col-span-2">{selected.subject ?? "—"}</dd>
                <dt className="text-muted-foreground">Tentatives</dt>
                <dd className="col-span-2">{selected.attempts}</dd>
                <dt className="text-muted-foreground">Code HTTP</dt>
                <dd className="col-span-2">{selected.http_status ?? "—"}</dd>
                <dt className="text-muted-foreground">Durée</dt>
                <dd className="col-span-2">{selected.duration_ms ? `${selected.duration_ms} ms` : "—"}</dd>
              </dl>
              {selected.error_message && (
                <div>
                  <div className="text-muted-foreground mb-1">Erreur</div>
                  <pre className="bg-muted p-3 rounded text-xs whitespace-pre-wrap break-words max-h-40 overflow-auto">
                    {selected.error_message}
                  </pre>
                </div>
              )}
              {selected.metadata && Object.keys(selected.metadata).length > 0 && (
                <div>
                  <div className="text-muted-foreground mb-1">Métadonnées</div>
                  <pre className="bg-muted p-3 rounded text-xs whitespace-pre-wrap break-words">
                    {JSON.stringify(selected.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

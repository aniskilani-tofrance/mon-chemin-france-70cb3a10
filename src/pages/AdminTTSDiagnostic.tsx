import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, AlertCircle, CheckCircle2, Volume2, Play, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

const TEST_TEXT_FR = "Bonjour, je suis Marianne, votre conseillère ToFrance. Je peux vous accompagner dans vos démarches d'orientation, votre formation en français, et l'accès à vos heures OFII gratuites.";

interface TTSLog {
  id: string;
  created_at: string;
  request_id: string | null;
  provider: string;
  language: string | null;
  voice_id: string | null;
  status_code: number | null;
  success: boolean;
  latency_ms: number | null;
  attempt: number | null;
  error_message: string | null;
  text_chars: number | null;
  circuit_open: boolean | null;
}

export default function AdminTTSDiagnostic() {
  const [logs, setLogs] = useState<TTSLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ provider: string; latency_ms: number; request_id?: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const runVoiceTest = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    const t0 = performance.now();
    try {
      const { data, error } = await supabase.functions.invoke("openai-tts", {
        body: { text: TEST_TEXT_FR, language: "fr" },
      });
      const latency = Math.round(performance.now() - t0);
      if (error || !data?.audio_base64) {
        throw new Error(error?.message || data?.error || "Pas d'audio reçu");
      }
      const provider = data.provider || "unknown";
      setTestResult({ provider, latency_ms: latency, request_id: data.request_id });
      toast.success(`Voix générée via ${provider} en ${latency}ms`);

      // Play
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(`data:audio/mpeg;base64,${data.audio_base64}`);
      audioRef.current = audio;
      audio.play().catch(e => console.warn("Lecture refusée:", e));

      // Refresh logs after a beat so the new entry shows up
      setTimeout(() => fetchLogs(), 800);
    } catch (e) {
      toast.error(`Échec du test : ${(e as Error).message}`);
      setTestResult({ provider: "error", latency_ms: Math.round(performance.now() - t0) });
    } finally {
      setTesting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("tts_logs" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (providerFilter !== "all") query = query.eq("provider", providerFilter);
    if (statusFilter === "success") query = query.eq("success", true);
    if (statusFilter === "error") query = query.eq("success", false);

    const { data, error } = await query;
    if (!error && data) setLogs(data as unknown as TTSLog[]);
    setLoading(false);
  }, [providerFilter, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.success).length,
    elevenlabs: logs.filter(l => l.provider === "elevenlabs").length,
    openai: logs.filter(l => l.provider === "openai").length,
    avgLatency: logs.length
      ? Math.round(logs.filter(l => l.latency_ms).reduce((s, l) => s + (l.latency_ms || 0), 0) / logs.filter(l => l.latency_ms).length || 0)
      : 0,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEO title="Diagnostic TTS — Admin ToFrance" description="Logs des appels TTS (ElevenLabs / OpenAI)" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Volume2 className="h-7 w-7" />
            Diagnostic TTS
          </h1>
          <p className="text-muted-foreground mt-1">
            200 derniers appels à <code>openai-tts</code> (ElevenLabs + fallback OpenAI)
          </p>
        </div>
        <Button onClick={fetchLogs} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Rafraîchir
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Succès</p><p className="text-2xl font-bold text-green-600">{stats.success}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">ElevenLabs</p><p className="text-2xl font-bold">{stats.elevenlabs}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">OpenAI (fallback)</p><p className="text-2xl font-bold">{stats.openai}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Latence moy.</p><p className="text-2xl font-bold">{stats.avgLatency}ms</p></CardContent></Card>
      </div>

      {/* Voice test */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Play className="h-4 w-4" /> Tester la voix Marianne (FR)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground italic">"{TEST_TEXT_FR}"</p>
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={runVoiceTest} disabled={testing}>
              {testing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Génération…</>
              ) : (
                <><Play className="h-4 w-4 mr-2" /> Lancer le test</>
              )}
            </Button>
            {testResult && (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={testResult.provider === "elevenlabs" ? "default" : testResult.provider === "openai" ? "secondary" : "destructive"}>
                  Provider : {testResult.provider}
                </Badge>
                <Badge variant="outline">{testResult.latency_ms}ms (round-trip)</Badge>
                {testResult.request_id && (
                  <Badge variant="outline" className="font-mono text-xs">
                    req: {testResult.request_id.slice(0, 8)}
                  </Badge>
                )}
                {testResult.provider === "elevenlabs" && (
                  <span className="text-xs text-green-600">✓ Voix native Charlotte</span>
                )}
                {testResult.provider === "openai" && (
                  <span className="text-xs text-amber-600">⚠ Fallback OpenAI actif</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader><CardTitle className="text-base">Filtres</CardTitle></CardHeader>
        <CardContent className="flex gap-4">
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Provider" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les providers</SelectItem>
              <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="none">Aucun</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="success">Succès uniquement</SelectItem>
              <SelectItem value="error">Erreurs uniquement</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Logs table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Logs détaillés</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quand</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Lang</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Latence</TableHead>
                  <TableHead>Try</TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Erreur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.provider === "elevenlabs" ? "default" : "secondary"}>
                        {log.provider}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.language || "—"}</TableCell>
                    <TableCell>
                      {log.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.status_code ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{log.latency_ms ? `${log.latency_ms}ms` : "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{log.attempt ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.request_id ? log.request_id.slice(0, 8) : "—"}
                    </TableCell>
                    <TableCell className="text-xs max-w-[300px] truncate text-destructive" title={log.error_message ?? ""}>
                      {log.error_message || "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && !loading && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Aucun log</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

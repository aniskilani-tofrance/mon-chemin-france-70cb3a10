import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { CalendarPlus, KeyRound, Loader2, Plus, RefreshCw } from "lucide-react";
import { normalizeMarianneAccessCode } from "@/lib/marianneAccessCode";

type MarianneAccessCode = {
  id: string;
  code: string;
  label: string | null;
  expires_at: string | null;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
};

const emptyForm = {
  code: "",
  label: "",
  expires_at: "",
  max_uses: 1,
};

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function formatDate(value: string | null) {
  if (!value) return "Sans expiration";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeCode(value: string) {
  return normalizeMarianneAccessCode(value).slice(0, 12);
}

export function AdminMarianneCodes() {
  const [codes, setCodes] = useState<MarianneAccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<MarianneAccessCode | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("marianne_access_codes")
      .select("id, code, label, expires_at, max_uses, used_count, is_active, last_used_at, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      setCodes((data || []) as MarianneAccessCode[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const stats = useMemo(() => {
    const active = codes.filter((code) => code.is_active && (!code.expires_at || new Date(code.expires_at) > new Date())).length;
    const availableUses = codes.reduce((sum, code) => sum + Math.max(0, code.max_uses - code.used_count), 0);
    return { active, availableUses };
  }, [codes]);

  const openCreate = () => {
    setEditingCode(null);
    setForm({ ...emptyForm, expires_at: toDatetimeLocal(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()) });
    setDialogOpen(true);
  };

  const openEdit = (code: MarianneAccessCode) => {
    setEditingCode(code);
    setForm({
      code: code.code,
      label: code.label || "",
      expires_at: toDatetimeLocal(code.expires_at),
      max_uses: code.max_uses,
    });
    setDialogOpen(true);
  };

  const generateCode = async () => {
    const { data, error } = await supabase.rpc("generate_access_code");
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }
    setForm((current) => ({ ...current, code: normalizeCode(String(data || "")) }));
  };

  const handleSave = async () => {
    const cleanedCode = normalizeCode(form.code);
    if (cleanedCode.length < 4 || cleanedCode.length > 12) {
      toast({ variant: "destructive", title: "Code invalide", description: "Le code doit contenir entre 4 et 12 caractères." });
      return;
    }
    if (form.max_uses < 1) {
      toast({ variant: "destructive", title: "Nombre invalide", description: "Le nombre d’utilisations doit être supérieur à 0." });
      return;
    }

    setSaving(true);
    const payload = {
      code: cleanedCode,
      label: form.label.trim() || null,
      expires_at: fromDatetimeLocal(form.expires_at),
      max_uses: form.max_uses,
      updated_at: new Date().toISOString(),
    };

    const { error } = editingCode
      ? await supabase.from("marianne_access_codes").update(payload).eq("id", editingCode.id)
      : await supabase.from("marianne_access_codes").insert(payload);

    setSaving(false);
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }

    toast({ title: editingCode ? "Code Marianne modifié" : "Code Marianne créé" });
    setDialogOpen(false);
    fetchCodes();
  };

  const toggleActive = async (code: MarianneAccessCode) => {
    const { error } = await supabase
      .from("marianne_access_codes")
      .update({ is_active: !code.is_active, updated_at: new Date().toISOString() })
      .eq("id", code.id);

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      fetchCodes();
    }
  };

  const extendCode = async (code: MarianneAccessCode, days: number) => {
    const baseDate = code.expires_at && new Date(code.expires_at) > new Date() ? new Date(code.expires_at) : new Date();
    baseDate.setDate(baseDate.getDate() + days);

    const { error } = await supabase
      .from("marianne_access_codes")
      .update({ expires_at: baseDate.toISOString(), is_active: true, updated_at: new Date().toISOString() })
      .eq("id", code.id);

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      toast({ title: `Code prolongé de ${days} jours` });
      fetchCodes();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Codes d’accès Marianne
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats.active} code{stats.active > 1 ? "s" : ""} actif{stats.active > 1 ? "s" : ""} · {stats.availableUses} utilisation{stats.availableUses > 1 ? "s" : ""} disponible{stats.availableUses > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={fetchCodes} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCode ? "Modifier le code" : "Créer un code Marianne"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="marianne-code">Code *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="marianne-code"
                      value={form.code}
                      onChange={(event) => setForm({ ...form, code: normalizeCode(event.target.value) })}
                      placeholder="MARIANNE1"
                      className="font-mono uppercase"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={generateCode} title="Générer un code">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marianne-label">Libellé</Label>
                  <Input
                    id="marianne-label"
                    value={form.label}
                    onChange={(event) => setForm({ ...form, label: event.target.value })}
                    placeholder="Cohorte pilote, partenaire, événement…"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="marianne-expires">Expiration</Label>
                    <Input
                      id="marianne-expires"
                      type="datetime-local"
                      value={form.expires_at}
                      onChange={(event) => setForm({ ...form, expires_at: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marianne-uses">Utilisations max.</Label>
                    <Input
                      id="marianne-uses"
                      type="number"
                      min={1}
                      value={form.max_uses}
                      onChange={(event) => setForm({ ...form, max_uses: Math.max(1, Number(event.target.value)) })}
                    />
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCode ? "Enregistrer" : "Créer le code"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Usages</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Aucun code Marianne enregistré
                  </TableCell>
                </TableRow>
              ) : (
                codes.map((code) => {
                  const expired = code.expires_at ? new Date(code.expires_at) <= new Date() : false;
                  const exhausted = code.used_count >= code.max_uses;
                  return (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-medium">{code.code}</TableCell>
                      <TableCell>{code.label || "—"}</TableCell>
                      <TableCell>{formatDate(code.expires_at)}</TableCell>
                      <TableCell>
                        {code.used_count} / {code.max_uses}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Switch checked={code.is_active} onCheckedChange={() => toggleActive(code)} />
                          <div className="flex flex-wrap gap-1">
                            <Badge variant={code.is_active && !expired && !exhausted ? "default" : "secondary"}>
                              {code.is_active ? "Actif" : "Désactivé"}
                            </Badge>
                            {expired && <Badge variant="destructive">Expiré</Badge>}
                            {exhausted && <Badge variant="outline">Utilisé</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => extendCode(code, 7)}>
                            <CalendarPlus className="mr-1 h-4 w-4" />
                            +7j
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => extendCode(code, 30)}>
                            <CalendarPlus className="mr-1 h-4 w-4" />
                            +30j
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(code)}>
                            Modifier
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
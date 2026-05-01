import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Loader2, Users, Check } from "lucide-react";
import { toast } from "sonner";

interface SourceOption {
  id: string;
  name: string;
  type: string | null;
  count: number;
}

interface LearnerRow {
  learner_id: string;
  email: string | null;
  full_name: string | null;
  city: string | null;
  postal_code: string | null;
  french_level_cecrl: string | null;
  source_name: string | null;
  already_attached: boolean;
  created_at: string;
}

interface Props {
  onImported?: () => void;
}

export function ImportFromSourceDialog({ onImported }: Props) {
  const [open, setOpen] = useState(false);
  const [loadingSources, setLoadingSources] = useState(false);
  const [loadingLearners, setLoadingLearners] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [sources, setSources] = useState<SourceOption[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [learners, setLearners] = useState<LearnerRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setLoadingSources(true);
    supabase.functions
      .invoke("formateur-import-from-source", { body: { action: "sources" } })
      .then(({ data, error }) => {
        if (error || data?.error) {
          toast.error(data?.error || error?.message || "Erreur de chargement");
          return;
        }
        setSources(data?.sources || []);
      })
      .finally(() => setLoadingSources(false));
  }, [open]);

  useEffect(() => {
    if (!selectedSource) { setLearners([]); setSelected(new Set()); return; }
    setLoadingLearners(true);
    supabase.functions
      .invoke("formateur-import-from-source", {
        body: { action: "list", source_id: selectedSource },
      })
      .then(({ data, error }) => {
        if (error || data?.error) {
          toast.error(data?.error || error?.message || "Erreur");
          return;
        }
        const rows: LearnerRow[] = data?.learners || [];
        setLearners(rows);
        // Pré-sélectionner ceux non encore rattachés
        setSelected(new Set(rows.filter((r) => !r.already_attached).map((r) => r.learner_id)));
      })
      .finally(() => setLoadingLearners(false));
  }, [selectedSource]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const attach = async () => {
    const ids = Array.from(selected);
    if (!ids.length) { toast.error("Sélectionnez au moins un apprenant"); return; }
    setAttaching(true);
    try {
      const { data, error } = await supabase.functions.invoke("formateur-import-from-source", {
        body: { action: "attach", learner_ids: ids },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast.success(`${ids.length} apprenant(s) rattaché(s) au centre`);
      onImported?.();
      setOpen(false);
      setSelectedSource("");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du rattachement");
    } finally {
      setAttaching(false);
    }
  };

  const selectableCount = learners.filter((l) => !l.already_attached).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Building2 className="mr-2 h-4 w-4" />
          Importer depuis un centre
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Rattacher des apprenants depuis un centre</DialogTitle>
          <DialogDescription>
            Choisissez un lieu partenaire (Aurore, Emmaüs, MDQ Landy…) pour récupérer
            les apprenants qui s'y sont inscrits et les ajouter à votre liste.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Centre / lieu partenaire</label>
            <Select value={selectedSource} onValueChange={setSelectedSource} disabled={loadingSources}>
              <SelectTrigger>
                <SelectValue placeholder={loadingSources ? "Chargement…" : "Sélectionnez un centre"} />
              </SelectTrigger>
              <SelectContent>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} <span className="text-muted-foreground">({s.count} profil{s.count > 1 ? "s" : ""})</span>
                  </SelectItem>
                ))}
                {!sources.length && !loadingSources && (
                  <div className="p-3 text-sm text-muted-foreground">Aucun centre identifié</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedSource && (
            <div className="border rounded-lg max-h-[360px] overflow-y-auto">
              {loadingLearners ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : learners.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Aucun apprenant trouvé pour ce centre
                </div>
              ) : (
                <div className="divide-y">
                  {learners.map((l) => (
                    <label
                      key={l.learner_id}
                      className={`flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer ${l.already_attached ? "opacity-60" : ""}`}
                    >
                      <Checkbox
                        checked={selected.has(l.learner_id)}
                        onCheckedChange={() => toggle(l.learner_id)}
                        disabled={l.already_attached}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {l.full_name || l.email || "Sans nom"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {l.email}
                          {l.city && ` · ${l.city}`}
                          {l.postal_code && ` (${l.postal_code})`}
                        </div>
                      </div>
                      {l.french_level_cecrl && (
                        <Badge variant="outline" className="uppercase">{l.french_level_cecrl}</Badge>
                      )}
                      {l.already_attached && (
                        <Badge variant="secondary" className="gap-1">
                          <Check className="h-3 w-3" /> rattaché
                        </Badge>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedSource && learners.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {selected.size} sélectionné(s) sur {selectableCount} disponible(s)
              </span>
              <button
                type="button"
                className="underline hover:text-foreground"
                onClick={() => {
                  if (selected.size === selectableCount) setSelected(new Set());
                  else setSelected(new Set(learners.filter((l) => !l.already_attached).map((l) => l.learner_id)));
                }}
              >
                {selected.size === selectableCount ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={attach} disabled={attaching || selected.size === 0}>
            {attaching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Rattacher {selected.size > 0 ? `(${selected.size})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

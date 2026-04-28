import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BarChart3, Brain, Check, Loader2, Map, SlidersHorizontal } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  EXPERIENCE_CATEGORY_LABELS,
  type CompetenceScore,
  type ExperienceCategory,
  getScoreExplanation,
  saveExperiencesAndScore,
} from "@/lib/sharedDiagnosticCompetences";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const categories = Object.keys(EXPERIENCE_CATEGORY_LABELS) as ExperienceCategory[];

const activitySuggestions: Record<ExperienceCategory, string[]> = {
  travail: ["accueil client", "nettoyage", "cuisine", "vente", "chantier", "stock", "caisse", "livraison"],
  famille: ["garder des enfants", "gérer le budget", "organiser les repas", "prendre rendez-vous", "aider un proche", "documents administratifs"],
  benevolat: ["aider une association", "traduire", "distribuer", "organiser", "accueillir", "écouter"],
  pays_origine: ["commerce", "agriculture", "couture", "mécanique", "enseignement", "soin", "restaurant", "gestion"],
};

const tabs = [
  { id: "cartographie", label: "Cartographie", icon: Map },
  { id: "evaluation", label: "Auto-évaluation", icon: SlidersHorizontal },
  { id: "synthese", label: "Synthèse", icon: BarChart3 },
] as const;

type TabId = (typeof tabs)[number]["id"];

type ExperienceDraft = Record<ExperienceCategory, { description: string; activities: string[] }>;

const emptyDraft: ExperienceDraft = {
  travail: { description: "", activities: [] },
  famille: { description: "", activities: [] },
  benevolat: { description: "", activities: [] },
  pays_origine: { description: "", activities: [] },
};

interface SharedDiagnosticCompetenceStepProps {
  diagnosticId: string;
  onBack: () => void;
  onDone: () => void;
  completed: boolean;
}

export function SharedDiagnosticCompetenceStep({ diagnosticId, onBack, onDone, completed }: SharedDiagnosticCompetenceStepProps) {
  const [activeTab, setActiveTab] = useState<TabId>("cartographie");
  const [draft, setDraft] = useState<ExperienceDraft>(emptyDraft);
  const [scores, setScores] = useState<CompetenceScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: experiences }, { data: existingScores }] = await Promise.all([
        supabase.from("shared_diagnostic_experiences").select("category, description, activities").eq("diagnostic_id", diagnosticId),
        supabase
          .from("shared_diagnostic_competence_scores")
          .select("competence_key, competence_label, domain, score, level, detected_from, evidence")
          .eq("diagnostic_id", diagnosticId)
          .order("score", { ascending: false }),
      ]);
      if (cancelled) return;
      const nextDraft: ExperienceDraft = structuredClone(emptyDraft);
      (experiences || []).forEach((row: any) => {
        if (row.category in nextDraft) {
          nextDraft[row.category as ExperienceCategory] = {
            description: row.description || "",
            activities: row.activities || [],
          };
        }
      });
      setDraft(nextDraft);
      setScores((existingScores || []) as CompetenceScore[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [diagnosticId]);

  const hasExperience = useMemo(
    () => categories.some((category) => draft[category].description.trim() || draft[category].activities.length),
    [draft]
  );

  const radarData = scores.slice(0, 8).map((score) => ({ skill: score.competence_label, value: score.score }));

  const toggleActivity = (category: ExperienceCategory, activity: string) => {
    setDraft((prev) => {
      const current = prev[category].activities;
      const activities = current.includes(activity)
        ? current.filter((item) => item !== activity)
        : [...current, activity];
      return { ...prev, [category]: { ...prev[category], activities } };
    });
  };

  const detectCompetences = async () => {
    if (!hasExperience) {
      toast.info("Ajoutez au moins une expérience avant de détecter les compétences.");
      return;
    }
    setSaving(true);
    try {
      const result = await saveExperiencesAndScore(
        categories.map((category) => ({
          diagnostic_id: diagnosticId,
          category,
          description: draft[category].description,
          activities: draft[category].activities,
        }))
      );
      setScores(result);
      setActiveTab("evaluation");
      if (result.length) toast.success(`${result.length} compétence(s) détectée(s).`);
    } catch (error: any) {
      toast.error("Détection impossible : " + (error.message || "erreur inconnue"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Chargement du module compétences…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-2 border-primary/20 bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge className="mb-3 gap-1.5" variant="outline"><Brain className="h-3 w-3" /> Vos compétences</Badge>
            <h2 className="text-2xl font-bold tracking-tight">Révéler les compétences cachées</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Cartographiez les expériences de vie, puis ToFrance détecte les compétences transférables avec un score clair.
            </p>
          </div>
          {completed && <Badge className="bg-success text-success-foreground"><Check className="mr-1 h-3 w-3" /> Étape validée</Badge>}
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                  activeTab === tab.id ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "cartographie" && (
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <Card key={category}>
              <CardContent className="p-5">
                <h3 className="mb-3 font-bold">{EXPERIENCE_CATEGORY_LABELS[category]}</h3>
                <Textarea
                  value={draft[category].description}
                  onChange={(event) => setDraft((prev) => ({ ...prev, [category]: { ...prev[category], description: event.target.value } }))}
                  placeholder="Décrivez ce que la personne a fait, organisé, aidé, vendu, réparé, appris…"
                  className="min-h-[110px]"
                  maxLength={5000}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {activitySuggestions[category].map((activity) => (
                    <label key={activity} className="flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 text-xs">
                      <Checkbox checked={draft[category].activities.includes(activity)} onCheckedChange={() => toggleActivity(category, activity)} />
                      {activity}
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="md:col-span-2 flex justify-end">
            <Button onClick={detectCompetences} disabled={saving || !hasExperience} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              Détecter les compétences
            </Button>
          </div>
        </div>
      )}

      {activeTab === "evaluation" && (
        <div className="space-y-3">
          {scores.length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-muted-foreground">Aucune compétence détectée pour le moment. Complétez la cartographie des expériences.</CardContent></Card>
          ) : scores.map((score) => (
            <Card key={score.competence_key}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{score.competence_label}</h3>
                      <Badge variant="outline">{score.domain}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{getScoreExplanation(score.score)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{score.score}/100</div>
                    <Badge>{score.level}</Badge>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${score.score}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="flex justify-end">
            <Button onClick={() => setActiveTab("synthese")} disabled={!scores.length} className="gap-2">
              Voir la synthèse <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {activeTab === "synthese" && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 font-bold">Radar des compétences</h3>
              <div className="h-80">
                {radarData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="72%">
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.22} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground">Détectez les compétences pour générer le radar.</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold">Compétences prioritaires</h3>
              <div className="space-y-2">
                {scores.slice(0, 5).map((score, index) => (
                  <div key={score.competence_key} className="rounded-lg border p-3">
                    <div className="flex justify-between gap-3 text-sm font-semibold">
                      <span>{index + 1}. {score.competence_label}</span>
                      <span>{score.score}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">À valoriser dans le projet professionnel.</p>
                  </div>
                ))}
              </div>
              <Button onClick={onDone} disabled={!scores.length} className="mt-5 w-full gap-2 bg-success text-success-foreground hover:bg-success/90">
                <Check className="h-4 w-4" /> Valider l’étape compétences
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Retour</Button>
        <Button onClick={onDone} disabled={!scores.length} className="gap-2">
          Continuer le diagnostic <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

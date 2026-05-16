import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Briefcase, GraduationCap, Home, Tag, X, ChevronLeft, ChevronRight, Loader2,
  Check, AlertCircle, Lightbulb, KeyRound, Building2, MapPin, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ProviderType = "employer" | "training_org" | "housing";

export interface PartnerFormState {
  name: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  provider_type: ProviderType;
  city: string;
  postal_code: string;
  address: string;
  is_active: boolean;
  create_access: boolean;
  tags: string[];
}

const URL_RX = /^(https?:\/\/)[^\s]+\.[^\s]+$/i;
const EMAIL_RX = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const POSTAL_RX = /^\d{4,5}$/;

const step1Schema = z.object({
  provider_type: z.enum(["employer", "training_org", "housing"]),
  name: z.string().trim().min(2, "Le nom doit faire au moins 2 caractères").max(150, "Nom trop long"),
  email: z.string().trim().regex(EMAIL_RX, "Email invalide").max(255),
});

const step2Schema = z.object({
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  website: z
    .string()
    .trim()
    .max(255)
    .refine((v) => !v || URL_RX.test(v), "URL invalide (doit commencer par http(s)://)")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  postal_code: z
    .string()
    .trim()
    .max(10)
    .refine((v) => !v || POSTAL_RX.test(v), "Code postal invalide")
    .optional()
    .or(z.literal("")),
});

const step3Schema = z.object({
  description: z.string().trim().max(2000, "Description trop longue (2000 caractères max)").optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(40)).max(50, "Maximum 50 tags"),
});

const TYPE_META: Record<ProviderType, { label: string; icon: typeof Briefcase; desc: string }> = {
  training_org: { label: "Organisme de formation", icon: GraduationCap, desc: "Formations, certifications, accompagnement pédagogique" },
  employer: { label: "Employeur", icon: Briefcase, desc: "Recruteur, entreprise, opportunités d'emploi" },
  housing: { label: "Hébergeur", icon: Home, desc: "Solutions de logement, hébergement temporaire" },
};

const TAG_SUGGESTIONS_BY_TYPE: Record<ProviderType, string[]> = {
  training_org: ["FLE", "Alphabétisation", "Pré-qualifiant", "Numérique", "Sanitaire & social", "BTP", "Restauration", "Anglais", "Qualiopi"],
  employer: ["CDI", "CDD", "Intérim", "Saisonnier", "Restauration", "BTP", "Logistique", "Aide à la personne", "Industrie", "Ménage"],
  housing: ["CHRS", "CADA", "Foyer jeunes", "Pension de famille", "Hébergement d'urgence", "Logement adapté", "Familles", "Femmes seules"],
};

const STEPS = [
  { key: "identity", label: "Identité", icon: Building2 },
  { key: "contact", label: "Coordonnées", icon: MapPin },
  { key: "profile", label: "Profil & tags", icon: Tag },
  { key: "access", label: "Accès & récap", icon: KeyRound },
] as const;

type StepKey = typeof STEPS[number]["key"];

interface PartnerWizardProps {
  form: PartnerFormState;
  setForm: (f: PartnerFormState) => void;
  onSubmit: () => Promise<void> | void;
  saving: boolean;
  editing: boolean;
  existingTags?: string[];
  onCancel?: () => void;
}

export function PartnerWizard({
  form, setForm, onSubmit, saving, editing, existingTags = [], onCancel,
}: PartnerWizardProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState("");

  const step = STEPS[stepIdx].key as StepKey;
  const update = (patch: Partial<PartnerFormState>) => setForm({ ...form, ...patch });

  // Completion score (0–100) computed across all fields
  const completion = useMemo(() => {
    let score = 0;
    const w = (cond: boolean, n: number) => { if (cond) score += n; };
    w(!!form.name.trim(), 15);
    w(EMAIL_RX.test(form.email.trim()), 15);
    w(!!form.provider_type, 5);
    w(!!form.phone.trim(), 8);
    w(!form.website || URL_RX.test(form.website), 0);
    w(!!form.website.trim() && URL_RX.test(form.website), 10);
    w(!!form.city.trim(), 7);
    w(!!form.postal_code.trim() && POSTAL_RX.test(form.postal_code), 5);
    w(!!form.address.trim(), 5);
    w((form.description || "").trim().length >= 80, 15);
    w(form.tags.length >= 3, 10);
    w(form.tags.length >= 6, 5);
    return Math.min(100, score);
  }, [form]);

  // Suggestions to improve completeness
  const suggestions = useMemo(() => {
    const s: string[] = [];
    if ((form.description || "").trim().length < 80)
      s.push("Décrivez l'activité en au moins 80 caractères pour aider au matching.");
    if (form.tags.length < 3) s.push("Ajoutez au moins 3 tags (compétences, secteurs, langues).");
    if (!form.website.trim()) s.push("Renseignez le site web pour rassurer les bénéficiaires.");
    if (!form.phone.trim()) s.push("Ajoutez un téléphone de contact direct.");
    if (!form.city.trim()) s.push("Précisez la ville pour le tri géographique.");
    return s;
  }, [form]);

  const validateCurrent = (): boolean => {
    let result: z.SafeParseReturnType<unknown, unknown> | null = null;
    if (step === "identity") result = step1Schema.safeParse(form);
    else if (step === "contact") result = step2Schema.safeParse(form);
    else if (step === "profile") result = step3Schema.safeParse(form);
    else return true;

    if (!result.success) {
      const map: Record<string, string> = {};
      result.error.issues.forEach((i) => { map[i.path.join(".")] = i.message; });
      setErrors(map);
      return false;
    }
    setErrors({});
    return true;
  };

  const next = () => { if (validateCurrent()) setStepIdx((i) => Math.min(STEPS.length - 1, i + 1)); };
  const prev = () => { setErrors({}); setStepIdx((i) => Math.max(0, i - 1)); };

  const handleFinalSubmit = async () => {
    // Validate all steps
    const all = [step1Schema.safeParse(form), step2Schema.safeParse(form), step3Schema.safeParse(form)];
    const failed = all.findIndex((r) => !r.success);
    if (failed >= 0) {
      setStepIdx(failed);
      const map: Record<string, string> = {};
      (all[failed] as any).error.issues.forEach((i: any) => { map[i.path.join(".")] = i.message; });
      setErrors(map);
      return;
    }
    setErrors({});
    await onSubmit();
  };

  const addTag = (raw: string) => {
    const v = raw.trim().replace(/,$/, "");
    if (!v || form.tags.includes(v)) return;
    update({ tags: [...form.tags, v] });
  };

  const typeTagPool = useMemo(() => {
    const seed = TAG_SUGGESTIONS_BY_TYPE[form.provider_type] || [];
    const merged = Array.from(new Set([...seed, ...existingTags]));
    return merged.filter((t) => !form.tags.includes(t)).slice(0, 14);
  }, [form.provider_type, form.tags, existingTags]);

  const isLast = stepIdx === STEPS.length - 1;

  return (
    <div className="space-y-5">
      {/* Stepper header */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Étape {stepIdx + 1} / {STEPS.length}
            </span>
            <span className="text-sm font-semibold text-foreground">{STEPS[stepIdx].label}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className={cn("h-3.5 w-3.5", completion >= 80 ? "text-success" : "text-muted-foreground")} />
            <span className={cn("font-mono", completion >= 80 ? "text-success" : "text-muted-foreground")}>
              {completion}% complété
            </span>
          </div>
        </div>
        <Progress value={completion} className="h-1.5" />
        <div className="mt-3 flex items-center justify-between gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < stepIdx;
            const current = i === stepIdx;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => i <= stepIdx && setStepIdx(i)}
                disabled={i > stepIdx}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors",
                  current && "bg-primary/10 text-primary",
                  done && "text-success hover:bg-success/10 cursor-pointer",
                  !current && !done && "text-muted-foreground"
                )}
              >
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
                  current && "border-primary bg-primary text-primary-foreground",
                  done && "border-success bg-success text-success-foreground",
                  !current && !done && "border-border"
                )}>
                  {done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[300px] space-y-4">
        {step === "identity" && (
          <>
            <div className="space-y-2">
              <Label>Type de structure *</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(Object.keys(TYPE_META) as ProviderType[]).map((t) => {
                  const meta = TYPE_META[t];
                  const Icon = meta.icon;
                  const active = form.provider_type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => update({ provider_type: t })}
                      className={cn(
                        "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all hover:border-primary/60",
                        active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-xs font-semibold">{meta.label}</span>
                      <span className="text-[10px] leading-tight text-muted-foreground">{meta.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <Field label="Nom de la structure *" error={errors.name}>
              <Input
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Ex: Centre Formation Plus"
                maxLength={150}
              />
            </Field>
            <Field label="Email principal *" error={errors.email} hint="Servira pour les notifications et l'invitation d'accès.">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update({ email: e.target.value.trim() })}
                placeholder="contact@organisme.fr"
                maxLength={255}
              />
            </Field>
          </>
        )}

        {step === "contact" && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Téléphone" error={errors.phone}>
                <Input value={form.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="01 23 45 67 89" maxLength={40} />
              </Field>
              <Field label="Site web" error={errors.website} hint="Avec http:// ou https://">
                <Input value={form.website} onChange={(e) => update({ website: e.target.value.trim() })} placeholder="https://exemple.fr" maxLength={255} />
              </Field>
            </div>
            <Field label="Adresse" error={errors.address}>
              <Input value={form.address} onChange={(e) => update({ address: e.target.value })} placeholder="12 rue de la République" maxLength={255} />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Field label="Ville" error={errors.city}>
                  <Input value={form.city} onChange={(e) => update({ city: e.target.value })} placeholder="Paris" maxLength={120} />
                </Field>
              </div>
              <Field label="Code postal" error={errors.postal_code}>
                <Input value={form.postal_code} onChange={(e) => update({ postal_code: e.target.value })} placeholder="75001" maxLength={10} />
              </Field>
            </div>
          </>
        )}

        {step === "profile" && (
          <>
            <Field
              label="Description"
              error={errors.description}
              hint={`${(form.description || "").length}/2000 — minimum recommandé : 80 caractères.`}
            >
              <Textarea
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                rows={4}
                placeholder="Activités, spécialités, publics accompagnés…"
                maxLength={2000}
              />
            </Field>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Tags / Mots-clés
              </Label>
              <p className="text-xs text-muted-foreground">
                Compétences, secteurs, langues, publics. Entrée ou virgule pour ajouter.
              </p>
              <div className="flex flex-wrap gap-1.5 rounded-md border bg-background p-2">
                {form.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 px-2 py-0.5 text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => update({ tags: form.tags.filter((t) => t !== tag) })}
                      className="ml-0.5 rounded-sm opacity-60 hover:opacity-100"
                      aria-label={`Retirer ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag(tagInput);
                      setTagInput("");
                    } else if (e.key === "Backspace" && !tagInput && form.tags.length) {
                      update({ tags: form.tags.slice(0, -1) });
                    }
                  }}
                  onBlur={() => { if (tagInput.trim()) { addTag(tagInput); setTagInput(""); } }}
                  placeholder={form.tags.length ? "" : "ex: anglais, BTP, RQTH…"}
                  className="h-7 min-w-[140px] flex-1 border-0 p-0 text-sm shadow-none focus-visible:ring-0"
                  maxLength={40}
                />
              </div>
              {typeTagPool.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-[11px] text-muted-foreground">Suggestions :</span>
                  {typeTagPool.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer px-1.5 py-0 text-[11px] hover:bg-primary/10 hover:text-primary"
                      onClick={() => addTag(tag)}
                    >
                      + {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {errors.tags && <p className="text-xs text-destructive">{errors.tags}</p>}
            </div>
          </>
        )}

        {step === "access" && (
          <>
            <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Label className="text-sm font-medium">Structure active</Label>
                  <p className="text-xs text-muted-foreground">Visible dans les annuaires et le matching.</p>
                </div>
                <Switch checked={form.is_active} onCheckedChange={(v) => update({ is_active: v })} />
              </div>
              {!editing && (
                <div className="flex items-center justify-between gap-2 border-t pt-3">
                  <div className="flex items-start gap-2">
                    <KeyRound className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <Label className="text-sm font-medium">Créer un accès partenaire</Label>
                      <p className="text-xs text-muted-foreground">Envoie un email d'invitation pour activer le compte.</p>
                    </div>
                  </div>
                  <Switch checked={form.create_access} onCheckedChange={(v) => update({ create_access: v })} />
                </div>
              )}
            </div>

            {/* Récap */}
            <div className="rounded-lg border p-3">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Récapitulatif</h4>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <RecapRow label="Type" value={TYPE_META[form.provider_type].label} />
                <RecapRow label="Nom" value={form.name || "—"} />
                <RecapRow label="Email" value={form.email || "—"} />
                <RecapRow label="Téléphone" value={form.phone || "—"} />
                <RecapRow label="Ville" value={form.city || "—"} />
                <RecapRow label="Site web" value={form.website || "—"} />
                <RecapRow label="Tags" value={form.tags.length ? form.tags.join(", ") : "—"} full />
              </dl>
            </div>

            {suggestions.length > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Conseils pour améliorer la fiche
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {suggestions.map((s) => (
                    <li key={s} className="flex items-start gap-1.5">
                      <span className="mt-0.5 text-amber-500">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-2 border-t pt-4">
        <Button variant="ghost" size="sm" onClick={stepIdx === 0 ? onCancel : prev} disabled={saving}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          {stepIdx === 0 ? "Annuler" : "Précédent"}
        </Button>
        {!isLast ? (
          <Button size="sm" onClick={next} disabled={saving}>
            Suivant <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleFinalSubmit} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editing ? "Enregistrer les modifications" : "Créer le partenaire"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function RecapRow({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <>
      <dt className={cn("text-muted-foreground", full && "col-span-2")}>{label}</dt>
      <dd className={cn("truncate font-medium", full && "col-span-2")}>{value}</dd>
    </>
  );
}

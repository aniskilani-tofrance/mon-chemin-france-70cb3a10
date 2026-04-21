import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useRateLimit } from "@/hooks/useRateLimit";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Clock, Mail, Loader2 } from "lucide-react";
import { z } from "zod";

const STRUCTURE_TYPES = [
  { value: "of", label: "Organisme de formation" },
  { value: "employer", label: "Employeur / Entreprise" },
  { value: "association", label: "Association d'accompagnement" },
  { value: "collectivite", label: "Collectivité / Service public" },
  { value: "other", label: "Autre" },
] as const;

const leadSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  organization: z.string().trim().min(2, "Nom de structure requis").max(150),
  structureType: z.string().min(1, "Veuillez préciser le type de structure"),
  message: z.string().trim().max(800).optional(),
});

export function PartnerLeadForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [structureType, setStructureType] = useState<string>("of");
  const rateLimit = useRateLimit(3, 120_000);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: (data.get("name") as string)?.trim() ?? "",
      email: (data.get("email") as string)?.trim() ?? "",
      organization: (data.get("organization") as string)?.trim() ?? "",
      structureType,
      message: ((data.get("message") as string) ?? "").trim(),
    };

    const result = leadSchema.safeParse(payload);
    if (!result.success) {
      const firstError = result.error.errors[0]?.message ?? "Formulaire invalide";
      toast.error(firstError);
      return;
    }

    if (!rateLimit.check()) {
      toast.error("Trop de tentatives. Réessayez dans quelques minutes.");
      return;
    }

    setLoading(true);

    // Compose a structured message stored in contact_requests
    const composedMessage = [
      `Type de structure : ${
        STRUCTURE_TYPES.find((s) => s.value === structureType)?.label ?? structureType
      }`,
      `Organisation : ${result.data.organization}`,
      result.data.message ? `\nMessage :\n${result.data.message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const { error } = await supabase.from("contact_requests").insert({
      name: result.data.name,
      email: result.data.email,
      message: composedMessage,
      request_type: "partner",
    });

    setLoading(false);

    if (error) {
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
      return;
    }

    setSubmittedEmail(result.data.email);
    setSent(true);
    toast.success("Demande enregistrée !");
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-8 text-center sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-9 w-9 text-primary" />
        </div>
        <h3 className="mb-3 text-2xl font-bold text-foreground">
          Demande bien reçue !
        </h3>
        <p className="mx-auto mb-6 max-w-md text-muted-foreground">
          Merci pour votre intérêt. Notre équipe va étudier votre demande et
          revenir vers vous très rapidement.
        </p>

        <div className="mx-auto mb-6 max-w-md space-y-3 text-left">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-background/80 p-4">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Confirmation envoyée
              </p>
              <p className="text-xs text-muted-foreground">
                Un suivi sera envoyé à <strong>{submittedEmail}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-background/80 p-4">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Réponse sous 24h ouvrées
              </p>
              <p className="text-xs text-muted-foreground">
                Un membre de l'équipe ToFrance vous contactera pour échanger.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Vous pouvez fermer cette page. Pensez à vérifier vos courriers indésirables.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lead-name">
            Votre nom <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lead-name"
            name="name"
            placeholder="Prénom Nom"
            maxLength={100}
            required
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead-email">
            Email professionnel <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lead-email"
            name="email"
            type="email"
            placeholder="vous@structure.fr"
            maxLength={255}
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead-org">
          Nom de votre structure <span className="text-destructive">*</span>
        </Label>
        <Input
          id="lead-org"
          name="organization"
          placeholder="Ex: Centre de formation Lumière"
          maxLength={150}
          required
          autoComplete="organization"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead-type">
          Type de structure <span className="text-destructive">*</span>
        </Label>
        <Select value={structureType} onValueChange={setStructureType}>
          <SelectTrigger id="lead-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STRUCTURE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead-message">
          Votre besoin{" "}
          <span className="text-xs font-normal text-muted-foreground">(optionnel)</span>
        </Label>
        <Textarea
          id="lead-message"
          name="message"
          placeholder="Décrivez brièvement votre besoin (recrutement, formation, partenariat...)"
          rows={3}
          maxLength={800}
        />
      </div>

      <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            Recevoir un appel de l'équipe
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        En soumettant ce formulaire, vous acceptez d'être contacté par l'équipe ToFrance.
        Vos données ne sont jamais partagées avec des tiers.
      </p>
    </form>
  );
}

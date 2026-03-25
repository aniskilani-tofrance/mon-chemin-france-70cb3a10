import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRateLimit } from "@/hooks/useRateLimit";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send } from "lucide-react";

const REQUEST_TYPES = [
  { value: "partner", label: "Devenir partenaire (recevoir des leads)" },
  { value: "host", label: "Héberger la plateforme dans ma structure" },
] as const;

interface ContactFormProps {
  defaultType?: "partner" | "host";
}

export function ContactForm({ defaultType }: ContactFormProps = {}) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [requestType, setRequestType] = useState<string>(defaultType ?? "partner");
  const rateLimit = useRateLimit(3, 120_000); // 3 submissions per 2 min

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = (data.get("name") as string).trim();
    const email = (data.get("email") as string).trim();
    const message = (data.get("message") as string).trim();

    if (!name || !email || !message) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    if (!rateLimit.check()) {
      toast.error("Trop de soumissions. Réessayez dans quelques minutes.");
      return;
    }
    if (name.length > 100 || email.length > 255 || message.length > 2000) {
      toast.error("Un ou plusieurs champs dépassent la longueur maximale.");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("contact_requests")
      .insert({ name, email, message, request_type: requestType });

    setLoading(false);
    if (error) {
      toast.error("Erreur lors de l'envoi. Réessayez.");
      return;
    }
    setSent(true);
    toast.success("Message envoyé !");
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-border/50 bg-background p-8 text-center">
        <p className="text-lg font-semibold text-foreground">Merci pour votre message !</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Nous reviendrons vers vous dans les plus brefs délais.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border/50 bg-background p-6 sm:p-8">
      <div className="space-y-2">
        <Label htmlFor="contact-type">Type de demande</Label>
        <Select value={requestType} onValueChange={setRequestType}>
          <SelectTrigger id="contact-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REQUEST_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-name">Nom</Label>
        <Input id="contact-name" name="name" placeholder="Votre nom" maxLength={100} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email">Email</Label>
        <Input id="contact-email" name="email" type="email" placeholder="vous@exemple.com" maxLength={255} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" name="message" placeholder="Votre question…" maxLength={2000} rows={4} required />
      </div>
      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? "Envoi…" : "Envoyer"}
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

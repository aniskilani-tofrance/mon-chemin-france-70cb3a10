import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Phone, User, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { useTTS } from "@/hooks/useTTS";

interface ContactStepProps {
  initialFirstname?: string;
  initialPhone?: string;
  onSubmit: (data: { firstname: string; phone: string }) => void;
  onPrevious: () => void;
  progressPercent: number;
  questionNumber: number;
  totalQuestions: number;
  tts: ReturnType<typeof useTTS>;
}

const PHONE_REGEX = /^[+\d][\d\s().-]{7,}$/;

export function ContactStep({
  initialFirstname = "",
  initialPhone = "",
  onSubmit,
  onPrevious,
  progressPercent,
  questionNumber,
  totalQuestions,
  tts,
}: ContactStepProps) {
  const [firstname, setFirstname] = useState(initialFirstname);
  const [phone, setPhone] = useState(initialPhone);
  const [touched, setTouched] = useState(false);
  const lastSpokenRef = useRef(false);

  const title = "Comment pouvons-nous vous joindre ?";
  const subtitle = "Votre prénom et votre téléphone permettent à l’équipe ToFrance de vous rappeler rapidement.";

  useEffect(() => {
    if (!tts.isEnabled || !tts.isSupported || lastSpokenRef.current) return;
    lastSpokenRef.current = true;
    const id = setTimeout(() => tts.speak(`${title}. ${subtitle}`), 350);
    return () => clearTimeout(id);
  }, [tts, title, subtitle]);

  const isValid = firstname.trim().length >= 2 && PHONE_REGEX.test(phone.trim());

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!isValid) return;
    onSubmit({ firstname: firstname.trim(), phone: phone.trim() });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="flex w-full flex-col gap-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Étape {questionNumber} sur {totalQuestions}</span>
          <span>{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">{title}</h2>
          {tts.isSupported && (
            <button type="button" onClick={() => tts.speak(`${title}. ${subtitle}`)} aria-label="Réécouter" className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-card text-primary transition-colors hover:bg-primary/10">
              <Volume2 className={`h-4 w-4 ${tts.isSpeaking ? "animate-pulse" : ""}`} />
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="contact_firstname" className="text-base">Prénom</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input id="contact_firstname" autoComplete="given-name" required value={firstname} onChange={(event) => setFirstname(event.target.value)} onBlur={() => setTouched(true)} placeholder="Votre prénom" className="h-14 pl-10 text-lg" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_phone" className="text-base">Téléphone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input id="contact_phone" type="tel" inputMode="tel" autoComplete="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} onBlur={() => setTouched(true)} placeholder="06 12 34 56 78" className="h-12 pl-10 text-base" />
          </div>
          {touched && !PHONE_REGEX.test(phone.trim()) && <p className="text-sm text-destructive">Téléphone requis pour être recontacté.</p>}
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button type="submit" disabled={!isValid} size="lg" className="h-14 w-full gap-2 text-base font-semibold">Continuer<ArrowRight className="h-5 w-5" /></Button>
          <Button type="button" variant="ghost" onClick={onPrevious} className="gap-2 self-start"><ArrowLeft className="h-4 w-4" />Retour</Button>
        </div>
      </form>
    </motion.div>
  );
}

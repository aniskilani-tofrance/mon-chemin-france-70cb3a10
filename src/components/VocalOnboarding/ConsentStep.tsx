import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Users, Eye, ExternalLink, CheckCircle2, Heart, Building2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { CONSENT_TRANSLATIONS } from "@/lib/consentTranslations";
import { Link } from "react-router-dom";

interface ConsentStepProps {
  onAccept: (leadSharing: boolean, marketing: boolean) => void;
  onDecline: () => void;
}

const trustItems = [
  { icon: Lock, labelKey: "trustEncrypted" as const, color: "text-blue-600" },
  { icon: Eye, labelKey: "trustAnonymized" as const, color: "text-emerald-600" },
  { icon: Users, labelKey: "trustExplicit" as const, color: "text-amber-600" },
];

const partnerTypes = [
  { icon: "🗣️", labelKey: "partnerFLE" as const },
  { icon: "🎓", labelKey: "partnerFormation" as const },
  { icon: "💼", labelKey: "partnerEmploi" as const },
];

export function ConsentStep({ onAccept, onDecline }: ConsentStepProps) {
  const { language } = useLanguage();
  const t = CONSENT_TRANSLATIONS[language as keyof typeof CONSENT_TRANSLATIONS] || CONSENT_TRANSLATIONS.fr;

  const [leadSharingConsent, setLeadSharingConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleAccept = () => {
    if (!leadSharingConsent) {
      setShowError(true);
      return;
    }
    onAccept(leadSharingConsent, marketingConsent);
  };

  const trustLabels = {
    trustEncrypted: (t as Record<string, string>).trustEncrypted || "Données chiffrées",
    trustAnonymized: (t as Record<string, string>).trustAnonymized || "Profil anonymisé",
    trustExplicit: (t as Record<string, string>).trustExplicit || "Accord explicite requis",
  };

  const partnerLabels = {
    partnerFLE: (t as Record<string, string>).partnerFLE || "Associations FLE",
    partnerFormation: (t as Record<string, string>).partnerFormation || "Centres de formation",
    partnerEmploi: (t as Record<string, string>).partnerEmploi || "Employeurs partenaires",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
          className="text-center mb-6"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4 ring-4 ring-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {t.description}
          </p>
        </motion.div>

        {/* Partner types - who will see the profile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-5"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mb-3">
            {(t as Record<string, string>).partnerSectionTitle || "Vos données seront visibles par"}
          </p>
          <div className="flex gap-2">
            {partnerTypes.map((item, i) => (
              <motion.div
                key={item.labelKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="flex-1 flex flex-col items-center gap-1.5 rounded-xl bg-card border border-border/60 px-2 py-3 text-center shadow-sm"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[11px] font-medium text-foreground leading-tight">
                  {partnerLabels[item.labelKey]}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl bg-primary/5 border border-primary/10 p-4 mb-5"
        >
          <div className="flex flex-col gap-2.5">
            {trustItems.map((item, i) => (
              <motion.div
                key={item.labelKey}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-center gap-2.5"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                  <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                </div>
                <span className="text-xs font-medium text-foreground">
                  {trustLabels[item.labelKey]}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Consent cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 mb-4"
        >
          {/* Required consent */}
          <button
            type="button"
            onClick={() => {
              setLeadSharingConsent(!leadSharingConsent);
              if (!leadSharingConsent) setShowError(false);
            }}
            className={`w-full flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
              leadSharingConsent
                ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                : showError
                ? "border-destructive/50 bg-destructive/5 animate-shake"
                : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
            }`}
          >
            <Checkbox
              id="lead-sharing"
              checked={leadSharingConsent}
              onCheckedChange={(checked) => {
                setLeadSharingConsent(checked === true);
                if (checked) setShowError(false);
              }}
              className="mt-0.5 pointer-events-none"
              tabIndex={-1}
            />
            <div className="flex-1 min-w-0">
              <Label
                htmlFor="lead-sharing"
                className="text-sm font-semibold text-foreground cursor-pointer leading-snug pointer-events-none"
              >
                {t.consentLabelRequired}
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                {(t as Record<string, string>).consentDetailRequired || "Seuls votre prénom, ville et secteur visé sont partagés. Jamais votre email ni téléphone sans votre accord."}
              </p>
              <AnimatePresence>
                {showError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1.5 text-xs text-destructive font-medium"
                  >
                    {t.required}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            {leadSharingConsent && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              </motion.div>
            )}
          </button>

          {/* Optional marketing consent */}
          <button
            type="button"
            onClick={() => setMarketingConsent(!marketingConsent)}
            className={`w-full flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
              marketingConsent
                ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
            }`}
          >
            <Checkbox
              id="marketing"
              checked={marketingConsent}
              onCheckedChange={(checked) => setMarketingConsent(checked === true)}
              className="mt-0.5 pointer-events-none"
              tabIndex={-1}
            />
            <div className="flex-1 min-w-0">
              <Label
                htmlFor="marketing"
                className="text-sm font-semibold text-foreground cursor-pointer leading-snug pointer-events-none"
              >
                {t.consentLabelMarketing}
              </Label>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                {(t as Record<string, string>).consentDetailMarketing || "Conseils d'insertion, nouvelles formations et opportunités d'emploi. Désabonnement en 1 clic."}
              </p>
            </div>
            {marketingConsent && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              </motion.div>
            )}
          </button>
        </motion.div>

        {/* Email note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 mb-4"
        >
          <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t.emailNote}
          </p>
        </motion.div>

        {/* Privacy policy link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-6"
        >
          <Link
            to="/confidentialite"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline transition-colors font-medium"
          >
            {t.privacyLink}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex gap-3"
        >
          <Button
            variant="outline"
            size="lg"
            className="flex-1 rounded-xl"
            onClick={onDecline}
          >
            {t.decline}
          </Button>
          <Button
            variant="hero"
            size="lg"
            className="flex-1 rounded-xl"
            onClick={handleAccept}
          >
            {t.accept}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

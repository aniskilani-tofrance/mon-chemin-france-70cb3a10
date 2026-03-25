import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Users, Eye, ExternalLink } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { CONSENT_TRANSLATIONS } from "@/lib/consentTranslations";
import { Link } from "react-router-dom";

interface ConsentStepProps {
  onAccept: (leadSharing: boolean, marketing: boolean) => void;
  onDecline: () => void;
}

const trustItems = [
  { icon: Lock, labelKey: "trustEncrypted" as const },
  { icon: Eye, labelKey: "trustAnonymized" as const },
  { icon: Users, labelKey: "trustExplicit" as const },
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

  // Fallback trust labels
  const trustLabels = {
    trustEncrypted: (t as Record<string, string>).trustEncrypted || "Données chiffrées",
    trustAnonymized: (t as Record<string, string>).trustAnonymized || "Profil anonymisé",
    trustExplicit: (t as Record<string, string>).trustExplicit || "Accord explicite requis",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="mx-auto max-w-md">
        {/* Header with shield icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
          className="text-center mb-6"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {t.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.description}
          </p>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-6"
        >
          {trustItems.map((item, i) => (
            <motion.div
              key={item.labelKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
              className="flex-1 flex flex-col items-center gap-1.5 rounded-xl bg-card border border-border/50 px-2 py-3 text-center"
            >
              <item.icon className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground leading-tight">
                {trustLabels[item.labelKey]}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Consent cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3 mb-5"
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
                ? "border-primary bg-primary/5 shadow-sm"
                : showError
                ? "border-destructive/50 bg-destructive/5"
                : "border-border bg-card hover:border-primary/30"
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
                className="text-sm font-medium text-foreground cursor-pointer leading-snug pointer-events-none"
              >
                {t.consentLabelRequired}
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <AnimatePresence>
                {showError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 text-xs text-destructive"
                  >
                    {t.required}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </button>

          {/* Optional marketing consent */}
          <button
            type="button"
            onClick={() => setMarketingConsent(!marketingConsent)}
            className={`w-full flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
              marketingConsent
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <Checkbox
              id="marketing"
              checked={marketingConsent}
              onCheckedChange={(checked) => setMarketingConsent(checked === true)}
              className="mt-0.5 pointer-events-none"
              tabIndex={-1}
            />
            <Label
              htmlFor="marketing"
              className="text-sm font-medium text-foreground cursor-pointer leading-snug pointer-events-none"
            >
              {t.consentLabelMarketing}
            </Label>
          </button>
        </motion.div>

        {/* Email note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-muted-foreground/70 text-center mb-4 leading-relaxed italic px-2"
        >
          {t.emailNote}
        </motion.p>

        {/* Privacy policy link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-center mb-6"
        >
          <Link
            to="/confidentialite"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline transition-colors"
          >
            {t.privacyLink}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Users, Eye, ExternalLink, CheckCircle2 } from "lucide-react";
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
        {/* Header — compact */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
          className="text-center mb-4"
        >
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-2 ring-4 ring-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            {t.title}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {t.description}
          </p>
        </motion.div>

        {/* Partner types + trust indicators — side by side */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-2 mb-4"
        >
          {/* Partners */}
          <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {(t as Record<string, string>).partnerSectionTitle || "Visible par"}
            </p>
            <div className="space-y-1.5">
              {partnerTypes.map((item) => (
                <div key={item.labelKey} className="flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-[11px] font-medium text-foreground">{partnerLabels[item.labelKey]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust */}
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
            <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider mb-2">
              🔒 Garanties
            </p>
            <div className="space-y-1.5">
              {trustItems.map((item) => (
                <div key={item.labelKey} className="flex items-center gap-2">
                  <item.icon className={`h-3 w-3 ${item.color} shrink-0`} />
                  <span className="text-[11px] font-medium text-foreground leading-tight">
                    {trustLabels[item.labelKey]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Consent cards — compact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2 mb-3"
        >
          {/* Required consent */}
          <button
            type="button"
            onClick={() => {
              setLeadSharingConsent(!leadSharingConsent);
              if (!leadSharingConsent) setShowError(false);
            }}
            className={`w-full flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-200 ${
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
              className="pointer-events-none shrink-0"
              tabIndex={-1}
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-foreground leading-snug">
                {t.consentLabelRequired}
                <span className="text-destructive ml-0.5">*</span>
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                {(t as Record<string, string>).consentDetailRequired || "Seuls votre prénom, ville et secteur visé sont partagés."}
              </p>
              <AnimatePresence>
                {showError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-0.5 text-[11px] text-destructive font-medium"
                  >
                    {t.required}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            {leadSharingConsent && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              </motion.div>
            )}
          </button>

          {/* Optional marketing consent */}
          <button
            type="button"
            onClick={() => setMarketingConsent(!marketingConsent)}
            className={`w-full flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-200 ${
              marketingConsent
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <Checkbox
              id="marketing"
              checked={marketingConsent}
              onCheckedChange={(checked) => setMarketingConsent(checked === true)}
              className="pointer-events-none shrink-0"
              tabIndex={-1}
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-foreground leading-snug">
                {t.consentLabelMarketing}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                {(t as Record<string, string>).consentDetailMarketing || "Conseils, formations et opportunités. Désabonnement en 1 clic."}
              </p>
            </div>
            {marketingConsent && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              </motion.div>
            )}
          </button>
        </motion.div>

        {/* Email note — inline compact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-1.5 justify-center text-[10px] text-muted-foreground mb-3"
        >
          <Shield className="h-3 w-3 shrink-0" />
          <span>{t.emailNote}</span>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3 mb-2"
        >
          <Button
            variant="outline"
            size="default"
            className="flex-1 rounded-xl"
            onClick={onDecline}
          >
            {t.decline}
          </Button>
          <Button
            variant="hero"
            size="default"
            className="flex-1 rounded-xl"
            onClick={handleAccept}
          >
            {t.accept}
          </Button>
        </motion.div>

        {/* Privacy link */}
        <div className="text-center">
          <Link
            to="/confidentialite"
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
          >
            {t.privacyLink}
            <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

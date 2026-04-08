import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import type { LanguageCode } from "@/lib/translations";

const emailSchema = z.string().trim().email().max(255);
const passwordSchema = z.string().min(6).max(128);

const LABELS: Record<string, Record<string, string>> = {
  title: {
    fr: "Créez votre compte pour sauvegarder votre progression",
    en: "Create your account to save your progress",
    ar: "أنشئ حسابك لحفظ تقدّمك",
    es: "Crea tu cuenta para guardar tu progreso",
    pt: "Crie sua conta para salvar seu progresso",
    ru: "Создайте аккаунт, чтобы сохранить прогресс",
  },
  subtitle: {
    fr: "Vous pourrez reprendre là où vous en êtes à tout moment",
    en: "You can pick up where you left off anytime",
    ar: "يمكنكم المتابعة من حيث توقّفتم في أي وقت",
    es: "Podrás retomar donde lo dejaste en cualquier momento",
    pt: "Você poderá retomar de onde parou a qualquer momento",
    ru: "Вы сможете продолжить с того места, где остановились",
  },
  email: {
    fr: "Votre email",
    en: "Your email",
    ar: "بريدكم الإلكتروني",
    es: "Tu email",
    pt: "Seu email",
    ru: "Ваш email",
  },
  password: {
    fr: "Créez un mot de passe",
    en: "Create a password",
    ar: "أنشئ كلمة مرور",
    es: "Crea una contraseña",
    pt: "Crie uma senha",
    ru: "Создайте пароль",
  },
  submit: {
    fr: "Créer mon compte",
    en: "Create my account",
    ar: "إنشاء حسابي",
    es: "Crear mi cuenta",
    pt: "Criar minha conta",
    ru: "Создать аккаунт",
  },
  skip: {
    fr: "Continuer sans compte",
    en: "Continue without account",
    ar: "المتابعة بدون حساب",
    es: "Continuar sin cuenta",
    pt: "Continuar sem conta",
    ru: "Продолжить без аккаунта",
  },
  success: {
    fr: "Compte créé ! Un email de confirmation vous a été envoyé.",
    en: "Account created! A confirmation email has been sent.",
    ar: "تم إنشاء الحساب! تم إرسال بريد تأكيد.",
    es: "¡Cuenta creada! Se ha enviado un email de confirmación.",
    pt: "Conta criada! Um email de confirmação foi enviado.",
    ru: "Аккаунт создан! Письмо с подтверждением отправлено.",
  },
  emailError: {
    fr: "Format email invalide",
    en: "Invalid email format",
    ar: "صيغة البريد الإلكتروني غير صالحة",
    es: "Formato de email inválido",
    pt: "Formato de email inválido",
    ru: "Неверный формат email",
  },
  passwordError: {
    fr: "6 caractères minimum",
    en: "6 characters minimum",
    ar: "6 أحرف على الأقل",
    es: "6 caracteres mínimo",
    pt: "6 caracteres mínimo",
    ru: "Минимум 6 символов",
  },
  genericError: {
    fr: "Erreur lors de la création du compte. Réessayez.",
    en: "Error creating account. Please try again.",
    ar: "خطأ في إنشاء الحساب. حاول مرة أخرى.",
    es: "Error al crear la cuenta. Inténtalo de nuevo.",
    pt: "Erro ao criar a conta. Tente novamente.",
    ru: "Ошибка при создании аккаунта. Попробуйте снова.",
  },
};

function t(key: string, lang: string): string {
  return LABELS[key]?.[lang] || LABELS[key]?.fr || key;
}

interface OnboardingSignupWidgetProps {
  language: LanguageCode;
  onSignupComplete: (userId: string, email: string) => void;
  onSkip: () => void;
}

export function OnboardingSignupWidget({ language, onSignupComplete, onSkip }: OnboardingSignupWidgetProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isRTL = language === "ar";

  const handleSubmit = async () => {
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setEmailError(t("emailError", language));
      return;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setPasswordError(t("passwordError", language));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailResult.data,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/onboarding",
        },
      });

      if (error) {
        setGeneralError(error.message);
        return;
      }

      if (data.user) {
        setSuccess(true);
        setTimeout(() => {
          onSignupComplete(data.user!.id, emailResult.data);
        }, 1500);
      }
    } catch {
      setGeneralError(t("genericError", language));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border-2 border-green-500/30 bg-green-500/5 p-5"
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-foreground">{t("success", language)}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-5 shadow-sm space-y-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
          <UserPlus className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{t("title", language)}</p>
          <p className="text-xs text-muted-foreground">{t("subtitle", language)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder={t("email", language)}
            disabled={loading}
            dir="ltr"
            className={emailError ? "border-destructive" : ""}
          />
          {emailError && <p className="mt-1 text-xs text-destructive">{emailError}</p>}
        </div>

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder={t("password", language)}
            disabled={loading}
            dir="ltr"
            className={passwordError ? "border-destructive pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {passwordError && <p className="mt-1 text-xs text-destructive">{passwordError}</p>}
        </div>

        {generalError && (
          <p className="text-xs text-destructive">{generalError}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading || !email.trim() || !password.trim()}
          className="w-full"
          size="lg"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
          {t("submit", language)}
        </Button>

        <Button
          variant="ghost"
          onClick={onSkip}
          disabled={loading}
          className="w-full text-muted-foreground text-xs"
          size="sm"
        >
          {t("skip", language)}
        </Button>
      </div>
    </motion.div>
  );
}

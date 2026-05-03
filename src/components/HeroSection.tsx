import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { Mic, ArrowRight, Sparkles, ClipboardList, GraduationCap } from "lucide-react";
import heroImage from "@/assets/hero-welcome.jpg";
import logoTofrance from "@/assets/logo-tofrance.png";
import marianneAvatar from "@/assets/marianne-avatar.png";

export function HeroSection() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  // Logged-in users (admin or apprenant) skip the access-code gate.
  const userIsLoggedIn = !!user;
  const handleMarianneClick = (e: React.MouseEvent) => {
    if (userIsLoggedIn) return; // <Link to="/onboarding"> handles navigation
    e.preventDefault();
    const target = document.getElementById("access-code");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // Focus the code input for instant typing
      setTimeout(() => {
        const input = target.querySelector<HTMLInputElement>('input[autocomplete="off"]');
        input?.focus();
      }, 400);
    } else {
      window.location.href = "/#access-code";
    }
  };
  const marianneHref = userIsLoggedIn ? "/onboarding" : "#access-code";

  return (
    <section className="relative min-h-screen overflow-hidden pt-24">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Welcome to France"
          className="h-full w-full object-cover object-top"
          width={1920}
          height={1080}
          fetchPriority="high" />
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto min-h-[calc(100vh-6rem)] max-w-7xl px-4 text-center sm:px-6 lg:px-8 rounded-none flex-col flex items-center justify-center">
        <AnimatedContainer delay={0.1}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>IA multilingue — 6 langues</span>
          </div>
        </AnimatedContainer>

        <AnimatedContainer delay={0.2}>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
            {t.welcome}
          </h1>
        </AnimatedContainer>

        <AnimatedContainer delay={0.3}>
          <p className="mb-10 max-w-2xl text-lg text-white/90 drop-shadow-md sm:text-xl">
            {t.subtitle}
          </p>
        </AnimatedContainer>

        <AnimatedContainer delay={0.4}>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Button variant="hero" size="xl" asChild>
              <Link to={marianneHref} onClick={handleMarianneClick} className="gap-3">
                <Mic className="h-5 w-5" />
                {userIsLoggedIn ? "Démarrer Marianne" : "Accès pilote Marianne"}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="glass"
              size="xl"
              className="border-white/30 bg-white/20 text-white hover:bg-white/30"
              asChild
            >
              <Link to="/login?redirect=/diagnostic-partage" className="gap-3">
                <ClipboardList className="h-5 w-5" />
                Diagnostic partagé
              </Link>
            </Button>
            <Button
              variant="glass"
              size="xl"
              className="border-white/30 bg-white/20 text-white hover:bg-white/30"
              asChild
            >
              <Link to="/login?redirect=/placement-test/trainer" className="gap-3">
                <GraduationCap className="h-5 w-5" />
                Test de positionnement
              </Link>
            </Button>
          </div>
        </AnimatedContainer>

        {/* Soa introduction */}
        <AnimatedContainer delay={0.6} className="mt-12">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-5 py-3 shadow-sm">
              <img src={marianneAvatar} alt="Marianne, votre conseillère ToFrance" className="h-14 w-14 rounded-full object-cover object-top" width={56} height={56} loading="lazy" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Marianne, votre conseillère</p>
                <p className="text-xs text-muted-foreground">Parle 6 langues</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-5 py-3 shadow-sm">
              <img src={logoTofrance} alt="ToFrance" className="h-14 w-14 rounded-full object-cover" width={56} height={56} loading="lazy" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Parcours personnalisé</p>
                <p className="text-xs text-muted-foreground">Adapté à votre profil</p>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-6 rounded-full border-2 border-muted-foreground/30 p-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </div>
    </section>);
}

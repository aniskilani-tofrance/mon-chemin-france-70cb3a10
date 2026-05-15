import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { ArrowRight, ShieldCheck, Clock, Heart, Languages } from "lucide-react";
import heroImage from "@/assets/hero-welcome.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Bienvenue en France"
          className="h-full w-full object-cover object-top"
          width={1920}
          height={1080}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/25 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <AnimatedContainer delay={0.1}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            <Languages className="h-4 w-4 text-accent" />
            <span>Disponible en français, العربية, English, español, português, русский</span>
          </div>
        </AnimatedContainer>

        <AnimatedContainer delay={0.2}>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
            Vous ne savez pas par où commencer en France&nbsp;?
          </h1>
        </AnimatedContainer>

        <AnimatedContainer delay={0.3}>
          <p className="mb-10 max-w-2xl text-lg text-white/95 drop-shadow-md sm:text-xl">
            ToFrance vous aide à comprendre votre besoin, dans votre langue. Puis un conseiller
            vous rappelle <strong className="font-semibold">sous 48h</strong> pour vous orienter
            vers le bon parcours.
          </p>
        </AnimatedContainer>

        <AnimatedContainer delay={0.4}>
          <Button variant="hero" size="xl" asChild className="shadow-xl">
            <Link to="/orientation" className="gap-3">
              Commencer mon orientation
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </AnimatedContainer>

        <AnimatedContainer delay={0.5}>
          <div className="mt-6 max-w-xl rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm text-white/95 backdrop-blur-sm">
            <span className="inline-flex items-center gap-2">
              <Heart className="h-4 w-4 text-accent" />
              Vous n'êtes pas seul·e. Après votre diagnostic, une personne vous rappelle pour vous accompagner.
            </span>
          </div>
        </AnimatedContainer>

        <AnimatedContainer delay={0.6}>
          <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            <ReassuranceCard icon={<Clock className="h-5 w-5" />} title="Diagnostic 5 minutes" desc="Quelques questions simples, dans votre langue." />
            <ReassuranceCard icon={<Heart className="h-5 w-5" />} title="Rappel humain sous 48h" desc="Un conseiller parlant votre langue vous rappelle." />
            <ReassuranceCard icon={<ShieldCheck className="h-5 w-5" />} title="Gratuit et confidentiel" desc="Vos informations restent protégées." />
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
}

function ReassuranceCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 p-4 text-left backdrop-blur-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-white/80">{desc}</p>
      </div>
    </div>
  );
}

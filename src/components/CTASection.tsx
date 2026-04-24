import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";
import { ArrowRight, Mic } from "lucide-react";

const LANGUAGE_FLAGS = ["🇫🇷", "🇬🇧", "🇸🇦", "🇪🇸", "🇵🇹", "🇷🇺"];

export function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedContainer>
          <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 sm:p-12 lg:p-16">
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/3 translate-y-1/3 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {t.cta.title}
              </h2>
              <p className="mb-4 max-w-2xl text-lg text-white/80">
                {t.cta.subtitle}
              </p>
              <p className="mb-8 text-sm font-medium text-white/60">
                {t.cta.badge}
              </p>

              <Button
                variant="glass"
                size="xl"
                className="border-white/30 bg-white/20 text-white hover:bg-white/30"
                asChild
              >
                <Link to="/#access-code">
                  <Mic className="h-5 w-5" />
                  Accès pilote Marianne
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>

              <div className="mt-10 flex items-center gap-2">
                <span className="text-sm text-white/50">{t.cta.availableIn}</span>
                <div className="flex gap-1.5">
                  {LANGUAGE_FLAGS.map((flag) => (
                    <span key={flag} className="text-xl">{flag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
}

import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";
import { ArrowRight, Mic } from "lucide-react";

export function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedContainer>
          <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 sm:p-12 lg:p-16">
            {/* Background decoration */}
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/3 translate-y-1/3 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Prêt à commencer votre nouvelle vie en France ?
              </h2>
              <p className="mb-8 max-w-2xl text-lg text-white/80">
                Notre équipe vous accompagne pas à pas. Commencez par notre onboarding vocal personnalisé.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  variant="glass"
                  size="xl"
                  className="border-white/30 bg-white/20 text-white hover:bg-white/30"
                  asChild
                >
                  <Link to="/onboarding">
                    <Mic className="h-5 w-5" />
                    {t.startJourney}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-8 border-t border-white/20 pt-8">
                {[
                  { value: "50K+", label: "Personnes accompagnées" },
                  { value: "500+", label: "Partenaires" },
                  { value: "13", label: "Régions couvertes" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl font-bold text-white sm:text-4xl">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-sm text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
}

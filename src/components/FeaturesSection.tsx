import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem } from "@/components/AnimatedContainer";
import { Mic, BookOpen, MapPin, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingResult } from "@/hooks/useOnboardingResult";
import { FLEOnboardingGate } from "@/components/FLEOnboardingGate";

export function FeaturesSection() {
  const { t } = useLanguage();
  const f = t.featuresSection;
  const { user } = useAuth();
  const { data: onboardingResult, isLoading: obLoading } = useOnboardingResult();
  const [gateOpen, setGateOpen] = useState(false);

  const hasCompletedOnboarding = !!onboardingResult;

  const FEATURES = [
    { icon: Mic, title: f.marianne.title, description: f.marianne.description, cta: f.marianne.cta, link: "/onboarding", accent: "bg-primary/10 text-primary", gated: false },
    { icon: BookOpen, title: f.fle.title, description: f.fle.description, cta: f.fle.cta, link: "/fle", accent: "bg-success/10 text-success", gated: true },
    { icon: MapPin, title: f.local.title, description: f.local.description, cta: f.local.cta, link: "/partenaires", accent: "bg-accent text-accent-foreground", gated: false },
  ];

  const handleFeatureClick = (feature: typeof FEATURES[0], e: React.MouseEvent) => {
    if (feature.gated && !hasCompletedOnboarding) {
      e.preventDefault();
      setGateOpen(true);
    }
  };

  return (
    <>
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {f.title}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {f.subtitle}
            </p>
          </div>

          <StaggerContainer className="grid gap-8 md:grid-cols-3" staggerDelay={0.1}>
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={feature.link}>
                  <Card className="group h-full border-border/50 bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <CardContent className="flex h-full flex-col p-8">
                      <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${feature.accent}`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="mb-6 flex-1 text-muted-foreground">
                        {feature.description}
                      </p>
                      <Button variant="ghost" className="w-fit gap-2 px-0 text-primary hover:bg-transparent hover:text-primary/80" asChild>
                        <Link to={feature.link} onClick={(e) => handleFeatureClick(feature, e)}>
                          {feature.cta}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      <FLEOnboardingGate open={gateOpen} onOpenChange={setGateOpen} />
    </>
  );
}

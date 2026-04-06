import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/AnimatedContainer";
import { Mic, Route, Rocket } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function HowItWorksSection() {
  const { t } = useLanguage();
  const h = t.howItWorks;

  const STEPS = [
    { number: "1", icon: Mic, title: h.step1Title, description: h.step1Desc },
    { number: "2", icon: Route, title: h.step2Title, description: h.step2Desc },
    { number: "3", icon: Rocket, title: h.step3Title, description: h.step3Desc },
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedContainer className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {h.title}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {h.subtitle}
          </p>
        </AnimatedContainer>

        <StaggerContainer className="relative grid gap-8 md:grid-cols-3" staggerDelay={0.15}>
          <div className="absolute left-[16.67%] right-[16.67%] top-16 hidden h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 md:block" />

          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <StaggerItem key={step.number}>
                <div className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                    {step.number}
                  </div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="max-w-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

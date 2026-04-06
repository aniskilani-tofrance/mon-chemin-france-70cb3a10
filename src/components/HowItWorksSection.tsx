import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/AnimatedContainer";
import { Mic, Route, Rocket } from "lucide-react";

const STEPS = [
  {
    number: "1",
    icon: Mic,
    title: "Parlez avec Marianne",
    description: "5 minutes de conversation vocale dans votre langue. Marianne évalue votre profil et vos besoins.",
  },
  {
    number: "2",
    icon: Route,
    title: "Recevez votre orientation",
    description: "Parcours personnalisé : cours de français, formation professionnelle ou aide à l'emploi.",
  },
  {
    number: "3",
    icon: Rocket,
    title: "Commencez votre parcours",
    description: "Accédez aux modules FLE ou soyez mis en relation avec un organisme partenaire près de chez vous.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedContainer className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Comment ça marche ?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Un parcours simple en 3 étapes, entièrement gratuit
          </p>
        </AnimatedContainer>

        <StaggerContainer className="relative grid gap-8 md:grid-cols-3" staggerDelay={0.15}>
          {/* Connector line (desktop only) */}
          <div className="absolute left-[16.67%] right-[16.67%] top-16 hidden h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 md:block" />

          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <StaggerItem key={step.number}>
                <div className="relative flex flex-col items-center text-center">
                  {/* Number circle */}
                  <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                    {step.number}
                  </div>
                  {/* Icon */}
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

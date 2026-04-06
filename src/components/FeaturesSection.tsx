import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem } from "@/components/AnimatedContainer";
import { Mic, BookOpen, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: Mic,
    title: "Marianne, votre conseillère IA",
    description: "Onboarding vocal en 6 langues. Marianne évalue votre situation et vous oriente en 5 minutes.",
    cta: "Discuter avec Marianne",
    link: "/onboarding",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: BookOpen,
    title: "Apprenez le français (FLE)",
    description: "Modules interactifs du niveau Alpha à B1. Apprentissage oral-first adapté à votre secteur professionnel.",
    cta: "Commencer les cours",
    link: "/fle",
    accent: "bg-success/10 text-success",
  },
  {
    icon: MapPin,
    title: "Formations près de chez vous",
    description: "Mise en relation directe avec des organismes de formation et associations partenaires dans votre ville.",
    cta: "Voir les partenaires",
    link: "/partenaires",
    accent: "bg-accent text-accent-foreground",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tout ce qu'il vous faut pour réussir
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Trois piliers pour votre intégration en France
          </p>
        </div>

        <StaggerContainer className="grid gap-8 md:grid-cols-3" staggerDelay={0.1}>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={feature.title}>
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
                      <Link to={feature.link}>
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
  );
}

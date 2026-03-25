import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { StaggerContainer, StaggerItem } from "@/components/AnimatedContainer";
import { BookOpen, Compass, GraduationCap, Users } from "lucide-react";

const FEATURE_ICONS = {
  language: BookOpen,
  career: Compass,
  training: GraduationCap,
  community: Users,
};

const FEATURE_COLORS = {
  language: "bg-background border-primary/20",
  career: "bg-background border-accent/20",
  training: "bg-background border-success/20",
  community: "bg-background border-secondary-foreground/10",
};

const ICON_COLORS = {
  language: "bg-success/10 text-success",
  career: "bg-success/10 text-success",
  training: "bg-success/10 text-success",
  community: "bg-success/10 text-success",
};

export function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    { key: "language" as const, ...t.features.language },
    { key: "career" as const, ...t.features.career },
    { key: "training" as const, ...t.features.training },
    { key: "community" as const, ...t.features.community },
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tout pour réussir votre intégration
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Une plateforme complète qui vous accompagne à chaque étape de votre parcours en France
          </p>
        </div>

        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" staggerDelay={0.1}>
          {features.map((feature) => {
            const Icon = FEATURE_ICONS[feature.key];
            return (
              <StaggerItem key={feature.key}>
                <Card className={`group h-full cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-lg ${FEATURE_COLORS[feature.key]}`}>
                  <CardContent className="flex h-full flex-col p-6">
                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${ICON_COLORS[feature.key]}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
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

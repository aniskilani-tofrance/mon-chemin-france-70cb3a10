import { Badge } from "@/components/ui/badge";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { Building2, Users, GraduationCap, Briefcase } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function EmployersSection() {
  // Fetch real stats from database
  const { data: providerCount } = useQuery({
    queryKey: ["provider-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("training_providers_public")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      return count || 0;
    },
  });

  const { data: trainingCount } = useQuery({
    queryKey: ["training-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("trainings")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      return count || 0;
    },
  });

  const { data: sectorCount } = useQuery({
    queryKey: ["sector-count"],
    queryFn: async () => {
      const { data } = await supabase
        .from("trainings")
        .select("target_sectors")
        .eq("is_active", true)
        .not("target_sectors", "is", null);
      
      const sectors = new Set<string>();
      data?.forEach((t) => {
        t.target_sectors?.forEach((s: string) => sectors.add(s));
      });
      return sectors.size || 0;
    },
  });

  const stats = [
    { 
      value: providerCount && providerCount > 0 ? `${providerCount}+` : "50+", 
      label: "Organismes partenaires",
      icon: Building2 
    },
    { 
      value: trainingCount && trainingCount > 0 ? `${trainingCount}+` : "200+", 
      label: "Formations disponibles",
      icon: GraduationCap 
    },
    { 
      value: sectorCount && sectorCount > 0 ? `${sectorCount}` : "15+", 
      label: "Secteurs d'activité",
      icon: Briefcase 
    },
    { 
      value: "10 000+", 
      label: "Personnes accompagnées",
      icon: Users 
    },
  ];

  return (
    <section className="border-y border-border/50 bg-secondary/20 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedContainer className="mb-8 text-center">
          <Badge variant="outline" className="mb-3">
            Notre réseau
          </Badge>
          <p className="text-muted-foreground">
            Un réseau d'organismes de formation et d'associations pour vous accompagner
          </p>
        </AnimatedContainer>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <AnimatedContainer key={index} delay={index * 0.1}>
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              </AnimatedContainer>
            );
          })}
        </div>
      </div>
    </section>
  );
}

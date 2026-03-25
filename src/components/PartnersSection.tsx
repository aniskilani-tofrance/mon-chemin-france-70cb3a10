import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/AnimatedContainer";
import { MapPin, Phone, Globe, ArrowRight, Building2 } from "lucide-react";

const MOCK_PARTNERS = [
  {
    id: 1,
    name: "Alliance Française Paris",
    type: "Cours de français",
    city: "Paris",
    region: "Île-de-France",
    phone: "01 42 84 90 00",
    website: "https://www.alliancefr.org",
    programs: ["FLE Débutant", "FLE Intermédiaire", "Français professionnel"],
  },
  {
    id: 2,
    name: "GRETA Lyon",
    type: "Formation professionnelle",
    city: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    phone: "04 78 78 84 84",
    website: "https://www.greta-lyon.fr",
    programs: ["CAP Cuisine", "Titre Pro Secrétariat", "BTS Commerce"],
  },
  {
    id: 3,
    name: "France Terre d'Asile Marseille",
    type: "Association d'accompagnement",
    city: "Marseille",
    region: "Provence-Alpes-Côte d'Azur",
    phone: "04 91 90 50 50",
    website: "https://www.france-terre-asile.org",
    programs: ["Accompagnement social", "Aide administrative", "Insertion"],
  },
  {
    id: 4,
    name: "AFPA Bordeaux",
    type: "Formation professionnelle",
    city: "Bordeaux",
    region: "Nouvelle-Aquitaine",
    phone: "05 56 11 66 66",
    website: "https://www.afpa.fr",
    programs: ["Électricien", "Plombier", "Soudeur", "Maçon"],
  },
];

export function PartnersSection() {
  return (
    <section className="bg-secondary/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedContainer className="mb-16 text-center">
          <Badge variant="outline" className="mb-4">
            Réseau national
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Nos partenaires près de chez vous
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Un réseau de plus de 500 organismes de formation et associations partenaires sur tout le territoire
          </p>
        </AnimatedContainer>

        <StaggerContainer className="grid gap-6 md:grid-cols-2" staggerDelay={0.1}>
          {MOCK_PARTNERS.map((partner) => (
            <StaggerItem key={partner.id}>
              <Card variant="elevated" className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{partner.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {partner.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {partner.city}, {partner.region}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {partner.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Site web
                      </a>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {partner.programs.slice(0, 3).map((program) => (
                      <Badge key={program} variant="outline" className="text-xs">
                        {program}
                      </Badge>
                    ))}
                    {partner.programs.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{partner.programs.length - 3}
                      </Badge>
                    )}
                  </div>

                  <Button variant="outline" className="w-full">
                    En savoir plus
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="mt-12 text-center">
          <Button variant="hero" size="lg">
            Voir tous les partenaires
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

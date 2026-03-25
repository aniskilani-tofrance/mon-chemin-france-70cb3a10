import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Navigation, Phone, Globe, BookOpen, Briefcase, Users, Loader2, AlertCircle 
} from "lucide-react";
import { 
  Partner, PARTNERS, getPartnersByDistance, PARTNER_TYPE_LABELS 
} from "@/lib/partners";
import PartnerMapInner from "./PartnerMapInner";

const typeIcons: Record<Partner["type"], React.ReactNode> = {
  language: <BookOpen className="h-4 w-4" />,
  training: <Briefcase className="h-4 w-4" />,
  association: <Users className="h-4 w-4" />,
};

interface PartnerMapProps {
  className?: string;
}

export function PartnerMap({ className }: PartnerMapProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<Partner["type"] | "all">("all");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const handleGeolocate = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED: setLocationError("Autorisation de géolocalisation refusée"); break;
          case error.POSITION_UNAVAILABLE: setLocationError("Position non disponible"); break;
          case error.TIMEOUT: setLocationError("Délai d'attente dépassé"); break;
          default: setLocationError("Erreur de géolocalisation");
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const filteredPartners = selectedType === "all" 
    ? PARTNERS 
    : PARTNERS.filter((p) => p.type === selectedType);

  const nearbyPartners = userLocation
    ? getPartnersByDistance(userLocation.lat, userLocation.lng, 100)
        .filter((p) => selectedType === "all" || p.type === selectedType)
        .slice(0, 5)
    : [];

  const mapCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [46.603354, 1.888334];

  return (
    <div className={`grid gap-6 lg:grid-cols-3 ${className}`}>
      {/* Map */}
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Carte des partenaires
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleGeolocate} disabled={isLocating}>
              {isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Navigation className="mr-2 h-4 w-4" />}
              Me localiser
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {locationError && (
              <div className="flex items-center gap-2 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {locationError}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 border-b px-4 py-3">
              <Button variant={selectedType === "all" ? "default" : "outline"} size="sm" onClick={() => setSelectedType("all")}>Tous</Button>
              {(Object.keys(PARTNER_TYPE_LABELS) as Partner["type"][]).map((type) => (
                <Button key={type} variant={selectedType === type ? "default" : "outline"} size="sm" onClick={() => setSelectedType(type)} className="gap-1">
                  {typeIcons[type]}
                  {PARTNER_TYPE_LABELS[type].label}
                </Button>
              ))}
            </div>

            <div className="h-[400px] w-full">
              <PartnerMapInner
                mapCenter={mapCenter}
                userLocation={userLocation}
                filteredPartners={filteredPartners}
                onSelectPartner={setSelectedPartner}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {userLocation ? "Partenaires à proximité" : "Comment ça marche ?"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!userLocation ? (
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>Cliquez sur "Me localiser" pour trouver les organismes de formation et associations partenaires près de chez vous.</p>
                <div className="space-y-2">
                  {(["language", "training", "association"] as const).map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PARTNER_TYPE_LABELS[type].color }} />
                      <span>{PARTNER_TYPE_LABELS[type].label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : nearbyPartners.length > 0 ? (
              <div className="space-y-3">
                {nearbyPartners.map((partner) => (
                  <div key={partner.id} className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent/50" onClick={() => setSelectedPartner(partner)}>
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{partner.name}</h4>
                      <Badge variant="outline" className="text-xs" style={{ borderColor: PARTNER_TYPE_LABELS[partner.type].color }}>{partner.distance.toFixed(1)} km</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{partner.city}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {partner.services.slice(0, 2).map((service) => (<Badge key={service} variant="secondary" className="text-xs">{service}</Badge>))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun partenaire trouvé dans un rayon de 100 km.</p>
            )}
          </CardContent>
        </Card>

        {selectedPartner && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {typeIcons[selectedPartner.type]}
                {selectedPartner.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm">{selectedPartner.address}</p>
                <p className="text-sm font-medium">{selectedPartner.postalCode} {selectedPartner.city}</p>
              </div>
              {selectedPartner.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${selectedPartner.phone}`} className="hover:underline">{selectedPartner.phone}</a>
                </div>
              )}
              {selectedPartner.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={selectedPartner.website} target="_blank" rel="noopener noreferrer" className="hover:underline">Site web</a>
                </div>
              )}
              <div>
                <h5 className="mb-2 text-sm font-medium">Services proposés</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedPartner.services.map((service) => (<Badge key={service} variant="secondary" className="text-xs">{service}</Badge>))}
                </div>
              </div>
              <Button className="w-full" variant="hero">Contacter</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

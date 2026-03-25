export interface Partner {
  id: string;
  name: string;
  type: "language" | "training" | "association";
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
  phone?: string;
  email?: string;
  website?: string;
  services: string[];
  languages: string[];
}

export const PARTNERS: Partner[] = [
  // Île-de-France
  {
    id: "1",
    name: "Alliance Française Paris",
    type: "language",
    address: "101 Boulevard Raspail",
    city: "Paris",
    postalCode: "75006",
    lat: 48.8462,
    lng: 2.3281,
    phone: "01 42 84 90 00",
    website: "https://www.alliancefr.org",
    services: ["Cours de français", "Certification DELF/DALF", "Ateliers culturels"],
    languages: ["fr", "en", "ar", "zh"],
  },
  {
    id: "2",
    name: "GRETA Paris",
    type: "training",
    address: "28 Rue de Saussure",
    city: "Paris",
    postalCode: "75017",
    lat: 48.8834,
    lng: 2.3119,
    phone: "01 44 09 37 00",
    services: ["Formation professionnelle", "VAE", "Bilan de compétences"],
    languages: ["fr"],
  },
  {
    id: "3",
    name: "France Terre d'Asile",
    type: "association",
    address: "24 Rue Marc Seguin",
    city: "Paris",
    postalCode: "75018",
    lat: 48.8924,
    lng: 2.3595,
    phone: "01 53 04 39 99",
    website: "https://www.france-terre-asile.org",
    services: ["Accompagnement juridique", "Hébergement", "Insertion professionnelle"],
    languages: ["fr", "en", "ar", "fa", "bn"],
  },
  // Lyon
  {
    id: "4",
    name: "Alliance Française Lyon",
    type: "language",
    address: "11 Rue Pierre Bourdan",
    city: "Lyon",
    postalCode: "69003",
    lat: 45.7578,
    lng: 4.8587,
    services: ["Cours de français", "Préparation examens", "Français professionnel"],
    languages: ["fr", "en", "es", "pt"],
  },
  {
    id: "5",
    name: "AFPA Lyon",
    type: "training",
    address: "65 Boulevard Marius Vivier Merle",
    city: "Lyon",
    postalCode: "69003",
    lat: 45.7607,
    lng: 4.8590,
    phone: "39 36",
    website: "https://www.afpa.fr",
    services: ["Formation qualifiante", "Reconversion", "Apprentissage"],
    languages: ["fr"],
  },
  // Marseille
  {
    id: "6",
    name: "Centre Social L'Agora",
    type: "association",
    address: "17 Rue des Lilas",
    city: "Marseille",
    postalCode: "13001",
    lat: 43.2965,
    lng: 5.3698,
    services: ["Cours de français", "Aide aux démarches", "Soutien scolaire"],
    languages: ["fr", "ar"],
  },
  {
    id: "7",
    name: "GRETA Provence",
    type: "training",
    address: "18 Rue Sainte Victoire",
    city: "Marseille",
    postalCode: "13006",
    lat: 43.2896,
    lng: 5.3834,
    services: ["CAP Métiers", "Formation continue", "Accompagnement emploi"],
    languages: ["fr"],
  },
  // Lille
  {
    id: "8",
    name: "Alliance Française Lille",
    type: "language",
    address: "59 Boulevard Carnot",
    city: "Lille",
    postalCode: "59000",
    lat: 50.6292,
    lng: 3.0573,
    services: ["Cours intensifs", "Cours du soir", "E-learning"],
    languages: ["fr", "en", "pl", "uk"],
  },
  // Toulouse
  {
    id: "9",
    name: "OFII Toulouse",
    type: "association",
    address: "7 Esplanade Compans Caffarelli",
    city: "Toulouse",
    postalCode: "31000",
    lat: 43.6117,
    lng: 1.4332,
    phone: "05 62 73 30 30",
    services: ["Contrat d'intégration", "Formation civique", "Orientation"],
    languages: ["fr", "ar", "tr", "es"],
  },
  // Bordeaux
  {
    id: "10",
    name: "Alliance Française Bordeaux",
    type: "language",
    address: "57 Cours Pasteur",
    city: "Bordeaux",
    postalCode: "33000",
    lat: 44.8378,
    lng: -0.5792,
    services: ["FLE tous niveaux", "Certification TCF", "Ateliers conversation"],
    languages: ["fr", "en", "es", "pt"],
  },
  // Nantes
  {
    id: "11",
    name: "CADA Nantes",
    type: "association",
    address: "12 Rue de Strasbourg",
    city: "Nantes",
    postalCode: "44000",
    lat: 47.2184,
    lng: -1.5536,
    services: ["Hébergement demandeurs d'asile", "Accompagnement social", "Cours de français"],
    languages: ["fr", "ar", "bn", "ur"],
  },
  // Strasbourg
  {
    id: "12",
    name: "GRETA Est Alsace",
    type: "training",
    address: "1 Rue de Bâle",
    city: "Strasbourg",
    postalCode: "67100",
    lat: 48.5734,
    lng: 7.7521,
    services: ["Formation linguistique", "Métiers du bâtiment", "Commerce"],
    languages: ["fr", "de"],
  },
];

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getPartnersByDistance(
  userLat: number,
  userLng: number,
  maxDistance?: number
): (Partner & { distance: number })[] {
  return PARTNERS
    .map((partner) => ({
      ...partner,
      distance: calculateDistance(userLat, userLng, partner.lat, partner.lng),
    }))
    .filter((p) => !maxDistance || p.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
}

export const PARTNER_TYPE_LABELS: Record<Partner["type"], { label: string; color: string }> = {
  language: { label: "Cours de français", color: "#3B82F6" },
  training: { label: "Formation professionnelle", color: "#10B981" },
  association: { label: "Association", color: "#F59E0B" },
};

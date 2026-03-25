import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { Partner, PARTNER_TYPE_LABELS } from "@/lib/partners";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createIcon = (color: string) =>
  new L.DivIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const userIcon = new L.DivIcon({
  className: "user-marker",
  html: `<div style="background-color: #EF4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 3px rgba(239,68,68,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface PartnerMapInnerProps {
  mapCenter: [number, number];
  userLocation: { lat: number; lng: number } | null;
  filteredPartners: Partner[];
  onSelectPartner: (partner: Partner) => void;
}

export default function PartnerMapInner({ mapCenter, userLocation, filteredPartners, onSelectPartner }: PartnerMapInnerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(mapCenter, userLocation ? 12 : 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center
  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 12, { duration: 1.5 });
    }
  }, [userLocation]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    // User location marker
    if (userLocation) {
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup("<strong>Votre position</strong>")
        .addTo(markersRef.current);
    }

    // Partner markers
    filteredPartners.forEach((partner) => {
      const marker = L.marker([partner.lat, partner.lng], {
        icon: createIcon(PARTNER_TYPE_LABELS[partner.type].color),
      });

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin: 0 0 4px;">${partner.name}</h3>
          <p style="font-size: 13px; color: #666; margin: 0;">${partner.address}</p>
          <p style="font-size: 13px; margin: 0;">${partner.postalCode} ${partner.city}</p>
          <span style="display: inline-block; margin-top: 8px; padding: 2px 8px; border-radius: 12px; font-size: 12px; color: white; background-color: ${PARTNER_TYPE_LABELS[partner.type].color};">
            ${PARTNER_TYPE_LABELS[partner.type].label}
          </span>
        </div>
      `);

      marker.on("click", () => onSelectPartner(partner));
      marker.addTo(markersRef.current!);
    });
  }, [filteredPartners, userLocation, onSelectPartner]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}

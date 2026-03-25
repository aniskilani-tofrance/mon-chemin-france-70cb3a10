import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (place: { city: string; postalCode: string; formatted: string }) => void;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export function GooglePlacesAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  className,
  autoFocus,
  onKeyDown,
}: GooglePlacesAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useNativeInput, setUseNativeInput] = useState(false);

  // Store latest callbacks in refs to avoid stale closures
  const onChangeRef = useRef(onChange);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  onChangeRef.current = onChange;
  onPlaceSelectedRef.current = onPlaceSelected;

  useEffect(() => {
    const checkGoogle = () => {
      const g = (window as any).google;
      if (g?.maps?.places) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogle()) return;

    const interval = setInterval(() => {
      if (checkGoogle()) clearInterval(interval);
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setUseNativeInput(true);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || elementRef.current) return;

    const google = (window as any).google;

    if (!google.maps.places.PlaceAutocompleteElement) {
      setUseNativeInput(true);
      return;
    }

    try {
      const el = new google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: "fr" },
        types: ["(cities)"],
      });

      el.addEventListener("gmp-select", async (event: any) => {
        const place = event?.place;
        if (!place) {
          // Fallback: read value from the input directly
          const inner = el.querySelector?.("input") || el.shadowRoot?.querySelector?.("input");
          if (inner?.value) {
            onChangeRef.current(inner.value);
          }
          return;
        }

        let city = "";
        let postalCode = "";

        try {
          await place.fetchFields({ fields: ["addressComponents", "displayName"] });
        } catch (err) {
          console.warn("fetchFields failed:", err);
        }

        if (place.addressComponents) {
          for (const comp of place.addressComponents) {
            const types = comp.types || [];
            if (types.includes("locality")) {
              city = comp.longText || comp.long_name || "";
            }
            if (types.includes("postal_code")) {
              postalCode = comp.shortText || comp.short_name || "";
            }
          }
        }

        if (!city) {
          const dn = place.displayName;
          if (typeof dn === "string") {
            city = dn;
          } else if (dn?.text) {
            city = dn.text;
          }
        }

        // If still no city, read from the input directly
        if (!city) {
          const inner = el.querySelector?.("input") || el.shadowRoot?.querySelector?.("input");
          city = inner?.value || "Lieu sélectionné";
        }

        const formatted = postalCode ? `${postalCode} ${city}` : city;
        console.log("Place selected:", { city, postalCode, formatted });
        onChangeRef.current(formatted);
        onPlaceSelectedRef.current?.({ city, postalCode, formatted });
      });

      containerRef.current.appendChild(el);
      elementRef.current = el;

      // Style, focus, and poll the inner input value
      const tryStyle = () => {
        const inner = el.querySelector?.("input") || el.shadowRoot?.querySelector?.("input");
        if (inner) {
          inner.placeholder = "Paris, Lyon, Marseille...";
          if (autoFocus) inner.focus();
          
          // Sync typed text to React state via event listener
          inner.addEventListener("input", () => {
            onChangeRef.current(inner.value);
          });

          // Also poll the value as fallback (shadow DOM may not fire events)
          const pollInterval = setInterval(() => {
            const currentValue = inner.value;
            if (currentValue) {
              onChangeRef.current(currentValue);
            }
          }, 300);

          // Store interval for cleanup
          (el as any).__pollInterval = pollInterval;
        } else {
          requestAnimationFrame(tryStyle);
        }
      };
      requestAnimationFrame(tryStyle);
    } catch (err) {
      console.warn("PlaceAutocompleteElement failed:", err);
      setUseNativeInput(true);
    }
  }, [isLoaded, autoFocus]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (elementRef.current) {
        clearInterval((elementRef.current as any).__pollInterval);
        if (containerRef.current?.contains(elementRef.current)) {
          containerRef.current.removeChild(elementRef.current);
        }
      }
      elementRef.current = null;
    };
  }, []);

  if (useNativeInput) {
    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paris, Lyon, Marseille..."
          className={`flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-center text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all focus:ring-2 focus:ring-primary/30 ${className ?? ""}`}
          autoFocus={autoFocus}
          autoComplete="off"
          onKeyDown={onKeyDown as any}
        />
      </div>
    );
  }

  return (
    <div className="relative google-places-wrapper" ref={containerRef} data-location-value={value}>
      <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" />
    </div>
  );
}

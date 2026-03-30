import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (place: { city: string; postalCode: string; formatted: string }) => void;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const LOCATION_PLACEHOLDERS: Record<string, string> = {
  fr: "Ville ou code postal",
  en: "City or postal code",
  ar: "المدينة أو الرمز البريدي",
  es: "Ciudad o código postal",
  pt: "Cidade ou código postal",
  ru: "Город или почтовый индекс",
};

export function GooglePlacesAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  className,
  autoFocus,
  onKeyDown,
}: GooglePlacesAutocompleteProps) {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const placeholder = LOCATION_PLACEHOLDERS[language] || LOCATION_PLACEHOLDERS.fr;

  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useNativeInput, setUseNativeInput] = useState(false);

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

      el.setAttribute("dir", isRTL ? "rtl" : "ltr");

      el.addEventListener("gmp-select", async (event: any) => {
        const place = event?.place;
        if (!place) {
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

        if (!city) {
          const inner = el.querySelector?.("input") || el.shadowRoot?.querySelector?.("input");
          city = inner?.value || "Lieu sélectionné";
        }

        const formatted = postalCode ? `${postalCode} ${city}` : city;
        onChangeRef.current(formatted);
        onPlaceSelectedRef.current?.({ city, postalCode, formatted });
      });

      containerRef.current.appendChild(el);
      elementRef.current = el;

      const tryStyle = () => {
        const inner = el.querySelector?.("input") || el.shadowRoot?.querySelector?.("input");
        if (inner) {
          inner.placeholder = placeholder;
          inner.setAttribute("aria-label", placeholder);
          inner.dir = isRTL ? "rtl" : "ltr";
          inner.style.textAlign = isRTL ? "right" : "left";
          inner.style.paddingInlineStart = isRTL ? "16px" : "44px";
          inner.style.paddingInlineEnd = isRTL ? "44px" : "16px";

          if (autoFocus) inner.focus();

          inner.addEventListener("input", () => {
            onChangeRef.current(inner.value);
          });

          const pollInterval = setInterval(() => {
            const currentValue = inner.value;
            if (currentValue) {
              onChangeRef.current(currentValue);
            }
          }, 300);

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
  }, [isLoaded, autoFocus, placeholder, isRTL]);

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
      <div className="relative" dir={isRTL ? "rtl" : "ltr"}>
        <MapPin className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={isRTL ? "rtl" : "ltr"}
          className={`flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all focus:ring-2 focus:ring-primary/30 ${isRTL ? "pr-10 text-right" : "pl-10 text-center"} ${className ?? ""}`}
          autoFocus={autoFocus}
          autoComplete="off"
          onKeyDown={onKeyDown as any}
        />
      </div>
    );
  }

  return (
    <div
      className="relative google-places-wrapper"
      ref={containerRef}
      data-location-value={value}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <MapPin className={`pointer-events-none absolute top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
    </div>
  );
}

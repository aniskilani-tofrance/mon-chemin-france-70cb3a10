import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ArrowRight, ArrowLeft, X, Check,
  LogIn, Users, GraduationCap, Briefcase, ClipboardList, HeartHandshake, Compass,
} from "lucide-react";

interface TourStep {
  id: string;
  icon: any;
  title: string;
  description: string;
  cta?: { label: string; action: () => void };
  highlightSelector?: string;
}

const STORAGE_KEY = "demo_tour_completed";
const RESTART_EVENT = "demo-tour:restart";

export function startDemoTour() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(RESTART_EVENT));
}

export function DemoTour() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Detect admin
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    (async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
    })();
  }, [user]);

  // Auto-open on first admin connection
  useEffect(() => {
    if (!isAdmin) return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      setStepIdx(0);
      setOpen(true);
    }
  }, [isAdmin]);

  // Manual restart
  useEffect(() => {
    const handler = () => { setStepIdx(0); setOpen(true); };
    window.addEventListener(RESTART_EVENT, handler);
    return () => window.removeEventListener(RESTART_EVENT, handler);
  }, []);

  const steps: TourStep[] = [
    {
      id: "welcome",
      icon: Sparkles,
      title: "Bienvenue dans le mode démo",
      description: "Cet assistant vous guide en 5 étapes pour présenter ToFrance sans hésitation : navigation, comptes démo et bascule entre personas.",
    },
    {
      id: "demo-bar",
      icon: Compass,
      title: "Le panneau démo (en bas à droite)",
      description: "Toujours visible. Il liste vos 5 personas, propose les pages clés du rôle actif et permet de copier les identifiants.",
      highlightSelector: "[data-tour='demo-bar']",
    },
    {
      id: "personas",
      icon: Users,
      title: "5 personas à votre disposition",
      description: "Apprenant, Formateur, Directeur, CIP, Bénévole. Les comptes sont créés automatiquement à votre première connexion admin.",
    },
    {
      id: "switch",
      icon: LogIn,
      title: "Basculer en un clic",
      description: "Cliquez sur un persona dans le panneau démo : la session est remplacée et vous êtes redirigé vers son tableau de bord.",
    },
    {
      id: "shortcuts",
      icon: GraduationCap,
      title: "Raccourcis pages clés",
      description: "Une fois connecté en tant que persona, le panneau affiche les pages essentielles à montrer (Dashboard, FLE, Apprenants, etc.).",
      cta: {
        label: "Aller à l'admin",
        action: () => navigate("/admin"),
      },
    },
  ];

  const current = steps[stepIdx];

  // Highlight target element
  useEffect(() => {
    if (!open || !current?.highlightSelector) { setHighlightRect(null); return; }
    const update = () => {
      const el = document.querySelector(current.highlightSelector!);
      if (el) setHighlightRect(el.getBoundingClientRect());
      else setHighlightRect(null);
    };
    update();
    const t = setInterval(update, 200);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      clearInterval(t);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, current?.highlightSelector]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  if (!isAdmin) return null;

  // Floating restart button when closed
  if (!open) {
    return (
      <button
        onClick={() => { setStepIdx(0); setOpen(true); }}
        className="fixed bottom-4 left-4 z-[60] rounded-full bg-card border border-border shadow-lg p-3 hover:scale-105 transition-transform"
        title="Relancer le tour démo"
      >
        <Compass className="h-5 w-5 text-primary" />
      </button>
    );
  }

  const Icon = current.icon;
  const isLast = stepIdx === steps.length - 1;

  return (
    <>
      {/* Backdrop with optional cutout */}
      <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" onClick={finish}>
        {highlightRect && (
          <div
            className="absolute rounded-lg ring-4 ring-primary ring-offset-2 ring-offset-background pointer-events-none transition-all"
            style={{
              top: highlightRect.top - 4,
              left: highlightRect.left - 4,
              width: highlightRect.width + 8,
              height: highlightRect.height + 8,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
            }}
          />
        )}
      </div>

      {/* Card */}
      <div
        className="fixed z-[71] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[min(440px,calc(100vw-2rem))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex items-center gap-3">
            <div className="p-2 rounded-full bg-white/15">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-wider opacity-80">
                Étape {stepIdx + 1} / {steps.length}
              </div>
              <div className="font-semibold text-sm leading-tight">{current.title}</div>
            </div>
            <button onClick={finish} className="p-1 hover:bg-white/15 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>

            {current.cta && (
              <Button size="sm" variant="outline" onClick={current.cta.action} className="w-full">
                {current.cta.label}
              </Button>
            )}

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 pt-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStepIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === stepIdx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-2 bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              disabled={stepIdx === 0}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Précédent
            </Button>
            {isLast ? (
              <Button size="sm" onClick={finish}>
                <Check className="h-3.5 w-3.5 mr-1" />
                Terminer
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStepIdx((i) => i + 1)}>
                Suivant
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

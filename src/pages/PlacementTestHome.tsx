import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageCircle, AlertTriangle, GraduationCap, Clock, BarChart3 } from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_69409edef41e4f2a833c897b/ac7782ec6_logopefpetit.png";

export default function PlacementTestHome() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !gdpr) {
      toast.error("Veuillez remplir tous les champs obligatoires et accepter les conditions.");
      return;
    }

    setLoading(true);

    // Check 3-month cooldown
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: existing } = await supabase
      .from("test_results")
      .select("id, created_at")
      .eq("candidate_email", email.trim().toLowerCase())
      .gte("created_at", threeMonthsAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (existing && existing.length > 0) {
      const lastDate = new Date(existing[0].created_at);
      const nextDate = new Date(lastDate);
      nextDate.setMonth(nextDate.getMonth() + 3);
      toast.error(`Vous avez déjà passé le test récemment. Vous pourrez le repasser à partir du ${nextDate.toLocaleDateString("fr-FR")}.`);
      setLoading(false);
      return;
    }

    // Store candidate info in sessionStorage and navigate
    sessionStorage.setItem("placement_candidate", JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      gdpr_consent: true,
    }));

    setLoading(false);
    navigate("/placement-test/test");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafa" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <img src={LOGO_URL} alt="PEF" className="h-12 w-auto" />
          <a
            href="https://wa.me/33652675393"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#25D366" }}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 text-center text-white" style={{ background: "linear-gradient(135deg, #00504e 0%, #17c3b2 100%)" }}>
        <div className="mx-auto max-w-3xl px-4">
          <GraduationCap className="mx-auto mb-6 h-16 w-16 opacity-90" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Test de positionnement — accès formateur
          </h1>
          <p className="mt-4 text-lg opacity-90">
            Fonctionnalité en pilote, ouverte depuis un compte formateur.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>~30 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span>Niveau A1 → C2</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              <span>71 questions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-lg px-4 -mt-8">
        <form
          onSubmit={handleStart}
          className="rounded-2xl border bg-white p-8 shadow-xl"
        >
          <h2 className="mb-6 text-xl font-bold" style={{ color: "#00504e" }}>
            Accès réservé
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            Le test reste visible en teaser pendant la finalisation. Connectez-vous comme formateur pour lancer une session candidat.
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nom complet *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                disabled
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email *
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                disabled
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                disabled
              />
            </div>

            {/* RGPD */}
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
              <Checkbox
                id="gdpr"
                checked={gdpr}
                onCheckedChange={(v) => setGdpr(v === true)}
                className="mt-0.5"
                disabled
              />
              <label htmlFor="gdpr" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                J'accepte que mes données soient traitées conformément à la politique de confidentialité pour la réalisation de ce test. *
              </label>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 rounded-lg border p-3" style={{ borderColor: "#17c3b2", backgroundColor: "#f0fdfb" }}>
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: "#17c3b2" }} />
              <p className="text-xs text-gray-600">
                Ce test est <strong>indicatif</strong> et ne constitue pas une certification officielle. Il permet d'estimer votre niveau CECRL.
              </p>
            </div>
          </div>

          <Button
            type="button"
            asChild
            className="mt-6 w-full text-white border-0"
            size="lg"
            style={{ background: "linear-gradient(135deg, #00504e 0%, #17c3b2 100%)" }}
          >
            <Link to="/login?redirect=/placement-test/trainer">
              Connexion formateur
            </Link>
          </Button>
        </form>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t bg-white py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-4 text-xs text-gray-500">
          <a href="/placement-test/mentions-legales" className="hover:underline">Mentions légales</a>
          <a href="/placement-test/cgu" className="hover:underline">CGU</a>
          <a href="/placement-test/confidentialite" className="hover:underline">Politique de confidentialité</a>
          <a href="/placement-test/faq" className="hover:underline">FAQ</a>
          <a href="mailto:contact@example.com" className="hover:underline">Contact</a>
        </div>
      </footer>
    </div>
  );
}

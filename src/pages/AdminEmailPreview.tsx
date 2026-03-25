import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import logoSrc from "@/assets/logo-tofrance.png";

const ROUTE_LABELS: Record<string, { label: string; emoji: string; desc: string; color: string }> = {
  route_a: { label: "Parcours FLE", emoji: "📘", desc: "Formation en français langue étrangère", color: "#3b82f6" },
  route_b: { label: "Parcours Formation", emoji: "🎓", desc: "Formation professionnelle qualifiante", color: "#8b5cf6" },
  route_c: { label: "Parcours Emploi", emoji: "💼", desc: "Accès direct au marché du travail", color: "#059669" },
  sas: { label: "Accompagnement", emoji: "🤝", desc: "Orientation et accompagnement personnalisé", color: "#d97706" },
};

const LOGO_URL = "https://tofrancebeta.lovable.app/assets/logo-tofrance.png";

const emailBase: React.CSSProperties = {
  fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  background: "#f1f5f9",
  padding: 40,
};

const cardBase: React.CSSProperties = {
  maxWidth: 580,
  margin: "0 auto",
  background: "#ffffff",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
};

const headerStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)",
  padding: "32px 40px 24px",
  textAlign: "center",
};

const bodyStyle: React.CSSProperties = {
  padding: "36px 40px",
};

const footerStyle: React.CSSProperties = {
  background: "#f8fafc",
  padding: "20px 40px",
  textAlign: "center",
  borderTop: "1px solid #e2e8f0",
};

const ctaButton = (bg = "#1e3a5f"): React.CSSProperties => ({
  background: bg,
  color: "#ffffff",
  padding: "16px 36px",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 15,
  display: "inline-block",
  letterSpacing: "0.01em",
  boxShadow: "0 2px 8px rgba(30,58,95,0.3)",
});

function EmailHeader({ subtitle }: { subtitle: string }) {
  return (
    <div style={headerStyle}>
      <div style={{ background: "#ffffff", display: "inline-block", padding: "14px 28px", borderRadius: 12, marginBottom: 12 }}>
        <img src={logoSrc} alt="ToFrance" style={{ height: 120 }} />
      </div>
      <p style={{ color: "#94b8db", margin: 0, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{subtitle}</p>
    </div>
  );
}

function EmailFooter() {
  return (
    <div style={footerStyle}>
      <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
        ToFrance — Plateforme d'orientation pour primo-arrivants
        <br />
        <a href="#" style={{ color: "#64748b", textDecoration: "underline" }}>Politique de confidentialité</a>
        {" · "}
        <a href="#" style={{ color: "#64748b", textDecoration: "underline" }}>Se désinscrire</a>
      </p>
    </div>
  );
}

function CandidateEmailPreview({ firstName, route, matchCount }: { firstName: string; route: string; matchCount: number }) {
  const routeInfo = ROUTE_LABELS[route] || ROUTE_LABELS.sas;
  return (
    <div style={emailBase}>
      <div style={cardBase}>
        <EmailHeader subtitle="Confirmation de votre inscription" />
        <div style={bodyStyle}>
          <p style={{ fontSize: 18, color: "#1e293b", margin: "0 0 8px", fontWeight: 600 }}>
            Bonjour{firstName ? <> {firstName}</> : ""} 👋
          </p>
          <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.6, margin: "0 0 24px" }}>
            Merci d'avoir complété votre orientation sur ToFrance. Votre profil a bien été enregistré et nous avons identifié le meilleur parcours pour vous.
          </p>

          <div style={{
            background: `linear-gradient(135deg, ${routeInfo.color}10 0%, ${routeInfo.color}05 100%)`,
            borderRadius: 12,
            padding: 24,
            margin: "0 0 24px",
            border: `1px solid ${routeInfo.color}20`,
            position: "relative" as const,
          }}>
            <div style={{
              position: "absolute" as const,
              top: 0,
              left: 0,
              width: 4,
              height: "100%",
              background: routeInfo.color,
              borderRadius: "12px 0 0 12px",
            }} />
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.08em", fontWeight: 700 }}>
              Votre parcours recommandé
            </p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" }}>
              {routeInfo.emoji} {routeInfo.label}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#475569", lineHeight: 1.5 }}>{routeInfo.desc}</p>
          </div>

          {matchCount > 0 ? (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 18px", margin: "0 0 28px" }}>
              <p style={{ fontSize: 14, color: "#166534", margin: 0, fontWeight: 500 }}>
                ✅ <strong>{matchCount} organisme{matchCount > 1 ? "s" : ""}</strong> correspond{matchCount > 1 ? "ent" : ""} à votre profil. Vous serez recontacté(e) sous 48h.
              </p>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: "#475569", margin: "0 0 28px" }}>
              Nous recherchons les meilleurs organismes pour votre profil. Vous serez recontacté(e) prochainement.
            </p>
          )}

          <div style={{ textAlign: "center", margin: "0 0 24px" }}>
            <a href="#" style={ctaButton()}>
              Gérer mes données →
            </a>
          </div>
          <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", margin: 0 }}>
            Vous pouvez consulter, modifier ou supprimer vos données à tout moment.
          </p>
        </div>
        <EmailFooter />
      </div>
    </div>
  );
}

function PartnerEmailPreview({ providerName, matchScore }: { providerName: string; matchScore: number }) {
  const tier = matchScore >= 80 ? "Premium" : matchScore >= 50 ? "Standard" : "Éco";
  const tierColor = tier === "Premium" ? "#16a34a" : tier === "Standard" ? "#2563eb" : "#f59e0b";
  const tierBg = tier === "Premium" ? "#f0fdf4" : tier === "Standard" ? "#eff6ff" : "#fffbeb";
  const tierEmoji = tier === "Premium" ? "🌟" : tier === "Standard" ? "✅" : "📋";

  return (
    <div style={emailBase}>
      <div style={cardBase}>
        <EmailHeader subtitle="Nouveau lead disponible" />
        <div style={bodyStyle}>
          <p style={{ fontSize: 18, color: "#1e293b", margin: "0 0 8px", fontWeight: 600 }}>
            Bonjour {providerName} 👋
          </p>
          <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.6, margin: "0 0 24px" }}>
            Un nouveau candidat correspond à vos critères de formation. Consultez les détails ci-dessous.
          </p>

          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 24, margin: "0 0 24px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 700 }}>Qualité du lead</span>
              <span style={{
                background: tierColor,
                color: "white",
                padding: "5px 16px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}>
                {tierEmoji} {tier}
              </span>
            </div>

            <div style={{ background: "#ffffff", borderRadius: 8, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#64748b" }}>Score de match</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#1e293b" }}>{matchScore}%</span>
              </div>
              <div style={{ marginTop: 8, background: "#e2e8f0", borderRadius: 4, height: 6, overflow: "hidden" }}>
                <div style={{ width: `${matchScore}%`, height: "100%", background: tierColor, borderRadius: 4 }} />
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", margin: "0 0 24px" }}>
            <a href="#" style={ctaButton()}>
              Voir le lead →
            </a>
          </div>
          <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", margin: 0 }}>
            Connectez-vous à votre espace partenaire pour consulter et débloquer ce lead.
          </p>
        </div>
        <EmailFooter />
      </div>
    </div>
  );
}

export default function AdminEmailPreview() {
  const [firstName, setFirstName] = useState("Amina");
  const [route, setRoute] = useState("route_a");
  const [matchCount, setMatchCount] = useState(3);
  const [providerName, setProviderName] = useState("AFPA Île-de-France");
  const [matchScore, setMatchScore] = useState(85);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour au dashboard admin
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Prévisualisation des emails</h1>
        <p className="mb-8 text-muted-foreground">Ajustez les paramètres pour prévisualiser le rendu des emails transactionnels.</p>

        <Tabs defaultValue="candidate" className="space-y-6">
          <TabsList>
            <TabsTrigger value="candidate">📧 Email Candidat</TabsTrigger>
            <TabsTrigger value="partner">📧 Email Partenaire</TabsTrigger>
          </TabsList>

          <TabsContent value="candidate" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-lg border border-border bg-card p-4">
              <div>
                <Label>Prénom</Label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div>
                <Label>Parcours</Label>
                <Select value={route} onValueChange={setRoute}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROUTE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Organismes matchés</Label>
                <Input type="number" min={0} max={20} value={matchCount} onChange={e => setMatchCount(Number(e.target.value))} />
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-border shadow-lg">
              <CandidateEmailPreview firstName={firstName} route={route} matchCount={matchCount} />
            </div>
          </TabsContent>

          <TabsContent value="partner" className="space-y-6">
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-card p-4">
              <div>
                <Label>Nom du partenaire</Label>
                <Input value={providerName} onChange={e => setProviderName(e.target.value)} />
              </div>
              <div>
                <Label>Score de match (%)</Label>
                <Input type="number" min={0} max={100} value={matchScore} onChange={e => setMatchScore(Number(e.target.value))} />
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-border shadow-lg">
              <PartnerEmailPreview providerName={providerName} matchScore={matchScore} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

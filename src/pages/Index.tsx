import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { EmployersSection } from "@/components/EmployersSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { AccessCodeSection } from "@/components/AccessCodeSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ToFrance",
  url: "https://tofrance.app",
  description: "Plateforme d'accueil et d'orientation pour les nouveaux arrivants en France",
  sameAs: [],
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="ToFrance — Réussir votre nouvelle vie en France"
        description="Plateforme d'accueil et d'accompagnement pour les nouveaux arrivants en France. Cours de français, formations professionnelles et orientation."
        path="/"
        jsonLd={jsonLd}
      />
      <Header />
      <main>
        <HeroSection />
        <EmployersSection />
        <HowItWorksSection />
        <FeaturesSection />
        <AccessCodeSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

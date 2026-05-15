import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { EmployersSection } from "@/components/EmployersSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { AccessCodeSection } from "@/components/AccessCodeSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { detectUserRole, getRoleDashboardPath, isStaffRole } from "@/hooks/useRoleCheck";
import { LoadingScreen } from "@/components/LoadingScreen";

const SEO_BY_LANG: Record<LanguageCode, { title: string; description: string }> = {
  fr: {
    title: "ToFrance — Votre boussole d'orientation multilingue en France",
    description: "Diagnostic en 5 minutes dans votre langue, puis un conseiller vous rappelle sous 48h pour vous orienter : français, formation, emploi, diplôme, social.",
  },
  en: {
    title: "ToFrance — Your multilingual orientation compass in France",
    description: "5-minute diagnosis in your language, then an advisor calls you back within 48h to guide you: French, training, employment, diploma, social support.",
  },
  ar: {
    title: "ToFrance — بوصلة التوجيه متعددة اللغات في فرنسا",
    description: "تشخيص في 5 دقائق بلغتك، ثم يتصل بك مستشار خلال 48 ساعة لتوجيهك: الفرنسية، التكوين، العمل، الشهادات، الدعم الاجتماعي.",
  },
  es: {
    title: "ToFrance — Tu brújula de orientación multilingüe en Francia",
    description: "Diagnóstico en 5 minutos en tu idioma, luego un asesor te llama en menos de 48h para orientarte: francés, formación, empleo, diploma, social.",
  },
  pt: {
    title: "ToFrance — Sua bússola de orientação multilíngue na França",
    description: "Diagnóstico em 5 minutos no seu idioma, depois um conselheiro liga em até 48h para orientá-lo: francês, formação, emprego, diploma, social.",
  },
  ru: {
    title: "ToFrance — Многоязычный компас ориентации во Франции",
    description: "Диагностика за 5 минут на вашем языке, затем консультант перезвонит в течение 48 часов: французский, обучение, работа, дипломы, социальная помощь.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ToFrance",
  url: "https://tofrance.life",
  description:
    "Boussole d'orientation multilingue pour les primo-arrivants en France, avec un relais humain sous 48h.",
  sameAs: [],
};

const Index = () => {
  const { language } = useLanguage();
  const meta = SEO_BY_LANG[language] ?? SEO_BY_LANG.fr;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={meta.title}
        description={meta.description}
        path="/home"
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

import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DirecteurSidebar } from "@/components/Directeur/DirecteurSidebar";
import { DirecteurAccueil } from "@/components/Directeur/DirecteurAccueil";
import { DirecteurFormateursOverview } from "@/components/Directeur/DirecteurFormateursOverview";
import { DirecteurPerformance } from "@/components/Directeur/DirecteurPerformance";
import { DirecteurLearnerDetail } from "@/components/Directeur/DirecteurLearnerDetail";
import { DirecteurOnboardingResults } from "@/components/Directeur/DirecteurOnboardingResults";
import { SEO } from "@/components/SEO";
import { DemoBanner } from "@/components/DemoBanner";

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/directeur": { title: "Tableau de bord" },
  "/directeur/apprenants": {
    title: "Apprenants",
    subtitle: "Détail individuel et progression",
  },
  "/directeur/formateurs": {
    title: "Formateurs",
    subtitle: "Performance par formateur",
  },
  "/directeur/performance": {
    title: "Performance",
    subtitle: "Modules complétés par secteur",
  },
  "/directeur/onboarding": {
    title: "Onboarding Marianne",
    subtitle: "Leads et résultats du parcours vocal",
  },
};

function DirecteurHeader() {
  const { pathname } = useLocation();
  const meta = PAGE_TITLES[pathname] || { title: "Espace directeur" };
  return (
    <header className="sticky top-0 z-20 h-16 flex items-center gap-3 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 print:hidden">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="h-6 w-px bg-border" />
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold leading-tight truncate">
          {meta.title}
        </h1>
        {meta.subtitle && (
          <p className="text-xs text-muted-foreground truncate">{meta.subtitle}</p>
        )}
      </div>
    </header>
  );
}

export default function DirecteurDashboard() {
  return (
    <SidebarProvider>
      <SEO
        title="Espace Directeur"
        description="Tableau de bord directeur ToFrance"
        path="/directeur"
      />
      <div className="min-h-screen flex w-full bg-muted/30">
        <div className="print:hidden">
          <DirecteurSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <DirecteurHeader />
          <main className="flex-1 p-4 md:p-6 overflow-auto print:p-0 print:overflow-visible">
            <div className="print:hidden">
              <DemoBanner />
            </div>
            <Routes>
              <Route index element={<DirecteurAccueil />} />
              <Route path="apprenants" element={<DirecteurLearnerDetail />} />
              <Route path="formateurs" element={<DirecteurFormateursOverview />} />
              <Route path="performance" element={<DirecteurPerformance />} />
              <Route path="onboarding" element={<DirecteurOnboardingResults />} />
              <Route path="*" element={<Navigate to="/directeur" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

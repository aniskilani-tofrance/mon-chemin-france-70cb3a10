import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FormateurSidebar } from "@/components/Formateur/FormateurSidebar";
import { FormateurAccueil } from "@/components/Formateur/FormateurAccueil";
import { FormateurApprenants } from "@/components/Formateur/FormateurApprenants";
import { FormateurContenus } from "@/components/Formateur/FormateurContenus";
import { FormateurAssignations } from "@/components/Formateur/FormateurAssignations";
import { FormateurEvaluations } from "@/components/Formateur/FormateurEvaluations";
import { FormateurAFEST } from "@/components/Formateur/FormateurAFEST";
import { FormateurDiagnosticPapier } from "@/components/Formateur/FormateurDiagnosticPapier";
import { SEO } from "@/components/SEO";
import { DemoBanner } from "@/components/DemoBanner";

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/formateur": { title: "Tableau de bord" },
  "/formateur/apprenants": { title: "Mes apprenants", subtitle: "Suivi individuel et activité" },
  "/formateur/contenus": { title: "Contenus FLE", subtitle: "Bibliothèque de modules" },
  "/formateur/assignations": { title: "Assignations", subtitle: "Modules assignés à vos apprenants" },
  "/formateur/evaluations": { title: "Évaluations", subtitle: "Productions orales à corriger" },
  "/formateur/afest": { title: "Suivi AFEST", subtitle: "Action de formation en situation de travail" },
  "/formateur/diagnostic-papier": { title: "Diagnostic papier", subtitle: "Saisie manuelle d'un diagnostic" },
};

function FormateurHeader() {
  const { pathname } = useLocation();
  const meta = PAGE_TITLES[pathname] || { title: "Espace formateur" };
  return (
    <header className="sticky top-0 z-20 h-16 flex items-center gap-3 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 print:hidden">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="h-6 w-px bg-border" />
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold leading-tight truncate">{meta.title}</h1>
        {meta.subtitle && (
          <p className="text-xs text-muted-foreground truncate">{meta.subtitle}</p>
        )}
      </div>
    </header>
  );
}

export default function FormateurDashboard() {
  return (
    <SidebarProvider>
      <SEO title="Espace Formateur" description="Dashboard formateur ToFrance" path="/formateur" />
      <div className="min-h-screen flex w-full bg-muted/30">
        <div className="print:hidden">
          <FormateurSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <FormateurHeader />
          <main className="flex-1 p-4 md:p-6 overflow-auto print:p-0 print:overflow-visible">
            <div className="print:hidden">
              <DemoBanner />
            </div>
            <Routes>
              <Route index element={<FormateurAccueil />} />
              <Route path="apprenants" element={<FormateurApprenants />} />
              <Route path="contenus" element={<FormateurContenus />} />
              <Route path="assignations" element={<FormateurAssignations />} />
              <Route path="evaluations" element={<FormateurEvaluations />} />
              <Route path="afest" element={<FormateurAFEST />} />
              <Route path="diagnostic-papier" element={<FormateurDiagnosticPapier />} />
              <Route path="*" element={<Navigate to="/formateur" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

import { Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FormateurSidebar } from "@/components/Formateur/FormateurSidebar";
import { FormateurApprenants } from "@/components/Formateur/FormateurApprenants";
import { FormateurContenus } from "@/components/Formateur/FormateurContenus";
import { FormateurAssignations } from "@/components/Formateur/FormateurAssignations";
import { FormateurEvaluations } from "@/components/Formateur/FormateurEvaluations";
import { FormateurAFEST } from "@/components/Formateur/FormateurAFEST";
import { FormateurDiagnosticPapier } from "@/components/Formateur/FormateurDiagnosticPapier";
import { SEO } from "@/components/SEO";
import { DemoBanner } from "@/components/DemoBanner";

export default function FormateurDashboard() {
  return (
    <SidebarProvider>
      <SEO title="Espace Formateur" description="Dashboard formateur ToFrance" path="/formateur" />
      <div className="min-h-screen flex w-full">
        <FormateurSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-semibold">Espace Formateur</h1>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <DemoBanner />
            <Routes>
              <Route index element={<FormateurApprenants />} />
              <Route path="contenus" element={<FormateurContenus />} />
              <Route path="assignations" element={<FormateurAssignations />} />
              <Route path="evaluations" element={<FormateurEvaluations />} />
              <Route path="afest" element={<FormateurAFEST />} />
              <Route path="diagnostic-papier" element={<FormateurDiagnosticPapier />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";

// Eagerly loaded (critical path)
import Index from "./pages/Index";

// Lazy loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const ConfirmationPage = lazy(() => import("./pages/ConfirmationPage"));
const Partners = lazy(() => import("./pages/Partners"));
const PartnersInfo = lazy(() => import("./pages/PartnersInfo"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const MyDataPage = lazy(() => import("./pages/MyDataPage"));
const Pitch = lazy(() => import("./pages/Pitch"));
const PartnerDashboard = lazy(() => import("./pages/PartnerDashboard"));
const PartnerProfile = lazy(() => import("./pages/PartnerProfile"));
const PartnerSignup = lazy(() => import("./pages/PartnerSignup"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminEmailPreview = lazy(() => import("./pages/AdminEmailPreview"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const Heberger = lazy(() => import("./pages/Heberger"));
const PitchRegion = lazy(() => import("./pages/PitchRegion"));
const FLEDashboard = lazy(() => import("./pages/FLEDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { OAuthRedirectHandler } from "./components/OAuthRedirectHandler";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <OAuthRedirectHandler />
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/partners" element={<AdminRoute><Partners /></AdminRoute>} />
              <Route path="/devenir-partenaire" element={<PartnersInfo />} />
              <Route path="/partner-signup" element={<PartnerSignup />} />
              <Route path="/confidentialite" element={<PrivacyPage />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/mes-donnees" element={<MyDataPage />} />
              <Route path="/heberger" element={<Heberger />} />
              <Route path="/pitch" element={<Pitch />} />
              <Route path="/pitch-region" element={<PitchRegion />} />
              <Route path="/partner-dashboard" element={<ProtectedRoute><PartnerDashboard /></ProtectedRoute>} />
              <Route path="/partner-profile" element={<ProtectedRoute><PartnerProfile /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/email-preview" element={<AdminRoute><AdminEmailPreview /></AdminRoute>} />
              <Route path="/fle" element={<ProtectedRoute><FLEDashboard /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
  </ErrorBoundary>
);

export default App;

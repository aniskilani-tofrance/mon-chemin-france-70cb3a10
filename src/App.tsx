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
import { FLEInstallPrompt } from "@/components/FLE/FLEInstallPrompt";

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
const AdminFLEProgress = lazy(() => import("./pages/AdminFLEProgress"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const Heberger = lazy(() => import("./pages/Heberger"));
const PitchRegion = lazy(() => import("./pages/PitchRegion"));
const FLEDashboard = lazy(() => import("./pages/FLEDashboard"));
const FLEExercise = lazy(() => import("./pages/FLEExercise"));
const FLEDialogue = lazy(() => import("./pages/FLEDialogue"));
const FLEReview = lazy(() => import("./pages/FLEReview"));
const FormateurDashboard = lazy(() => import("./pages/FormateurDashboard"));
const DirecteurDashboard = lazy(() => import("./pages/DirecteurDashboard"));

const PlacementTestHome = lazy(() => import("./pages/PlacementTestHome"));
const PlacementTest = lazy(() => import("./pages/PlacementTest"));
const PlacementTestResults = lazy(() => import("./pages/PlacementTestResults"));
const PlacementTestTrainer = lazy(() => import("./pages/PlacementTestTrainer"));
const PlacementTestLegal = lazy(() => import("./pages/PlacementTestLegal"));

const NotFound = lazy(() => import("./pages/NotFound"));

import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { FormateurRoute } from "./components/FormateurRoute";
import { DirecteurRoute } from "./components/DirecteurRoute";
import { OAuthRedirectHandler } from "./components/OAuthRedirectHandler";
import { FLEGatedRoute } from "./components/FLEGatedRoute";

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
          <FLEInstallPrompt />
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
              <Route path="/admin/fle" element={<AdminRoute><AdminFLEProgress /></AdminRoute>} />
              <Route path="/formateur/*" element={<FormateurRoute><FormateurDashboard /></FormateurRoute>} />
              <Route path="/fle" element={<FLEGatedRoute><FLEDashboard /></FLEGatedRoute>} />
              <Route path="/fle/exercise/:moduleId" element={<FLEGatedRoute><FLEExercise /></FLEGatedRoute>} />
              <Route path="/fle/dialogue" element={<FLEGatedRoute><FLEDialogue /></FLEGatedRoute>} />
              <Route path="/fle/review" element={<FLEGatedRoute><FLEReview /></FLEGatedRoute>} />
              <Route path="/placement-test" element={<PlacementTestHome />} />
              <Route path="/placement-test/test" element={<PlacementTest />} />
              <Route path="/placement-test/results" element={<PlacementTestResults />} />
              <Route path="/placement-test/trainer" element={<PlacementTestTrainer />} />
              <Route path="/placement-test/:page" element={<PlacementTestLegal />} />
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

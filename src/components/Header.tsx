import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X, Building2, ShieldCheck, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/hooks/useLanguage";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/hooks/useAuth";
import logoTofrance from "@/assets/logo-tofrance.png";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { isAdmin } = useAdminCheck();
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-primary/10 bg-card/80 px-4 py-3 shadow-soft backdrop-blur-xl sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logoTofrance} alt="ToFrance" className="h-24 w-auto" width={96} height={96} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            <Link to="/devenir-partenaire" className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              <Building2 className="h-4 w-4" />
              Devenir partenaire
            </Link>
            <Link to="/heberger" className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              <Building2 className="h-4 w-4" />
              Héberger la plateforme
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1 text-sm font-medium text-destructive transition-colors hover:text-destructive/80">
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="hidden items-center gap-3 sm:flex">
            <LanguageSelector />
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" asChild>
                  <Link to="/dashboard">
                    <User className="h-4 w-4" />
                    {user.email?.split("@")[0]}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <Link to="/login">
                    <LogIn className="h-4 w-4" />
                    Connexion
                  </Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/onboarding">{t.startJourney}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 sm:hidden">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-2 overflow-hidden rounded-2xl border border-primary/10 bg-card/95 shadow-lg backdrop-blur-xl lg:hidden"
          >
            <nav className="flex flex-col gap-2 p-4">
              <Link
                to="/devenir-partenaire"
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Building2 className="h-4 w-4" />
                Devenir partenaire
              </Link>
              <Link
                to="/heberger"
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Building2 className="h-4 w-4" />
                Héberger la plateforme
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              )}
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    {user.email?.split("@")[0]}
                  </Link>
                  <Button variant="outline" className="mt-2 gap-2" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="mt-2 gap-2" asChild>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <LogIn className="h-4 w-4" />
                      Connexion
                    </Link>
                  </Button>
                  <Button variant="hero" className="mt-2" asChild>
                    <Link to="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                      {t.startJourney}
                    </Link>
                  </Button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

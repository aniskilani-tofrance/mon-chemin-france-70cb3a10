import { Link } from "react-router-dom";
import logoTofrance from "@/assets/logo-tofrance.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo & description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoTofrance} alt="ToFrance" className="h-24 w-auto" width={96} height={96} />
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Plateforme d'orientation et de mise en relation pour les nouveaux arrivants en France.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Professionnels</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/devenir-partenaire" className="hover:text-primary">
                  Devenir partenaire
                </Link>
              </li>
              <li>
                <Link to="/heberger" className="hover:text-primary">
                  Héberger la plateforme
                </Link>
              </li>
              <li>
                <Link to="/partner-signup" className="hover:text-primary">
                  Inscription partenaire
                </Link>
              </li>
              <li>
                <Link to="/recrutement" className="hover:text-primary">
                  Recrutement
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Informations</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/mentions-legales" className="hover:text-primary">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="hover:text-primary">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/pitch" className="hover:text-primary">
                  Investisseurs
                </Link>
              </li>
              <li>
                <a href="mailto:contact@tofrance.app" className="hover:text-primary">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 ToFrance. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

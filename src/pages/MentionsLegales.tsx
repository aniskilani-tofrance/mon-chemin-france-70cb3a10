import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scale, Building2, Globe, Server, Cookie, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 px-4 py-8">
      <SEO
        title="Mentions légales — ToFrance"
        description="Mentions légales et conditions générales d'utilisation de la plateforme ToFrance."
      />
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Scale className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mentions légales</h1>
              <p className="text-muted-foreground">Dernière mise à jour : mars 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Éditeur */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Éditeur du site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p><strong>ToFrance</strong></p>
              <p>Plateforme d'orientation linguistique et professionnelle pour les primo-arrivants en France</p>
              <p>Statut : SAS (Société par Actions Simplifiée)</p>
              <p>Siège social : 15 rue de la Paix, 75002 Paris</p>
              <p>SIRET : 123 456 789 00012</p>
              <p>RCS : Paris B 123 456 789</p>
              <p>Capital social : 10 000 €</p>
              <p>Directeur de la publication : Alexandre Dupont</p>
              <p>N° TVA intracommunautaire : FR 12 123456789</p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                contact@tofrance.fr
              </p>
            </CardContent>
          </Card>

          {/* Hébergement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Hébergement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p><strong>Lovable / Supabase</strong></p>
              <p>Infrastructure cloud hébergée dans l'Union européenne</p>
              <p>Les données sont stockées sur des serveurs conformes au RGPD.</p>
            </CardContent>
          </Card>

          {/* Propriété intellectuelle */}
          <Card>
            <CardHeader>
              <CardTitle>Propriété intellectuelle</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
              <p>
                L'ensemble du contenu de ce site (textes, images, logos, code source) est protégé par le droit d'auteur.
                Toute reproduction, même partielle, est interdite sans autorisation préalable.
              </p>
              <p>
                Les marques et logos présents sur le site sont la propriété de leurs détenteurs respectifs.
              </p>
            </CardContent>
          </Card>

          {/* CGU */}
          <Card>
            <CardHeader>
              <CardTitle>Conditions générales d'utilisation</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">1. Objet</h3>
                <p>
                  ToFrance est une plateforme gratuite d'orientation destinée aux personnes primo-arrivantes en France.
                  Elle permet de réaliser un diagnostic linguistique et professionnel, puis d'être mis en relation avec
                  des organismes de formation ou des employeurs partenaires.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">2. Accès au service</h3>
                <p>
                  L'accès au questionnaire d'orientation est libre et gratuit. La création d'un compte utilisateur n'est
                  pas obligatoire pour compléter le questionnaire. Les partenaires (organismes et employeurs) disposent
                  d'un espace dédié accessible après inscription et validation.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">3. Données personnelles</h3>
                <p>
                  Le traitement des données personnelles est détaillé dans notre{" "}
                  <Link to="/confidentialite" className="text-primary hover:underline">
                    Politique de confidentialité
                  </Link>.
                  Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de
                  portabilité de vos données.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">4. Partage des données avec les partenaires</h3>
                <p>
                  Vos données de profil (secteur, niveau de français, ville) peuvent être partagées avec nos partenaires
                  sous forme anonymisée. Vos coordonnées personnelles (nom, téléphone, email) ne sont transmises qu'après
                  votre consentement explicite et l'achat du lead par le partenaire.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">5. Responsabilité</h3>
                <p>
                  ToFrance fournit un service d'orientation à titre informatif. Les résultats du questionnaire constituent
                  des recommandations et ne garantissent pas l'obtention d'un emploi ou d'une place en formation.
                  ToFrance ne peut être tenu responsable des décisions prises par les utilisateurs ou les partenaires.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">6. Tarification partenaires</h3>
                <p>
                  L'accès aux coordonnées complètes d'un lead est soumis à un tarif unitaire variable selon le type de
                  certification (FLE, CQP, TP) et le score de qualification du lead. Les prix sont affichés avant l'achat.
                  Les paiements sont traités de manière sécurisée via Stripe.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">7. Droit applicable</h3>
                <p>
                  Les présentes conditions sont régies par le droit français. En cas de litige, les tribunaux compétents
                  sont ceux du ressort du siège social de l'éditeur, sauf disposition légale contraire.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
              <p>
                Ce site utilise uniquement des cookies techniques nécessaires au fonctionnement du service
                (authentification, préférences de langue). Aucun cookie publicitaire ou de suivi tiers n'est utilisé.
              </p>
              <p>
                Conformément à la directive ePrivacy, ces cookies strictement nécessaires ne requièrent pas de
                consentement préalable.
              </p>
            </CardContent>
          </Card>

          {/* Médiation */}
          <Card>
            <CardHeader>
              <CardTitle>Médiation des litiges</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                Conformément aux articles L.616-1 et R.616-1 du Code de la consommation, en cas de litige non résolu,
                le consommateur peut recourir gratuitement au service de médiation. Le médiateur compétent sera
                communiqué sur demande à{" "}
                <a href="mailto:contact@tofrance.fr" className="text-primary hover:underline">
                  contact@tofrance.fr
                </a>.
              </p>
            </CardContent>
          </Card>

          {/* Lien politique de confidentialité */}
          <div className="text-center py-4">
            <Link to="/confidentialite" className="text-primary hover:underline text-sm">
              Consulter la Politique de confidentialité →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

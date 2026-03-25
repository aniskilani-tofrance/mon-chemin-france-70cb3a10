import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Mail, MapPin, Clock, Users, FileText, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
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
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Politique de confidentialité
              </h1>
              <p className="text-muted-foreground">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Responsable du traitement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Responsable du traitement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p><strong>Accueil en France</strong></p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                [Adresse à compléter]
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                contact@accueil-en-france.fr
              </p>
            </CardContent>
          </Card>

          {/* Données collectées */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Données collectées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Nous collectons les données suivantes lors de votre inscription :</p>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li>Prénom et nom</li>
                <li>Adresse email</li>
                <li>Pays d'origine</li>
                <li>Ville de résidence en France</li>
                <li>Niveau de français</li>
                <li>Secteur professionnel précédent</li>
                <li>Secteur professionnel recherché</li>
                <li>Disponibilité pour les formations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Finalités */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Finalités du traitement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Vos données sont utilisées pour :</p>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li>Vous proposer des formations adaptées à votre profil</li>
                <li>Permettre à nos partenaires de formation de vous contacter (avec votre accord)</li>
                <li>Améliorer nos services</li>
                <li>Vous envoyer des informations sur nos services (si vous y avez consenti)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Base légale */}
          <Card>
            <CardHeader>
              <CardTitle>Base légale</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                Le traitement de vos données est fondé sur votre <strong>consentement explicite</strong> (Article 6.1.a du RGPD). 
                Vous pouvez retirer votre consentement à tout moment.
              </p>
            </CardContent>
          </Card>

          {/* Destinataires */}
          <Card>
            <CardHeader>
              <CardTitle>Destinataires des données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Vos données peuvent être partagées avec :</p>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li><strong>Nos partenaires de formation</strong> : uniquement votre profil anonymisé (sans email) dans un premier temps</li>
                <li><strong>Vos coordonnées complètes</strong> : uniquement après votre accord explicite pour chaque demande de contact</li>
              </ul>
              <p className="mt-4 rounded-lg bg-primary/5 p-3 text-sm">
                ⚠️ Vos données ne sont jamais vendues à des tiers. Elles ne sont transmises qu'aux partenaires de formation avec votre consentement explicite.
              </p>
            </CardContent>
          </Card>

          {/* Durée de conservation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Durée de conservation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li>Données de profil : 3 ans après la dernière connexion</li>
                <li>Consentements : 5 ans (obligation légale)</li>
                <li>Logs de connexion : 1 an</li>
              </ul>
            </CardContent>
          </Card>

          {/* Vos droits */}
          <Card>
            <CardHeader>
              <CardTitle>Vos droits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-inside list-disc space-y-1 pl-4">
                <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
                <li><strong>Droit de rectification</strong> : corriger vos données</li>
                <li><strong>Droit à l'effacement</strong> : supprimer vos données</li>
                <li><strong>Droit à la portabilité</strong> : récupérer vos données dans un format lisible</li>
                <li><strong>Droit d'opposition</strong> : vous opposer au traitement</li>
                <li><strong>Droit de retrait du consentement</strong> : à tout moment</li>
              </ul>
              <p className="mt-4">
                Pour exercer ces droits, rendez-vous sur la page{" "}
                <Link to="/mes-donnees" className="text-primary hover:underline">
                  Mes données
                </Link>{" "}
                ou contactez-nous à{" "}
                <a href="mailto:rgpd@accueil-en-france.fr" className="text-primary hover:underline">
                  rgpd@accueil-en-france.fr
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Contact DPO */}
          <Card>
            <CardHeader>
              <CardTitle>Délégué à la Protection des Données (DPO)</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                Pour toute question relative à la protection de vos données, vous pouvez contacter notre DPO :
              </p>
              <p className="mt-2 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:dpo@accueil-en-france.fr" className="text-primary hover:underline">
                  dpo@accueil-en-france.fr
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Réclamation */}
          <Card>
            <CardHeader>
              <CardTitle>Réclamation</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la{" "}
                <a 
                  href="https://www.cnil.fr/fr/plaintes" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Commission Nationale de l'Informatique et des Libertés (CNIL)
                </a>.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  User, 
  Download, 
  Trash2, 
  Shield, 
  Check, 
  X,
  Mail,
  MapPin,
  Briefcase,
  Target
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserData {
  profile: Record<string, unknown> | null;
  consents: Array<{
    consent_type: string;
    consented: boolean;
    consented_at: string | null;
  }>;
}

export default function MyDataPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>({ profile: null, consents: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Get data from localStorage (for non-authenticated users)
      const storedAnswers = localStorage.getItem("onboarding_answers");
      const storedEmail = localStorage.getItem("user_email");
      
      if (storedEmail) {
        setEmail(storedEmail);
        
        // Load consents from database
        const { data: consents } = await supabase
          .from("consents")
          .select("consent_type, consented, consented_at")
          .eq("email", storedEmail);

        setUserData({
          profile: storedAnswers ? JSON.parse(storedAnswers) : null,
          consents: consents || [],
        });
      } else if (storedAnswers) {
        setUserData({
          profile: JSON.parse(storedAnswers),
          consents: [],
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Erreur lors du chargement de vos données");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    const exportData = {
      email,
      ...userData,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mes-donnees-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Données exportées avec succès");
  };

  const handleRevokeConsent = async (consentType: "lead_sharing" | "marketing" | "analytics") => {
    if (!email) return;

    try {
      const { error } = await supabase
        .from("consents")
        .update({ consented: false, updated_at: new Date().toISOString() })
        .eq("email", email)
        .eq("consent_type", consentType);

      if (error) throw error;

      toast.success("Consentement révoqué");
      loadUserData();
    } catch (error) {
      console.error("Error revoking consent:", error);
      toast.error("Erreur lors de la révocation");
    }
  };

  const handleDeleteAllData = async () => {
    try {
      if (email) {
        // Delete consents from database
        await supabase.from("consents").delete().eq("email", email);
      }

      // Clear localStorage
      localStorage.removeItem("onboarding_answers");
      localStorage.removeItem("user_email");

      toast.success("Toutes vos données ont été supprimées");
      navigate("/");
    } catch (error) {
      console.error("Error deleting data:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getConsentLabel = (type: string) => {
    const labels: Record<string, string> = {
      lead_sharing: "Partage de profil avec les partenaires",
      marketing: "Réception d'emails marketing",
      analytics: "Analyse d'utilisation",
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Mes données personnelles
              </h1>
              <p className="text-muted-foreground">
                Gérez vos informations et vos consentements
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Profile Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Mon profil
              </CardTitle>
              <CardDescription>
                Informations collectées lors de votre inscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userData.profile ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {email && (
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground">{email}</p>
                      </div>
                    </div>
                  )}
                  {(userData.profile as Record<string, string>).contact_firstname && (
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Prénom</p>
                        <p className="font-medium text-foreground">
                          {(userData.profile as Record<string, string>).contact_firstname}
                        </p>
                      </div>
                    </div>
                  )}
                  {(userData.profile as Record<string, string>).location && (
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Ville</p>
                        <p className="font-medium text-foreground">
                          {(userData.profile as Record<string, string>).location}
                        </p>
                      </div>
                    </div>
                  )}
                  {(userData.profile as Record<string, string>).previous_sector && (
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Secteur précédent</p>
                        <p className="font-medium text-foreground">
                          {(userData.profile as Record<string, string>).previous_sector}
                        </p>
                      </div>
                    </div>
                  )}
                  {(userData.profile as Record<string, string>).target_sector && (
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <Target className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Secteur recherché</p>
                        <p className="font-medium text-foreground">
                          {(userData.profile as Record<string, string>).target_sector}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune donnée de profil trouvée.</p>
              )}
            </CardContent>
          </Card>

          {/* Consents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Mes consentements
              </CardTitle>
              <CardDescription>
                Gérez vos autorisations de partage de données
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userData.consents.length > 0 ? (
                <div className="space-y-3">
                  {userData.consents.map((consent) => (
                    <div
                      key={consent.consent_type}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center gap-3">
                        {consent.consented ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">
                            {getConsentLabel(consent.consent_type)}
                          </p>
                          {consent.consented_at && (
                            <p className="text-xs text-muted-foreground">
                              Accordé le {new Date(consent.consented_at).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                      {consent.consented && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeConsent(consent.consent_type as "lead_sharing" | "marketing" | "analytics")}
                        >
                          Révoquer
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun consentement enregistré.</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Exercez vos droits sur vos données personnelles
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger mes données
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer toutes mes données
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAllData}>
                      Supprimer définitivement
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Privacy link */}
          <div className="text-center">
            <Link to="/confidentialite" className="text-sm text-primary hover:underline">
              Consulter notre politique de confidentialité
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

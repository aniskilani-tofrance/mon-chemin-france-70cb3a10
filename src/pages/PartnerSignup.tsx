import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, Building2, Phone, Globe, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

export default function PartnerSignup() {
  const [step, setStep] = useState<"account" | "org">("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [providerType, setProviderType] = useState<string>("training_org");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Erreur", description: "Les mots de passe ne correspondent pas" });
      return;
    }
    if (password.length < 6) {
      toast({ variant: "destructive", title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/partner-signup?step=org` },
      });
      if (error) throw error;

      toast({
        title: "Compte créé !",
        description: "Vérifiez votre email pour confirmer votre compte, puis revenez ici pour compléter votre inscription partenaire.",
      });
      setAccountCreated(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      toast({ variant: "destructive", title: "Erreur", description: "Le nom de l'organisme est requis" });
      return;
    }

    setLoading(true);
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ variant: "destructive", title: "Connexion requise", description: "Veuillez d'abord vous connecter avec votre compte." });
        navigate("/login");
        return;
      }

      const { data, error } = await supabase.functions.invoke("register-partner", {
        body: {
          name: orgName,
          phone,
          website,
          description,
          provider_type: providerType,
          address,
          city,
          postal_code: postalCode,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Bienvenue partenaire !", description: "Votre espace partenaire est prêt." });
      navigate("/partner-dashboard");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Check if user is already logged in → skip to org step
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) setStep("org");
  };

  // On mount, check URL params and session
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("step") === "org") {
      setStep("org");
    }
    checkSession();
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Devenir partenaire — ToFrance"
        description="Rejoignez le réseau ToFrance en tant qu'organisme de formation ou employeur. Recevez des leads qualifiés."
        path="/partner-signup"
      />
      <Header />

      <main className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-24">
        {step === "account" && !accountCreated ? (
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                <Building2 className="mx-auto mb-2 h-8 w-8 text-primary" />
                Devenir partenaire
              </CardTitle>
              <CardDescription className="text-center">
                Étape 1/2 — Créez votre compte
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateAccount}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="contact@organisme.fr" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" required />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer mon compte
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Déjà un compte ?{" "}
                  <Link to="/login" className="text-primary hover:underline">Se connecter</Link>
                  {" "}puis{" "}
                  <button type="button" onClick={() => setStep("org")} className="text-primary hover:underline">compléter l'inscription</button>
                </p>
              </CardFooter>
            </form>
          </Card>
        ) : step === "account" && accountCreated ? (
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-2xl">📧 Vérifiez votre email</CardTitle>
              <CardDescription>
                Un lien de confirmation a été envoyé à <strong>{email}</strong>. 
                Cliquez dessus puis revenez ici.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => { setStep("org"); checkSession(); }} variant="outline">
                J'ai confirmé mon email → Continuer
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                <Building2 className="mx-auto mb-2 h-8 w-8 text-primary" />
                Votre organisme
              </CardTitle>
              <CardDescription className="text-center">
                Étape 2/2 — Décrivez votre structure
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegisterOrg}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="providerType">Type de structure</Label>
                  <Select value={providerType} onValueChange={setProviderType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="training_org">Organisme de formation</SelectItem>
                      <SelectItem value="employer">Employeur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgName">Nom de l'organisme *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="orgName" placeholder="Mon organisme" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" placeholder="01 23 45 67 89" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Site web</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="website" placeholder="https://..." value={website} onChange={(e) => setWebsite(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="address" placeholder="123 rue..." value={address} onChange={(e) => setAddress(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input id="city" placeholder="Paris" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input id="postalCode" placeholder="75001" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description de votre activité</Label>
                  <Textarea id="description" placeholder="Décrivez vos services, formations proposées..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Finaliser mon inscription partenaire
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}

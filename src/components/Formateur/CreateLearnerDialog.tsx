import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { UserPlus, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onCreated?: () => void;
}

export function CreateLearnerDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ email: string; password: string | null; alreadyExisted: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setEmail(""); setFullName(""); setResult(null); setCopied(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("formateur-create-learner", {
        body: { email: email.trim(), full_name: fullName.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult({
        email: data.email,
        password: data.temp_password,
        alreadyExisted: data.already_existed,
      });
      onCreated?.();
      toast.success(
        data.already_existed
          ? "Apprenant existant rattaché à votre liste"
          : "Compte apprenant créé"
      );
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!result?.password) return;
    const text = `Email : ${result.email}\nMot de passe temporaire : ${result.password}\nLien : ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Identifiants copiés");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Créer un apprenant
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau compte apprenant</DialogTitle>
          <DialogDescription>
            L'apprenant sera automatiquement rattaché à votre liste.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="learner-name">Nom complet</Label>
              <Input
                id="learner-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Marie Dupont"
                required
              />
            </div>
            <div>
              <Label htmlFor="learner-email">Email</Label>
              <Input
                id="learner-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="apprenant@example.com"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer le compte
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            {result.alreadyExisted ? (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm">
                  Cet email existe déjà. L'apprenant a été rattaché à votre liste.
                  Demandez-lui de se connecter avec son mot de passe habituel.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-2">
                  <p className="text-sm font-medium">Identifiants à transmettre :</p>
                  <div className="font-mono text-sm space-y-1">
                    <div><span className="text-muted-foreground">Email :</span> {result.email}</div>
                    <div><span className="text-muted-foreground">Mot de passe :</span> {result.password}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Notez ce mot de passe maintenant — il ne sera plus affiché. L'apprenant pourra le changer après connexion.
                </p>
                <Button onClick={copyCredentials} variant="outline" className="w-full">
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  Copier les identifiants
                </Button>
              </>
            )}
            <DialogFooter>
              <Button onClick={() => { setOpen(false); reset(); }}>Fermer</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

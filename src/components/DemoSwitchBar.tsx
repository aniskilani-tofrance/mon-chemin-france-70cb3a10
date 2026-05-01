import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Sparkles, Users, GraduationCap, Briefcase, ClipboardList, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface DemoAccount {
  key: string;
  email: string;
  full_name: string;
  role: string;
  redirect: string;
  password: string;
  exists: boolean;
}

const ROLE_ICONS: Record<string, any> = {
  apprenant: Users,
  formateur: GraduationCap,
  directeur: Briefcase,
  cip: ClipboardList,
};

const ROLE_LABELS: Record<string, string> = {
  apprenant: "Apprenant",
  formateur: "Formateur",
  directeur: "Directeur de centre",
  cip: "Chargé d'insertion (CIP)",
};

export function DemoSwitchBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [hidden, setHidden] = useState(() => localStorage.getItem("demo_bar_hidden") === "1");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    (async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
    })();
  }, [user]);

  useEffect(() => {
    if (!isAdmin || hidden) return;
    refresh();
  }, [isAdmin, hidden]);

  const refresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-demo-accounts", { body: { action: "list" } });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      setAccounts(data.accounts || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const provision = async () => {
    setProvisioning(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-demo-accounts", { body: { action: "provision" } });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast.success("Comptes de démo prêts !");
      await refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setProvisioning(false);
    }
  };

  const switchTo = async (acc: DemoAccount) => {
    setSwitching(acc.key);
    try {
      // Direct password sign-in (faster than magic link for demo)
      await supabase.auth.signOut();
      const { error } = await supabase.auth.signInWithPassword({
        email: acc.email,
        password: acc.password,
      });
      if (error) throw error;
      toast.success(`Connecté en tant que ${ROLE_LABELS[acc.key]}`);
      // Force a small delay for auth state to propagate
      setTimeout(() => {
        window.location.href = acc.redirect;
      }, 300);
    } catch (err: any) {
      toast.error(err.message || "Échec de la connexion");
      setSwitching(null);
    }
  };

  const copyCreds = (acc: DemoAccount) => {
    navigator.clipboard.writeText(`${acc.email} / ${acc.password}`);
    setCopied(acc.key);
    toast.success("Identifiants copiés");
    setTimeout(() => setCopied(null), 1500);
  };

  if (!isAdmin || hidden) {
    if (isAdmin && hidden) {
      return (
        <button
          onClick={() => { localStorage.removeItem("demo_bar_hidden"); setHidden(false); }}
          className="fixed bottom-4 right-4 z-50 rounded-full bg-primary text-primary-foreground shadow-lg p-3 hover:scale-105 transition-transform"
          title="Afficher le bandeau démo"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      );
    }
    return null;
  }

  const allReady = accounts.length > 0 && accounts.every((a) => a.exists);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-primary/95 to-primary text-primary-foreground shadow-md">
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Sparkles className="h-4 w-4" />
          Mode démo
        </div>

        {!allReady && !loading && (
          <Button size="sm" variant="secondary" onClick={provision} disabled={provisioning}>
            {provisioning && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Initialiser les 4 comptes démo
          </Button>
        )}

        {allReady && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary">
                {switching ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                Basculer vers un compte démo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 z-[70]">
              <DropdownMenuLabel>Connexion instantanée</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {accounts.map((acc) => {
                const Icon = ROLE_ICONS[acc.key] || Users;
                return (
                  <DropdownMenuItem
                    key={acc.key}
                    onSelect={(e) => { e.preventDefault(); switchTo(acc); }}
                    className="flex items-start gap-2 py-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{ROLE_LABELS[acc.key]}</div>
                      <div className="text-xs text-muted-foreground truncate">{acc.email}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); copyCreds(acc); }}
                      className="text-muted-foreground hover:text-foreground"
                      title="Copier les identifiants"
                    >
                      {copied === acc.key ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                Mot de passe commun : <span className="font-mono">DemoToFrance2026!</span>
              </div>
              <DropdownMenuItem onSelect={() => provision()}>
                <Loader2 className={`mr-2 h-3 w-3 ${provisioning ? "animate-spin" : "hidden"}`} />
                🔄 Recharger jeu de données démo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {loading && <Loader2 className="h-4 w-4 animate-spin" />}

        <div className="flex-1" />

        <button
          onClick={() => { localStorage.setItem("demo_bar_hidden", "1"); setHidden(true); }}
          className="text-xs underline opacity-80 hover:opacity-100"
        >
          Masquer
        </button>
      </div>
    </div>
  );
}

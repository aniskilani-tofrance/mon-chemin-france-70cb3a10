import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2, Sparkles, Users, GraduationCap, Briefcase, ClipboardList, HeartHandshake,
  Copy, Check, ChevronUp, ChevronDown, ArrowRight, X,
} from "lucide-react";
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
  benevole: HeartHandshake,
};

const ROLE_LABELS: Record<string, string> = {
  apprenant: "Apprenant",
  formateur: "Formateur",
  directeur: "Directeur",
  cip: "CIP",
  benevole: "Bénévole",
};

const ROLE_SHORTCUTS: Record<string, { label: string; path: string }[]> = {
  apprenant: [
    { label: "Tableau de bord", path: "/dashboard" },
    { label: "Module FLE", path: "/fle" },
    { label: "Mes données", path: "/mes-donnees" },
  ],
  formateur: [
    { label: "Apprenants", path: "/formateur/apprenants" },
    { label: "Diagnostic papier", path: "/formateur/diagnostic" },
    { label: "Évaluations", path: "/formateur/evaluations" },
    { label: "AFEST", path: "/formateur/afest" },
  ],
  directeur: [
    { label: "Vue directeur", path: "/directeur" },
  ],
  cip: [
    { label: "Tableau CIP", path: "/cip" },
  ],
  benevole: [
    { label: "Espace partenaire", path: "/partner-dashboard" },
    { label: "Profil partenaire", path: "/partner-profile" },
    { label: "Invitations", path: "/partner-invitations" },
  ],
};

export function DemoSwitchBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [hidden, setHidden] = useState(() => localStorage.getItem("demo_bar_hidden") === "1");
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("demo_bar_collapsed") === "1");
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
      const list: DemoAccount[] = data.accounts || [];
      setAccounts(list);

      // Auto-provision on first admin connection if any account is missing
      const allExist = list.length > 0 && list.every((a) => a.exists);
      const autoKey = `demo_auto_provisioned_${user?.id || "anon"}`;
      if (!allExist && !provisioning && !localStorage.getItem(autoKey)) {
        localStorage.setItem(autoKey, "1");
        await provision(true);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const provision = async (silent = false) => {
    setProvisioning(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-demo-accounts", { body: { action: "provision" } });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      if (silent) toast.success("Comptes démo initialisés automatiquement");
      else toast.success("Comptes de démo prêts !");
      const { data: listData } = await supabase.functions.invoke("admin-demo-accounts", { body: { action: "list" } });
      if (listData?.accounts) setAccounts(listData.accounts);
    } catch (err: any) {
      if (!silent) toast.error(err.message || "Erreur");
      else console.error("Auto-provision failed:", err);
    } finally {
      setProvisioning(false);
    }
  };

  const switchTo = async (acc: DemoAccount) => {
    setSwitching(acc.key);
    try {
      await supabase.auth.signOut();
      const { error } = await supabase.auth.signInWithPassword({
        email: acc.email,
        password: acc.password,
      });
      if (error) throw error;
      toast.success(`Connecté : ${ROLE_LABELS[acc.key]}`);
      setTimeout(() => { window.location.href = acc.redirect; }, 250);
    } catch (err: any) {
      toast.error(err.message || "Échec");
      setSwitching(null);
    }
  };

  const copyCreds = (acc: DemoAccount) => {
    navigator.clipboard.writeText(`${acc.email} / ${acc.password}`);
    setCopied(acc.key);
    toast.success("Identifiants copiés");
    setTimeout(() => setCopied(null), 1500);
  };

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("demo_bar_collapsed", next ? "1" : "0");
  };

  const currentAccount = useMemo(() => {
    if (!user?.email) return null;
    return accounts.find((a) => a.email.toLowerCase() === user.email!.toLowerCase()) || null;
  }, [accounts, user]);

  const currentKey = currentAccount?.key;
  const shortcuts = currentKey ? ROLE_SHORTCUTS[currentKey] || [] : [];
  const CurrentIcon = currentKey ? ROLE_ICONS[currentKey] || Sparkles : Sparkles;

  if (!isAdmin) return null;

  if (hidden) {
    return (
      <button
        onClick={() => { localStorage.removeItem("demo_bar_hidden"); setHidden(false); }}
        className="fixed bottom-4 right-4 z-[60] rounded-full bg-primary text-primary-foreground shadow-lg p-3 hover:scale-105 transition-transform"
        title="Afficher le panneau démo"
      >
        <Sparkles className="h-5 w-5" />
      </button>
    );
  }

  const allReady = accounts.length > 0 && accounts.every((a) => a.exists);

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[min(360px,calc(100vw-2rem))]">
      <div className="rounded-xl border border-border bg-card/95 backdrop-blur shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground">
          <Sparkles className="h-4 w-4 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold leading-tight">Mode démo</div>
            {currentAccount ? (
              <div className="text-[11px] opacity-90 flex items-center gap-1 truncate">
                <CurrentIcon className="h-3 w-3 shrink-0" />
                <span className="truncate">{ROLE_LABELS[currentKey!]} — {currentAccount.full_name}</span>
              </div>
            ) : (
              <div className="text-[11px] opacity-90">Admin connecté</div>
            )}
          </div>
          <button onClick={toggleCollapsed} className="p-1 hover:bg-white/10 rounded" title={collapsed ? "Ouvrir" : "Réduire"}>
            {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => { localStorage.setItem("demo_bar_hidden", "1"); setHidden(true); }}
            className="p-1 hover:bg-white/10 rounded"
            title="Masquer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {!collapsed && (
          <div className="p-3 space-y-3">
            {/* Persona switcher */}
            {!allReady && !loading && (
              <Button size="sm" className="w-full" onClick={() => provision()} disabled={provisioning}>
                {provisioning && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Initialiser les comptes démo
              </Button>
            )}

            {allReady && (
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Basculer en tant que
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {accounts.map((acc) => {
                    const Icon = ROLE_ICONS[acc.key] || Users;
                    const isCurrent = currentKey === acc.key;
                    return (
                      <button
                        key={acc.key}
                        onClick={() => switchTo(acc)}
                        disabled={switching === acc.key || isCurrent}
                        className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs text-left transition-colors ${
                          isCurrent
                            ? "bg-primary/10 border-primary/40 text-primary font-medium cursor-default"
                            : "border-border hover:bg-accent hover:border-accent-foreground/20"
                        } disabled:opacity-60`}
                        title={acc.email}
                      >
                        {switching === acc.key ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                        ) : (
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="truncate">{ROLE_LABELS[acc.key]}</span>
                        {isCurrent && <Check className="h-3 w-3 ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shortcuts for current role */}
            {shortcuts.length > 0 && (
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Pages clés — {ROLE_LABELS[currentKey!]}
                </div>
                <div className="space-y-1">
                  {shortcuts.map((s) => {
                    const isHere = location.pathname === s.path || location.pathname.startsWith(s.path + "/");
                    return (
                      <button
                        key={s.path}
                        onClick={() => navigate(s.path)}
                        disabled={isHere}
                        className={`w-full flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-left transition-colors ${
                          isHere
                            ? "bg-muted text-muted-foreground cursor-default"
                            : "hover:bg-accent"
                        }`}
                      >
                        <span className="truncate">{s.label}</span>
                        {isHere ? <Check className="h-3 w-3 shrink-0" /> : <ArrowRight className="h-3 w-3 shrink-0 opacity-60" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer actions */}
            {allReady && currentAccount && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                <button
                  onClick={() => copyCreds(currentAccount)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  {copied === currentAccount.key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  Copier identifiants
                </button>
                <button
                  onClick={() => provision()}
                  disabled={provisioning}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-60"
                >
                  {provisioning && <Loader2 className="h-3 w-3 animate-spin" />}
                  Recharger jeu démo
                </button>
              </div>
            )}

            {loading && !accounts.length && (
              <div className="flex items-center justify-center py-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

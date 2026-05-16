import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  ClipboardList,
  Headphones,
  FileText,
  LogOut,
  Sparkles,
  Printer,
  LayoutDashboard,
  GraduationCap,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useFormateurStats } from "@/hooks/useFormateurStats";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  badgeKey?: "learnersCount" | "pendingEvaluations" | "diagnosticsInProgress";
  end?: boolean;
}

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Vue",
    items: [{ title: "Tableau de bord", url: "/formateur", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Apprenants",
    items: [
      {
        title: "Mes apprenants",
        url: "/formateur/apprenants",
        icon: Users,
        badgeKey: "learnersCount",
      },
    ],
  },
  {
    label: "Outils",
    items: [
      { title: "Diagnostic partagé", url: "/diagnostic-partage", icon: Sparkles },
      { title: "Diagnostic papier", url: "/formateur/diagnostic-papier", icon: Printer },
      { title: "Contenus FLE", url: "/formateur/contenus", icon: BookOpen },
    ],
  },
  {
    label: "Suivi",
    items: [
      { title: "Assignations", url: "/formateur/assignations", icon: ClipboardList },
      {
        title: "Évaluations",
        url: "/formateur/evaluations",
        icon: Headphones,
        badgeKey: "pendingEvaluations",
      },
      { title: "Suivi AFEST", url: "/formateur/afest", icon: FileText },
    ],
  },
];

export function FormateurSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const stats = useFormateurStats();
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", user.id)
        .maybeSingle();
      setDisplayName(data?.full_name || data?.email || user.email || "Formateur");
    };
    load();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const initials = (displayName || "F").charAt(0).toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm">ToFrance</span>
              <span className="text-[11px] text-muted-foreground">Espace formateur</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const badgeValue = item.badgeKey ? stats[item.badgeKey] : 0;
                  const showBadge = item.badgeKey && badgeValue > 0 && !stats.loading;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                        <NavLink
                          to={item.url}
                          end={item.end}
                          className="hover:bg-muted/60 transition-colors"
                          activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && (
                            <>
                              <span className="flex-1 truncate">{item.title}</span>
                              {showBadge && (
                                <Badge
                                  variant={item.badgeKey === "pendingEvaluations" ? "destructive" : "secondary"}
                                  className="h-5 px-1.5 text-[10px] font-semibold"
                                >
                                  {badgeValue}
                                </Badge>
                              )}
                            </>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className={`flex items-center gap-2 px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground/80">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{displayName}</div>
              <div className="text-[10px] text-muted-foreground">Formateur</div>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">Déconnexion</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

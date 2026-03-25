import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart3, Users, Globe, TrendingUp, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface AnalyticsEvent {
  id: string;
  session_id: string;
  event_type: string;
  event_data: Record<string, any>;
  page: string | null;
  language: string | null;
  created_at: string;
}

const STEP_ORDER = ["language", "intro", "consent", "questions", "complete"];
const STEP_LABELS: Record<string, string> = {
  language: "Langue",
  intro: "Introduction",
  consent: "Consentement",
  questions: "Questions",
  complete: "Terminé",
};

const STEP_COLORS = ["hsl(var(--primary))", "hsl(210,70%,50%)", "hsl(45,90%,50%)", "hsl(280,60%,50%)", "hsl(142,70%,40%)"];

export function AdminAnalytics() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("analytics_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      setEvents((data as AnalyticsEvent[]) || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const stats = useMemo(() => {
    const sessions = new Set(events.map((e) => e.session_id));
    const stepEvents = events.filter((e) => e.event_type === "onboarding_step");
    const completions = events.filter((e) => e.event_type === "onboarding_completed");

    // Funnel: count unique sessions per step
    const funnelMap: Record<string, Set<string>> = {};
    stepEvents.forEach((e) => {
      const step = (e.event_data as any)?.step;
      if (step) {
        if (!funnelMap[step]) funnelMap[step] = new Set();
        funnelMap[step].add(e.session_id);
      }
    });

    const funnel = STEP_ORDER.map((step, i) => ({
      step,
      label: STEP_LABELS[step] || step,
      count: funnelMap[step]?.size || 0,
      color: STEP_COLORS[i],
    }));

    // Languages
    const langEvents = events.filter((e) => e.event_type === "onboarding_language_selected");
    const langMap: Record<string, number> = {};
    langEvents.forEach((e) => {
      const lang = (e.event_data as any)?.lang || "unknown";
      langMap[lang] = (langMap[lang] || 0) + 1;
    });
    const languages = Object.entries(langMap)
      .map(([lang, count]) => ({ lang, count }))
      .sort((a, b) => b.count - a.count);

    // Consent stats
    const consentEvents = events.filter((e) => e.event_type === "onboarding_consent");
    const consentAccepted = consentEvents.filter((e) => (e.event_data as any)?.accepted).length;

    // Completion rate
    const started = funnelMap["language"]?.size || 0;
    const completed = completions.length;
    const completionRate = started > 0 ? Math.round((completed / started) * 100) : 0;

    // Routes
    const routeMap: Record<string, number> = {};
    completions.forEach((e) => {
      const route = (e.event_data as any)?.route || "unknown";
      routeMap[route] = (routeMap[route] || 0) + 1;
    });

    return {
      totalSessions: sessions.size,
      completions: completed,
      completionRate,
      funnel,
      languages,
      consentRate: consentEvents.length > 0 ? Math.round((consentAccepted / consentEvents.length) * 100) : 0,
      routes: routeMap,
    };
  }, [events]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-7 w-7 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Analytics Onboarding</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Users className="h-4 w-4" />
              Sessions
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalSessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4" />
              Complétés
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.completions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">Taux complétion</div>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.completionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">Taux consentement</div>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.consentRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Funnel d'onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.funnel.every((f) => f.count === 0) ? (
            <p className="text-center text-muted-foreground py-8">Pas encore de données</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.funnel}>
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Sessions" radius={[6, 6, 0, 0]}>
                  {stats.funnel.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Langues choisies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.languages.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune donnée</p>
            ) : (
              <div className="space-y-2">
                {stats.languages.map(({ lang, count }) => (
                  <div key={lang} className="flex items-center justify-between">
                    <Badge variant="outline" className="uppercase">{lang}</Badge>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Parcours orientés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.routes).length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune donnée</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.routes).map(([route, count]) => (
                  <div key={route} className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {route === "route_a" ? "FLE" : route === "route_b" ? "Formation" : route === "route_c" ? "Emploi" : route}
                    </Badge>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

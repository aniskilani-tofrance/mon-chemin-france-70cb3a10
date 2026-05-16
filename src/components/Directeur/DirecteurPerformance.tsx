import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Loader2, BarChart3 } from "lucide-react";

interface SectorData {
  sector: string;
  count: number;
}

const SECTOR_COLORS = [
  "hsl(var(--primary))",
  "hsl(210,70%,50%)",
  "hsl(45,90%,50%)",
  "hsl(280,60%,50%)",
  "hsl(142,70%,40%)",
  "hsl(0,70%,50%)",
  "hsl(30,80%,50%)",
];

export function DirecteurPerformance() {
  const [data, setData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [progressRes, modulesRes] = await Promise.all([
        supabase.from("fle_module_progress").select("module_id, completed_at"),
        supabase.from("fle_modules").select("id, sector, category"),
      ]);
      const moduleMap = new Map(
        (modulesRes.data || []).map((m) => [m.id, m]),
      );
      const map: Record<string, number> = {};
      (progressRes.data || [])
        .filter((p) => p.completed_at)
        .forEach((p) => {
          const mod = moduleMap.get(p.module_id);
          const sector = mod?.sector || mod?.category || "Autre";
          map[sector] = (map[sector] || 0) + 1;
        });
      setData(
        Object.entries(map)
          .map(([sector, count]) => ({ sector, count }))
          .sort((a, b) => b.count - a.count),
      );
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Modules complétés par secteur
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Pas encore de données
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <XAxis dataKey="sector" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Complétés" radius={[6, 6, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

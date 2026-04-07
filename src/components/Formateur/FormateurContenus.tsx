import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Loader2, Search } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Module = Tables<"fle_modules">;

export function FormateurContenus() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("fle_modules")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      setModules(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = modules.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === "all" || m.cecrl_level === levelFilter;
    const matchCategory = categoryFilter === "all" || m.category === categoryFilter;
    return matchSearch && matchLevel && matchCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Niveau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous niveaux</SelectItem>
            <SelectItem value="alpha">Alpha</SelectItem>
            <SelectItem value="post_alpha">Post-Alpha</SelectItem>
            <SelectItem value="a1">A1</SelectItem>
            <SelectItem value="a2">A2</SelectItem>
            <SelectItem value="b1">B1</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="quotidien">Quotidien</SelectItem>
            <SelectItem value="professionnel">Professionnel</SelectItem>
            <SelectItem value="certification">Certification</SelectItem>
            <SelectItem value="culture">Culture</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <Card key={m.id} variant="elevated" className="cursor-default">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span>{m.icon || "📖"}</span>
                {m.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground line-clamp-2">{m.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{m.cecrl_level.toUpperCase()}</Badge>
                <Badge variant="secondary">{m.category}</Badge>
                {m.sector && <Badge variant="secondary">{m.sector}</Badge>}
                {m.duration_minutes && (
                  <Badge variant="outline">{m.duration_minutes} min</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Aucun module trouvé.</p>
      )}
    </div>
  );
}

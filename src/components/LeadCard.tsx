import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
} from "lucide-react";
import type { Lead } from "@/hooks/useProviderData";
import { Constants } from "@/integrations/supabase/types";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "En attente", variant: "secondary" },
  a_qualifier: { label: "À qualifier", variant: "secondary" },
  qualifie_fle: { label: "Qualifié FLE", variant: "default" },
  qualifie_of: { label: "Qualifié OF", variant: "default" },
  qualifie_employeur: { label: "Qualifié Employeur", variant: "default" },
  contacted: { label: "Contacté", variant: "outline" },
  transmis_partenaire: { label: "Transmis", variant: "outline" },
  rdv_fixe: { label: "RDV fixé", variant: "outline" },
  sas_insertion: { label: "SAS insertion", variant: "outline" },
  entre_formation: { label: "En formation", variant: "default" },
  converted: { label: "Converti", variant: "default" },
  recrute: { label: "Recruté", variant: "default" },
  rejected: { label: "Rejeté", variant: "destructive" },
  perdu_injoignable: { label: "Perdu", variant: "destructive" },
};

interface LeadCardProps {
  lead: any;
  onStatusChange: (id: string, status: Lead["status"], notes?: string) => void;
  onPurchase: (id: string) => void;
  purchasing?: boolean;
}

export function LeadCard({ lead, onStatusChange, onPurchase, purchasing }: LeadCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(lead.notes || "");
  const profile = lead.profiles;
  const statusInfo = STATUS_LABELS[lead.status] || { label: lead.status, variant: "secondary" as const };
  const isUnlocked = !!lead.purchased_at;

  // Derive lead type from training certification or profile lead_route
  const certType = lead.trainings?.certification_type;
  const leadRoute = profile?.lead_route;

  // Compute display price: use price_charged if set, otherwise calculate from cert type + score
  const computedPrice = (() => {
    if (lead.price_charged != null) return Number(lead.price_charged);
    const cert = certType || (leadRoute === "fle" ? "language" : leadRoute === "of" ? "tp" : "language");
    const score = lead.match_score ?? 50;
    if (cert === "language") return score >= 80 ? 45 : score >= 50 ? 30 : 20;
    if (cert === "cqp") return score >= 80 ? 280 : score >= 50 ? 200 : 140;
    if (cert === "tp") return score >= 80 ? 400 : score >= 50 ? 300 : 200;
    return score >= 80 ? 45 : score >= 50 ? 30 : 20;
  })();
  const leadTypeLabel = certType === "tp" ? "TP"
    : certType === "cqp" ? "CQP"
    : certType === "language" ? "FLE"
    : leadRoute === "employeur" ? "Emploi direct"
    : leadRoute === "fle" ? "FLE"
    : leadRoute === "of" ? "TP"
    : "FLE";
  const leadTypeColor = leadTypeLabel === "FLE" ? "bg-primary/10 text-primary border-primary/20"
    : leadTypeLabel === "TP" || leadTypeLabel === "CQP" ? "bg-accent text-accent-foreground border-accent-foreground/20"
    : "bg-success/15 text-success border-success/20";

  return (
    <Card variant="elevated" className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground truncate">
                {isUnlocked
                  ? (profile?.full_name || profile?.first_name || "Candidat anonyme")
                  : `Candidat · ${profile?.target_sector || "Non précisé"}`}
              </h4>
              <Badge className={`border-0 ${leadTypeColor}`}>{leadTypeLabel}</Badge>
              {isUnlocked ? (
                <Badge variant="outline" className="border-success text-success">
                  <Unlock className="mr-1 h-3 w-3" /> Débloqué
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Lock className="mr-1 h-3 w-3" /> Verrouillé
                </Badge>
              )}
              {lead.match_score != null && (
                <Badge variant="outline" className={
                  lead.match_score >= 80 ? "border-success text-success" :
                  lead.match_score >= 50 ? "border-primary text-primary" :
                  "border-muted-foreground text-muted-foreground"
                }>
                  {lead.match_score}% · {lead.match_score >= 80 ? "Premium" : lead.match_score >= 50 ? "Standard" : "Éco"}
                </Badge>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {profile?.city && <span>📍 {profile.city}</span>}
              {/* FLE: always show CECRL level */}
              {leadTypeLabel === "FLE" && profile?.french_level_cecrl && (
                <span>🇫🇷 Niveau {profile.french_level_cecrl}</span>
              )}
              {/* TP/CQP: show training title + sectors */}
              {(leadTypeLabel === "TP" || leadTypeLabel === "CQP") && lead.trainings?.title && (
                <span>📚 {lead.trainings.title}</span>
              )}
              {(leadTypeLabel === "TP" || leadTypeLabel === "CQP") && lead.trainings?.target_sectors?.length > 0 && (
                <span>🏢 {lead.trainings.target_sectors.join(", ")}</span>
              )}
              {/* Emploi direct: show target sector */}
              {leadTypeLabel === "Emploi direct" && profile?.target_sector && (
                <span>🎯 {profile.target_sector}</span>
              )}
              <span>
                <Clock className="inline h-3 w-3 mr-1" />
                {new Date(lead.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>

            {/* Teaser: masked contact + unlock button */}
            {!isUnlocked && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" /> ●●●●●●●●
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" /> ●●●●●●●●
                </span>
                 <Button
                  size="sm"
                  variant="hero"
                  disabled={purchasing}
                  onClick={() => onPurchase(lead.id)}
                >
                  <Lock className="h-3 w-3 mr-1" />
                  {purchasing ? "Redirection…" : (
                    <>
                      Débloquer — {`${computedPrice} €`}
                      {lead.match_score != null && (
                        <span className="ml-1 text-xs opacity-80">
                          ({lead.match_score >= 80 ? "Premium" : lead.match_score >= 50 ? "Standard" : "Éco"})
                        </span>
                      )}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {isUnlocked && (
            <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Unlocked: always show contact info */}
        {isUnlocked && (
          <div className="mt-3 flex flex-wrap gap-4 text-sm border-t pt-3">
            <span className="font-medium text-foreground">
              {profile?.full_name || `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "—"}
            </span>
            {profile?.phone && (
              <a href={`tel:${profile.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                <Phone className="h-4 w-4" /> {profile.phone}
              </a>
            )}
            {profile?.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-1 text-primary hover:underline">
                <Mail className="h-4 w-4" /> {profile.email}
              </a>
            )}
          </div>
        )}

        {isUnlocked && expanded && (
          <div className="mt-4 space-y-4 border-t pt-4">

            {/* Profile details */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {profile?.previous_job && <div><span className="text-muted-foreground">Métier précédent :</span> {profile.previous_job}</div>}
              {profile?.work_right && <div><span className="text-muted-foreground">Droit au travail :</span> {profile.work_right}</div>}
              {profile?.mobility_km && <div><span className="text-muted-foreground">Mobilité :</span> {profile.mobility_km} km</div>}
              {profile?.funding_status && <div><span className="text-muted-foreground">Financement :</span> {profile.funding_status}</div>}
            </div>

            {/* Status change */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Changer le statut</label>
                <Select
                  value={lead.status}
                  onValueChange={(value) => onStatusChange(lead.id, value as Lead["status"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Constants.public.Enums.lead_status.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]?.label || s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajouter une note..."
                rows={2}
              />
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => onStatusChange(lead.id, lead.status, notes)}
              >
                Sauvegarder
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

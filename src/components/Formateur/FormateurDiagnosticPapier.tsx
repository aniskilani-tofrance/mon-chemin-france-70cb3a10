import { useState } from "react";
import { ClipboardCheck, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DIAGNOSTIC_QUESTIONS, CATEGORY_META, type DiagnosticCategory } from "@/lib/diagnosticQuestions";

const groupedQuestions = DIAGNOSTIC_QUESTIONS.reduce<Record<DiagnosticCategory, typeof DIAGNOSTIC_QUESTIONS>>(
  (acc, question) => {
    acc[question.category].push(question);
    return acc;
  },
  { projet: [], situation: [], freins: [], competences: [] }
);

const categoryOrder: DiagnosticCategory[] = ["projet", "situation", "freins", "competences"];

function LineField({ label, wide = false }: { label: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground print:text-[9pt]">
        {label}
      </div>
      <div className="mt-3 border-b border-foreground/50 print:mt-4" />
    </div>
  );
}

export function FormateurDiagnosticPapier() {
  const [draftPrint, setDraftPrint] = useState(false);

  return (
    <div className={`diagnostic-paper-print mx-auto max-w-5xl space-y-4 print:max-w-none print:space-y-0 ${draftPrint ? "diagnostic-paper-draft" : ""}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Diagnostic partagé papier</h2>
          <p className="text-sm text-muted-foreground">
            Version vierge à imprimer pour les apprenants non numérisés, puis à ressaisir dans le diagnostic partagé.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant={draftPrint ? "default" : "outline"}
            onClick={() => setDraftPrint((value) => !value)}
          >
            Brouillon formateur {draftPrint ? "activé" : "désactivé"}
          </Button>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
        </div>
      </div>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader className="border-b print:px-0 print:pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant="outline" className="mb-3 gap-1 print:hidden">
                <FileText className="h-3 w-3" />
                Support terrain
              </Badge>
              <CardTitle className="text-2xl print:text-[20pt]">ToFrance — Diagnostic partagé</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground print:text-[10pt]">
                Entretien formateur / apprenant — remplir lisiblement, sans données sensibles inutiles.
              </p>
            </div>
            <ClipboardCheck className="h-10 w-10 text-primary print:hidden" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6 print:px-0 print:pt-4">
          <section className="grid gap-5 rounded-lg border p-4 sm:grid-cols-2 print:break-inside-avoid print:rounded-none print:p-3">
            <LineField label="Nom et prénom de l’apprenant" />
            <LineField label="Date de l’entretien" />
            <LineField label="Langue utilisée / interprète" />
            <LineField label="Formateur / structure" />
            <LineField label="Téléphone ou contact utile" />
            <LineField label="Commune / quartier" />
            <LineField label="Consentement au recueil des informations" wide />
          </section>

          {categoryOrder.map((category) => {
            const meta = CATEGORY_META[category];
            return (
              <section key={category} className="diagnostic-paper-section print:break-inside-avoid">
                <div className="mb-3 flex items-center gap-2 border-b pb-2">
                  <span className="text-xl print:text-[14pt]" aria-hidden="true">{meta.icon}</span>
                  <h3 className="text-lg font-bold print:text-[14pt]">{meta.label}</h3>
                </div>

                <div className="space-y-4">
                  {groupedQuestions[category].map((question, index) => (
                    <article key={question.key} className="diagnostic-paper-question rounded-lg border p-4 print:break-inside-avoid print:rounded-none print:p-3">
                      <div className="mb-3 flex gap-2">
                        <span className="font-bold text-primary">{index + 1}.</span>
                        <div>
                          <p className="font-semibold print:text-[11pt]">{question.question.fr}</p>
                          {question.helper_fr && (
                            <p className="mt-1 text-xs text-muted-foreground print:text-[9pt]">{question.helper_fr}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground print:text-[8pt]">
                            Réponse apprenant / langue d’origine
                          </div>
                          <div className="diagnostic-paper-answer mt-2 h-20 rounded-md border bg-background print:h-16 print:rounded-none" />
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground print:text-[8pt]">
                            Reformulation française / observation formateur
                          </div>
                          <div className="diagnostic-paper-answer mt-2 h-20 rounded-md border bg-background print:h-16 print:rounded-none" />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}

          <section className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 print:break-inside-avoid print:rounded-none print:p-3">
            <LineField label="Synthèse du projet" wide />
            <LineField label="Freins prioritaires" wide />
            <LineField label="Orientation proposée" />
            <LineField label="Prochaine action / rendez-vous" />
            <LineField label="Signature apprenant" />
            <LineField label="Signature formateur" />
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
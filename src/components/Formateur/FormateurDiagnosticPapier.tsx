import { useEffect, useRef, useState } from "react";
import { ClipboardCheck, Download, Eye, FileText, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DIAGNOSTIC_QUESTIONS, CATEGORY_META, type DiagnosticCategory } from "@/lib/diagnosticQuestions";
import { toast } from "sonner";

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

function DiagnosticPaperContent() {
  return (
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
  );
}

export function FormateurDiagnosticPapier() {
  const [draftPrint, setDraftPrint] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [autoCompact, setAutoCompact] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!previewOpen) return;
    const measureOverflow = () => {
      const node = previewRef.current;
      if (!node) return;
      const printableHeight = node.clientHeight || 1;
      const contentHeight = node.scrollHeight;
      setAutoCompact(contentHeight > printableHeight * 1.03);
    };
    const id = window.setTimeout(measureOverflow, 80);
    window.addEventListener("resize", measureOverflow);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", measureOverflow);
    };
  }, [previewOpen, draftPrint]);

  const printClasses = [
    "diagnostic-paper-print mx-auto max-w-5xl space-y-4 print:max-w-none print:space-y-0",
    draftPrint ? "diagnostic-paper-draft" : "",
    autoCompact ? "diagnostic-paper-compact" : "",
  ].filter(Boolean).join(" ");

  const exportPdf = async () => {
    const node = pdfRef.current;
    if (!node) return;
    setExportingPdf(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        windowWidth: node.scrollWidth,
        windowHeight: node.scrollHeight,
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/png");
      let remainingHeight = imgHeight;
      let y = 0;

      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      remainingHeight -= pageHeight;
      while (remainingHeight > 0) {
        y -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
      }

      pdf.save("diagnostic-partage-tofrance.pdf");
    } catch (error) {
      toast.error("Export PDF impossible pour le moment.");
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <>
      <div className={printClasses}>
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
            <Button type="button" variant="outline" className="gap-2" onClick={() => setPreviewOpen(true)}>
              <Eye className="h-4 w-4" />
              Aperçu
            </Button>
            <Button type="button" variant="outline" className="gap-2" onClick={exportPdf} disabled={exportingPdf}>
              {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              PDF
            </Button>
            <Button onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
          </div>
        </div>

        <DiagnosticPaperContent />
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[92vh] max-w-[min(94vw,920px)] overflow-auto p-4 print:hidden">
          <DialogHeader>
            <DialogTitle>Aperçu avant impression</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2 text-sm">
            <span>{autoCompact ? "Ajustement automatique activé : contenu compacté." : "Rendu standard : aucun débordement détecté."}</span>
            <Button type="button" size="sm" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={exportPdf} disabled={exportingPdf} className="gap-2">
              {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              PDF
            </Button>
          </div>
          <div className="diagnostic-paper-preview-shell">
            <div ref={previewRef} className={`diagnostic-paper-preview-page ${draftPrint ? "diagnostic-paper-draft" : ""} ${autoCompact ? "diagnostic-paper-compact" : ""}`}>
              <DiagnosticPaperContent />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="diagnostic-paper-pdf-source" aria-hidden="true">
        <div ref={pdfRef} className={`diagnostic-paper-print ${draftPrint ? "diagnostic-paper-draft" : ""} ${autoCompact ? "diagnostic-paper-compact" : ""}`}>
          <DiagnosticPaperContent />
        </div>
      </div>
    </>
  );
}

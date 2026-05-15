import jsPDF from "jspdf";

export const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A1: "Débutant — Utilisateur élémentaire, niveau introductif.",
  A2: "Élémentaire — Utilisateur élémentaire, niveau intermédiaire.",
  B1: "Intermédiaire — Utilisateur indépendant, niveau seuil.",
  B2: "Intermédiaire avancé — Utilisateur indépendant, niveau avancé.",
  C1: "Avancé — Utilisateur expérimenté, niveau autonome.",
  C2: "Maîtrise — Utilisateur expérimenté, maîtrise complète.",
};

const RECOMMENDATIONS: Record<string, string> = {
  A1: "Travaillez d'abord le vocabulaire de la vie quotidienne et les structures de phrase simples. Privilégiez l'écoute active et la répétition orale.",
  A2: "Consolidez la conjugaison au présent et au passé composé. Entraînez-vous à raconter des événements simples et à comprendre des messages courts.",
  B1: "Renforcez la compréhension de textes plus longs et la production écrite structurée (lettres, récits). Travaillez les nuances de temps et de modes.",
  B2: "Approfondissez le vocabulaire spécialisé et la nuance argumentative. Travaillez la compréhension de l'implicite et la production de textes argumentés.",
  C1: "Affinez la nuance lexicale et stylistique. Travaillez les expressions idiomatiques et la production fluide sur des sujets complexes.",
  C2: "Maintenez votre niveau par une exposition régulière à des contenus exigeants (littérature, presse spécialisée, débats).",
};

interface AnswerRecord {
  questionId: number | string;
  isCorrect: boolean;
  level: string;
  category: string;
}

interface PDFData {
  candidateName: string;
  candidateEmail: string;
  level: string;
  score: number;
  durationSeconds: number;
  answers: AnswerRecord[];
}

export async function generatePlacementTestPDF(data: PDFData): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 48;
  let y = 56;

  // Brand color (HSL 178 100% 16% ≈ #00504e)
  const BRAND: [number, number, number] = [0, 80, 78];
  const ACCENT: [number, number, number] = [23, 195, 178];
  const TEXT: [number, number, number] = [33, 37, 41];
  const MUTED: [number, number, number] = [108, 117, 125];

  // Header band
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, pageWidth, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PEF — Bilan de positionnement", marginX, 23);

  y = 72;

  // Title
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Résultats du test de positionnement", marginX, y);
  y += 28;

  // Candidate info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text(`Date : ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}`, marginX, y);
  y += 16;
  doc.setTextColor(...TEXT);
  doc.text(`Candidat : ${data.candidateName}`, marginX, y);
  y += 16;
  doc.text(`Email : ${data.candidateEmail}`, marginX, y);
  y += 28;

  // Level box
  doc.setFillColor(...BRAND);
  doc.roundedRect(marginX, y, pageWidth - 2 * marginX, 84, 8, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("NIVEAU CECRL ESTIMÉ", marginX + 18, y + 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text(data.level, marginX + 18, y + 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const desc = LEVEL_DESCRIPTIONS[data.level] || "";
  const descLines = doc.splitTextToSize(desc, pageWidth - 2 * marginX - 140);
  doc.text(descLines, marginX + 130, y + 38);
  // Score badge
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(`${data.score}%`, pageWidth - marginX - 20, y + 36, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("score global", pageWidth - marginX - 20, y + 52, { align: "right" });
  const dMin = Math.floor(data.durationSeconds / 60);
  const dSec = data.durationSeconds % 60;
  doc.text(`Durée : ${dMin}min ${dSec.toString().padStart(2, "0")}s`, pageWidth - marginX - 20, y + 68, { align: "right" });

  y += 84 + 28;

  // Skill analysis by category
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Analyse par compétence", marginX, y);
  y += 18;

  const catMap = new Map<string, { correct: number; total: number }>();
  data.answers.forEach(a => {
    const cat = a.category || "Autre";
    if (!catMap.has(cat)) catMap.set(cat, { correct: 0, total: 0 });
    const c = catMap.get(cat)!;
    c.total++;
    if (a.isCorrect) c.correct++;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const barWidth = pageWidth - 2 * marginX - 160;
  Array.from(catMap.entries()).forEach(([cat, { correct, total }]) => {
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    if (y > 740) { doc.addPage(); y = 56; }
    doc.setTextColor(...TEXT);
    doc.text(cat, marginX, y);
    doc.setTextColor(...MUTED);
    doc.text(`${correct}/${total} (${pct}%)`, pageWidth - marginX, y, { align: "right" });
    // bar
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(marginX + 140, y - 8, barWidth, 6, 3, 3, "F");
    const fillColor: [number, number, number] = pct >= 70 ? [50, 207, 138] : pct >= 40 ? [245, 158, 11] : [239, 68, 68];
    doc.setFillColor(...fillColor);
    doc.roundedRect(marginX + 140, y - 8, Math.max(2, (barWidth * pct) / 100), 6, 3, 3, "F");
    y += 22;
  });

  y += 12;
  if (y > 680) { doc.addPage(); y = 56; }

  // Recommendations
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Recommandations", marginX, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...TEXT);
  const reco = RECOMMENDATIONS[data.level] || RECOMMENDATIONS.A1;
  const recoLines = doc.splitTextToSize(reco, pageWidth - 2 * marginX);
  doc.text(recoLines, marginX, y);
  y += recoLines.length * 14 + 18;

  // Disclaimer
  if (y > 740) { doc.addPage(); y = 56; }
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.5);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 16;
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const disclaimer = "Ce bilan est indicatif et ne constitue pas une certification officielle du niveau CECRL (DELF, DALF, TCF, TEF). Il a été établi sur la base d'un test pédagogique en ligne.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 2 * marginX);
  doc.text(disclaimerLines, marginX, y);

  // Footer on each page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Document généré par PEF — ToFrance", marginX, doc.internal.pageSize.getHeight() - 18);
    doc.text(`Page ${i} / ${pageCount}`, pageWidth - marginX, doc.internal.pageSize.getHeight() - 18, { align: "right" });
  }

  return doc.output("blob");
}

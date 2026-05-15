import jsPDF from "jspdf";

export const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A1: "Débutant — Utilisateur élémentaire, niveau introductif.",
  A2: "Élémentaire — Utilisateur élémentaire, niveau intermédiaire.",
  B1: "Intermédiaire — Utilisateur indépendant, niveau seuil.",
  B2: "Intermédiaire avancé — Utilisateur indépendant, niveau avancé.",
  C1: "Avancé — Utilisateur expérimenté, niveau autonome.",
  C2: "Maîtrise — Utilisateur expérimenté, maîtrise complète.",
};

const LEVEL_LONG_DESCRIPTIONS: Record<string, string> = {
  A1: "Vous comprenez et utilisez des expressions familières et quotidiennes ainsi que des énoncés très simples. Vous pouvez vous présenter, poser à une personne des questions la concernant — par exemple sur son lieu d'habitation, ses relations, ce qui lui appartient — et répondre au même type de questions. Vous communiquez de façon simple si l'interlocuteur parle lentement et distinctement.",
  A2: "Vous comprenez des phrases isolées et des expressions fréquemment utilisées en relation avec des domaines immédiats de priorité (informations personnelles et familiales simples, achats, environnement proche, travail). Vous communiquez lors de tâches simples ne demandant qu'un échange d'informations sur des sujets familiers et habituels.",
  B1: "Vous comprenez les points essentiels quand un langage clair et standard est utilisé et s'il s'agit de choses familières dans le travail, à l'école, dans les loisirs. Vous vous débrouillez dans la plupart des situations rencontrées en voyage. Vous produisez un discours simple et cohérent sur des sujets familiers et dans vos domaines d'intérêt.",
  B2: "Vous comprenez le contenu essentiel de sujets concrets ou abstraits dans un texte complexe, y compris une discussion technique dans votre spécialité. Vous communiquez avec un degré de spontanéité et d'aisance tel qu'une conversation avec un locuteur natif ne comporte de tension ni pour l'un ni pour l'autre.",
  C1: "Vous comprenez une grande gamme de textes longs et exigeants, ainsi que les significations implicites. Vous vous exprimez spontanément et couramment sans devoir trop manifestement chercher vos mots. Vous utilisez la langue de façon efficace et souple dans la vie sociale, professionnelle ou académique.",
  C2: "Vous comprenez sans effort pratiquement tout ce que vous lisez ou entendez. Vous restituez faits et arguments de diverses sources écrites et orales en les résumant de façon cohérente. Vous vous exprimez spontanément, très couramment et de façon précise, en différenciant de fines nuances de sens.",
};

const RECOMMENDATIONS_DETAILED: Record<string, Array<{ title: string; body: string }>> = {
  A1: [
    { title: "Construire le vocabulaire du quotidien", body: "Mémorisez chaque semaine 20 à 30 mots liés à des situations concrètes : salutations, famille, repas, transports, démarches simples. Associez chaque mot à une image ou une phrase courte." },
    { title: "Pratiquer l'écoute active", body: "Écoutez quotidiennement des dialogues très lents et courts (méthodes FLE niveau A1, podcasts pour débutants). Répétez à voix haute pour entraîner la prononciation et l'oreille." },
    { title: "S'entraîner sur les structures de base", body: "Travaillez les verbes être, avoir, aller, faire au présent et les phrases simples (sujet + verbe + complément). Faites 10 minutes d'exercices écrits par jour." },
  ],
  A2: [
    { title: "Raconter des événements simples", body: "Entraînez-vous à parler de votre journée, de vos week-ends, de vos souvenirs en utilisant le passé composé et l'imparfait. Tenez un petit journal de 5 phrases par jour." },
    { title: "Comprendre des messages courants", body: "Lisez des messages courts, annonces, SMS, courriels simples. Écoutez des dialogues du quotidien (au marché, à la poste, chez le médecin)." },
    { title: "Élargir le vocabulaire utile", body: "Concentrez-vous sur les domaines du travail, du logement, de la santé et des démarches administratives — utiles pour votre installation en France." },
  ],
  B1: [
    { title: "Pratiquer la lecture quotidienne", body: "Lisez chaque jour un article court (presse simplifiée, blog, brève) et résumez-le en 3 phrases. Cela renforce le vocabulaire et la compréhension globale." },
    { title: "Renforcer la production orale", body: "Participez à des conversations en français au moins 3 fois par semaine, en présentiel ou en ligne. Décrivez des situations, donnez votre avis, expliquez vos choix." },
    { title: "Travailler la grammaire seuil", body: "Approfondissez les temps du passé, le subjonctif présent, les pronoms relatifs et les connecteurs logiques. Faites des exercices d'application en contexte." },
  ],
  B2: [
    { title: "Approfondir le vocabulaire spécialisé", body: "Construisez des lexiques thématiques liés à votre domaine professionnel ou d'études. Lisez la presse généraliste et spécialisée pour enrichir vos nuances." },
    { title: "Travailler l'argumentation écrite", body: "Rédigez régulièrement des textes structurés (lettres formelles, synthèses, essais). Soignez les connecteurs logiques et l'organisation des idées." },
    { title: "Comprendre l'implicite", body: "Écoutez des débats, des interviews, des podcasts d'opinion. Identifiez le point de vue, le ton, les sous-entendus du locuteur." },
  ],
  C1: [
    { title: "Affiner la nuance lexicale", body: "Travaillez les synonymes, les registres de langue, les expressions idiomatiques et la précision du vocabulaire." },
    { title: "Produire avec aisance sur sujets complexes", body: "Entraînez-vous à exposer, défendre et nuancer un point de vue à l'oral comme à l'écrit, sur des sujets abstraits ou techniques." },
    { title: "Maintenir une exposition exigeante", body: "Lisez romans, essais, presse spécialisée. Écoutez radio culturelle, conférences, débats sur des sujets variés." },
  ],
  C2: [
    { title: "Maintenir le niveau par l'exposition", body: "Lisez régulièrement de la littérature, des essais et de la presse exigeante. Variez les registres et les époques." },
    { title: "Travailler les nuances stylistiques", body: "Analysez les différences de ton entre auteurs, journaux, contextes. Reproduisez ces nuances dans votre propre production." },
    { title: "S'exercer à la médiation linguistique", body: "Reformulez, résumez, traduisez entre français et votre langue d'origine pour affiner la précision et la spontanéité." },
  ],
};

const NEXT_STEP: Record<string, string> = {
  A1: "Nous vous recommandons de commencer par les modules FLE Alpha et A1 de la plateforme, centrés sur la vie quotidienne et les démarches de base.",
  A2: "Continuez avec les modules FLE A2 axés sur le logement, le travail et la santé. Ils consolideront les acquis du niveau élémentaire.",
  B1: "Les modules FLE B1 vous aideront à gagner en autonomie : compréhension de textes longs, échanges professionnels, expression d'opinions.",
  B2: "Les modules FLE B2 sectoriels (santé, BTP, commerce, restauration) vous prépareront à une intégration professionnelle pleine et entière.",
  C1: "Visez une certification officielle (DELF B2 ou DALF C1) pour valoriser votre niveau. Poursuivez avec des contenus spécialisés.",
  C2: "Maintenez votre maîtrise par une pratique régulière et envisagez la certification DALF C2 si vous en avez besoin pour vos projets.",
};

const LEVELS_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

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
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 56;

  const BRAND: [number, number, number] = [0, 80, 78];
  const ACCENT: [number, number, number] = [23, 195, 178];
  const TEXT: [number, number, number] = [33, 37, 41];
  const MUTED: [number, number, number] = [108, 117, 125];
  const BORDER: [number, number, number] = [229, 233, 233];

  const drawHeaderBand = () => {
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, pageWidth, 36, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("PEF — Bilan de positionnement", marginX, 23);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("ToFrance", pageWidth - marginX, 23, { align: "right" });
  };

  // ============== PAGE 1 — NIVEAU CECRL ==============
  drawHeaderBand();
  let y = 76;

  // Identité
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Date : ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}`,
    marginX,
    y,
  );
  y += 16;
  doc.setTextColor(...TEXT);
  doc.setFontSize(11);
  doc.text(`Candidat : ${data.candidateName}`, marginX, y);
  y += 15;
  doc.text(`Email : ${data.candidateEmail}`, marginX, y);
  y += 15;
  const dMin = Math.floor(data.durationSeconds / 60);
  const dSec = data.durationSeconds % 60;
  doc.text(`Durée du test : ${dMin} min ${dSec.toString().padStart(2, "0")} s`, marginX, y);
  y += 36;

  // Badge niveau XL
  const badgeSize = 130;
  const badgeX = (pageWidth - badgeSize) / 2;
  const badgeY = y;
  doc.setFillColor(...BRAND);
  doc.roundedRect(badgeX, badgeY, badgeSize, badgeSize, 16, 16, "F");
  // Liseré accent
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(2);
  doc.roundedRect(badgeX + 6, badgeY + 6, badgeSize - 12, badgeSize - 12, 12, 12, "S");
  doc.setLineWidth(0.5);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("NIVEAU CECRL", badgeX + badgeSize / 2, badgeY + 32, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(54);
  doc.text(data.level, badgeX + badgeSize / 2, badgeY + 88, { align: "center" });

  y = badgeY + badgeSize + 22;
  // Libellé sous badge
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  const shortLabel = (LEVEL_DESCRIPTIONS[data.level] || "").split("—")[0]?.trim() || "";
  doc.text(shortLabel, pageWidth / 2, y, { align: "center" });
  y += 26;

  // Échelle CECRL
  const scaleY = y;
  const scaleStart = marginX + 40;
  const scaleEnd = pageWidth - marginX - 40;
  const scaleW = scaleEnd - scaleStart;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(1);
  doc.line(scaleStart, scaleY, scaleEnd, scaleY);
  const currentIdx = LEVELS_ORDER.indexOf(data.level);
  LEVELS_ORDER.forEach((lvl, i) => {
    const cx = scaleStart + (scaleW * i) / (LEVELS_ORDER.length - 1);
    const isCurrent = i === currentIdx;
    const isPast = i < currentIdx;
    if (isCurrent) {
      doc.setFillColor(...BRAND);
      doc.circle(cx, scaleY, 9, "F");
    } else if (isPast) {
      doc.setFillColor(...ACCENT);
      doc.circle(cx, scaleY, 6, "F");
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...BORDER);
      doc.circle(cx, scaleY, 6, "FD");
    }
    doc.setFont("helvetica", isCurrent ? "bold" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(...(isCurrent ? BRAND : MUTED));
    doc.text(lvl, cx, scaleY + 22, { align: "center" });
  });
  y = scaleY + 44;

  // Description longue
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const longDesc = LEVEL_LONG_DESCRIPTIONS[data.level] || "";
  const longLines = doc.splitTextToSize(longDesc, pageWidth - 2 * marginX);
  doc.text(longLines, marginX, y);
  y += longLines.length * 15 + 24;

  // Score global encadré
  const scoreBoxH = 60;
  doc.setFillColor(248, 250, 250);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(marginX, y, pageWidth - 2 * marginX, scoreBoxH, 8, 8, "FD");
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("SCORE GLOBAL", marginX + 20, y + 24);
  doc.setTextColor(...BRAND);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(`${data.score} %`, marginX + 20, y + 50);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `${data.answers.filter(a => a.isCorrect).length} bonnes réponses sur ${data.answers.length}`,
    pageWidth - marginX - 20,
    y + 38,
    { align: "right" },
  );

  // ============== PAGE 2 — ANALYSE PAR CATÉGORIE ==============
  doc.addPage();
  drawHeaderBand();
  y = 76;
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Analyse par compétence", marginX, y);
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(
    "Détail de vos résultats selon les domaines évalués pendant le test.",
    marginX,
    y + 12,
  );
  y += 36;

  // Agrégation
  const catMap = new Map<string, { correct: number; total: number }>();
  data.answers.forEach(a => {
    const cat = a.category || "Autre";
    if (!catMap.has(cat)) catMap.set(cat, { correct: 0, total: 0 });
    const c = catMap.get(cat)!;
    c.total++;
    if (a.isCorrect) c.correct++;
  });

  const cardH = 78;
  const cardGap = 12;
  const innerW = pageWidth - 2 * marginX;

  Array.from(catMap.entries()).forEach(([cat, { correct, total }]) => {
    if (y + cardH > pageHeight - 56) {
      doc.addPage();
      drawHeaderBand();
      y = 76;
    }
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    // Carte
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.8);
    doc.roundedRect(marginX, y, innerW, cardH, 10, 10, "FD");

    // Label
    doc.setTextColor(...TEXT);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(cat, marginX + 18, y + 24);
    // Score
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND);
    doc.text(`${pct} %`, marginX + innerW - 18, y + 24, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`${correct}/${total}`, marginX + innerW - 18, y + 38, { align: "right" });

    // Barre
    const barX = marginX + 18;
    const barY = y + 42;
    const barW = innerW - 36;
    doc.setFillColor(240, 242, 242);
    doc.roundedRect(barX, barY, barW, 6, 3, 3, "F");
    const fill: [number, number, number] = pct >= 70 ? [50, 207, 138] : pct >= 40 ? [245, 158, 11] : [239, 68, 68];
    doc.setFillColor(...fill);
    doc.roundedRect(barX, barY, Math.max(3, (barW * pct) / 100), 6, 3, 3, "F");

    // Commentaire contextuel
    const comment =
      pct >= 70
        ? "Bonne maîtrise. Vous pouvez vous appuyer sur cette compétence pour progresser plus loin."
        : pct >= 40
        ? "Consolidation utile. Quelques notions à revoir pour gagner en aisance."
        : "Compétence à travailler en priorité. Une remise à niveau ciblée est conseillée.";
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT);
    const commentLines = doc.splitTextToSize(comment, innerW - 36);
    doc.text(commentLines, barX, y + 64);

    y += cardH + cardGap;
  });

  // ============== PAGE 3 — RECOMMANDATIONS ==============
  doc.addPage();
  drawHeaderBand();
  y = 76;
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Recommandations", marginX, y);
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(
    "Trois priorités personnalisées pour progresser à partir de votre niveau actuel.",
    marginX,
    y + 12,
  );
  y += 36;

  const recos = RECOMMENDATIONS_DETAILED[data.level] || RECOMMENDATIONS_DETAILED.A1;
  recos.forEach((r, i) => {
    if (y + 90 > pageHeight - 100) {
      doc.addPage();
      drawHeaderBand();
      y = 76;
    }
    // Numéro
    doc.setFillColor(...BRAND);
    doc.circle(marginX + 14, y + 8, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(String(i + 1), marginX + 14, y + 13, { align: "center" });

    // Titre
    doc.setTextColor(...TEXT);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(r.title, marginX + 40, y + 13);

    // Corps
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...TEXT);
    const bodyLines = doc.splitTextToSize(r.body, pageWidth - 2 * marginX - 40);
    doc.text(bodyLines, marginX + 40, y + 32);
    y += 32 + bodyLines.length * 14 + 18;
  });

  // Encadré « Prochaine étape »
  y += 8;
  const nextText = NEXT_STEP[data.level] || NEXT_STEP.A1;
  const nextLines = doc.splitTextToSize(nextText, pageWidth - 2 * marginX - 36);
  const nextBoxH = 32 + nextLines.length * 14 + 18;
  if (y + nextBoxH > pageHeight - 56) {
    doc.addPage();
    drawHeaderBand();
    y = 76;
  }
  doc.setFillColor(240, 252, 250);
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.8);
  doc.roundedRect(marginX, y, pageWidth - 2 * marginX, nextBoxH, 10, 10, "FD");
  doc.setTextColor(...BRAND);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Prochaine étape", marginX + 18, y + 22);
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(nextLines, marginX + 18, y + 40);

  // ============== FOOTER UNIFORME ==============
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("PEF — ToFrance", marginX, pageHeight - 24);
    doc.text(`Page ${i} / ${pageCount}`, pageWidth - marginX, pageHeight - 24, { align: "right" });
  }

  return doc.output("blob");
}

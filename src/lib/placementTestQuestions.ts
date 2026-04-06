export interface PlacementQuestion {
  id: number;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  category: string;
  question: string;
  options?: string[];
  correct?: string;
  explanation?: string;
  audioText?: string;
  type?: "oral" | "written";
  placeholder?: string;
  minWords?: number;
  minDuration?: number;
  criteria?: string[];
}

export const questions: PlacementQuestion[] = [
  // ==================== A1 Level ====================
  { id: 1, level: "A1", category: "Grammaire", question: "Complétez : « Je ___ français. »", options: ["suis", "ai", "est", "as"], correct: "suis", explanation: "On utilise 'suis' avec 'je' pour exprimer la nationalité." },
  { id: 2, level: "A1", category: "Grammaire", question: "Quel est le pluriel de « un livre » ?", options: ["des livre", "des livres", "les livre", "un livres"], correct: "des livres", explanation: "Au pluriel : des livres." },
  { id: 3, level: "A1", category: "Grammaire", question: "Complétez : « Tu ___ quel âge ? »", options: ["as", "es", "ai", "est"], correct: "as", explanation: "Verbe avoir : Tu as quel âge ?" },
  { id: 4, level: "A1", category: "Grammaire", question: "Choisissez : « Elle ___ à Paris. »", options: ["habite", "habiter", "habitez", "habitent"], correct: "habite" },
  { id: 5, level: "A1", category: "Vocabulaire", question: "Quel mot utilise-t-on pour saluer quelqu'un le matin ?", options: ["Au revoir", "Bonjour", "Merci", "S'il vous plaît"], correct: "Bonjour" },
  { id: 6, level: "A1", category: "Vocabulaire", question: "Quel article : « ___ pomme » ?", options: ["Un", "Une", "Des", "Le"], correct: "Une" },
  { id: 7, level: "A1", category: "Vocabulaire", question: "Quel mot pour remercier ?", options: ["S'il vous plaît", "Merci", "Pardon", "De rien"], correct: "Merci" },
  { id: 8, level: "A1", category: "Vocabulaire", question: "Combien font 2 + 3 ?", options: ["Quatre", "Cinq", "Six", "Sept"], correct: "Cinq" },
  { id: 9, level: "A1", category: "Compréhension Orale", question: "Écoutez. Quelle est la question posée ?", audioText: "Comment tu t'appelles ?", options: ["Quel âge as-tu ?", "Comment tu t'appelles ?", "Où habites-tu ?", "Quelle heure est-il ?"], correct: "Comment tu t'appelles ?" },
  { id: 10, level: "A1", category: "Compréhension Orale", question: "Écoutez. Quel jour est mentionné ?", audioText: "On se voit lundi prochain.", options: ["Mardi", "Mercredi", "Lundi", "Jeudi"], correct: "Lundi" },
  { id: 11, level: "A1", category: "Compréhension Écrite", question: "Lisez : « Je m'appelle Marie. J'ai 25 ans. » Quel âge a Marie ?", options: ["20 ans", "25 ans", "30 ans", "35 ans"], correct: "25 ans" },
  { id: 12, level: "A1", category: "Compréhension Écrite", question: "Lisez : « Le chat est sur la table. » Où est le chat ?", options: ["Sous la table", "Sur la table", "Derrière la table", "Devant la table"], correct: "Sur la table" },

  // ==================== A2 Level ====================
  { id: 13, level: "A2", category: "Grammaire", question: "Complétez : « Hier, nous ___ au cinéma. »", options: ["allons", "sommes allés", "irons", "allions"], correct: "sommes allés" },
  { id: 14, level: "A2", category: "Grammaire", question: "Complétez : « Elle ___ au marché tous les samedis. »", options: ["va", "aller", "allé", "allait"], correct: "va" },
  { id: 15, level: "A2", category: "Grammaire", question: "Choisissez : « Je ___ en France l'année dernière. »", options: ["vais", "suis allé", "irai", "allais"], correct: "suis allé" },
  { id: 16, level: "A2", category: "Grammaire", question: "Complétez : « Quand j'étais petit, je ___ beaucoup de bonbons. »", options: ["mange", "mangeais", "ai mangé", "mangerai"], correct: "mangeais" },
  { id: 17, level: "A2", category: "Vocabulaire", question: "Inverse de « grand » ?", options: ["haut", "petit", "large", "long"], correct: "petit" },
  { id: 18, level: "A2", category: "Vocabulaire", question: "Que signifie « être en retard » ?", options: ["Arriver tôt", "Arriver après l'heure prévue", "Arriver à l'heure", "Être absent"], correct: "Arriver après l'heure prévue" },
  { id: 19, level: "A2", category: "Vocabulaire", question: "Le ___ est mauvais aujourd'hui, il pleut.", options: ["temps", "heure", "jour", "moment"], correct: "temps" },
  { id: 20, level: "A2", category: "Compréhension Orale", question: "Où vont les deux personnes ?", audioText: "On va au restaurant ce soir ? — Oui, bonne idée !", options: ["Au cinéma", "Au restaurant", "À la plage", "Au musée"], correct: "Au restaurant" },
  { id: 21, level: "A2", category: "Compréhension Orale", question: "Quel est le problème ?", audioText: "Je ne trouve plus mes clés, je les ai perdues.", options: ["Il a perdu son téléphone", "Il a perdu ses clés", "Il a perdu son portefeuille", "Il a perdu ses lunettes"], correct: "Il a perdu ses clés" },
  { id: 22, level: "A2", category: "Compréhension Écrite", question: "« Il fait beau aujourd'hui. » Parle de :", options: ["la nourriture", "la météo", "le travail", "la santé"], correct: "la météo" },
  { id: 23, level: "A2", category: "Compréhension Écrite", question: "Le magasin ouvre à 9h et ferme à 19h. Combien d'heures est-il ouvert ?", options: ["8 heures", "9 heures", "10 heures", "11 heures"], correct: "10 heures" },

  // ==================== B1 Level ====================
  { id: 24, level: "B1", category: "Grammaire", question: "Complétez : « Si j'avais le temps, je ___ ce livre. »", options: ["lis", "lirais", "lirai", "lisais"], correct: "lirais" },
  { id: 25, level: "B1", category: "Grammaire", question: "C'est le livre ___ je t'ai parlé.", options: ["que", "dont", "qui", "où"], correct: "dont" },
  { id: 26, level: "B1", category: "Grammaire", question: "Il faut que tu ___ plus attention.", options: ["fais", "fasses", "faire", "ferais"], correct: "fasses" },
  { id: 27, level: "B1", category: "Grammaire", question: "Je viens ___ finir mon travail.", options: ["à", "de", "pour", "par"], correct: "de" },
  { id: 28, level: "B1", category: "Vocabulaire", question: "Que signifie « être débordé » ?", options: ["Être fatigué", "Avoir trop de travail", "Être malade", "Être en retard"], correct: "Avoir trop de travail" },
  { id: 29, level: "B1", category: "Vocabulaire", question: "Synonyme de « efficace » ?", options: ["Lent", "Rapide", "Performant", "Difficile"], correct: "Performant" },
  { id: 30, level: "B1", category: "Vocabulaire", question: "Que signifie « avoir le cafard » ?", options: ["Avoir faim", "Être déprimé", "Être en colère", "Avoir peur"], correct: "Être déprimé" },
  { id: 31, level: "B1", category: "Compréhension Orale", question: "À quelle heure part le train ?", audioText: "Le train en provenance de Paris partira à quinze heures trente du quai numéro trois.", options: ["14h30", "15h30", "16h30", "17h30"], correct: "15h30" },
  { id: 32, level: "B1", category: "Compréhension Orale", question: "Pourquoi la personne appelle-t-elle ?", audioText: "Bonjour, je vous appelle pour confirmer notre rendez-vous de demain à quatorze heures. Pourriez-vous me rappeler ?", options: ["Pour annuler", "Pour confirmer un rendez-vous", "Pour prendre un rendez-vous", "Pour modifier l'heure"], correct: "Pour confirmer un rendez-vous" },
  { id: 33, level: "B1", category: "Compréhension Écrite", question: "« Il a pris ses jambes à son cou. » signifie :", options: ["Il est tombé", "Il a couru très vite", "Il a mal aux jambes", "Il s'est assis"], correct: "Il a couru très vite" },
  { id: 34, level: "B1", category: "Compréhension Écrite", question: "« Malgré la pluie, nous avons continué notre promenade. » Qu'est-ce qui est vrai ?", options: ["Ils ont arrêté", "Ils ont continué malgré la pluie", "Il ne pleuvait pas", "Ils sont rentrés"], correct: "Ils ont continué malgré la pluie" },
  { id: 49, level: "B1", category: "Expression Écrite", type: "written", question: "Racontez vos dernières vacances ou un voyage mémorable.", placeholder: "Exemple : L'été dernier, je suis allé(e) en Espagne...", minWords: 20, criteria: ["Utilise le passé composé", "Décrit les activités", "Exprime des sentiments"] },

  // ==================== B2 Level ====================
  { id: 35, level: "B2", category: "Grammaire", question: "Bien qu'il ___ fatigué, il a continué.", options: ["est", "soit", "était", "serait"], correct: "soit" },
  { id: 36, level: "B2", category: "Grammaire", question: "Il m'a demandé si je ___ venir.", options: ["peux", "pouvais", "pourrai", "pourrais"], correct: "pouvais" },
  { id: 37, level: "B2", category: "Grammaire", question: "Ayant ___ son travail, il est parti.", options: ["fini", "finir", "finit", "finis"], correct: "fini" },
  { id: 38, level: "B2", category: "Grammaire", question: "Quoi que tu ___, je te soutiendrai.", options: ["fais", "fasses", "feras", "ferais"], correct: "fasses" },
  { id: 39, level: "B2", category: "Vocabulaire", question: "Synonyme de « néanmoins » ?", options: ["Également", "Cependant", "Ensuite", "Par conséquent"], correct: "Cependant" },
  { id: 40, level: "B2", category: "Vocabulaire", question: "Que signifie « être au courant » ?", options: ["Être pressé", "Être informé", "Être en mouvement", "Être électrisé"], correct: "Être informé" },
  { id: 41, level: "B2", category: "Vocabulaire", question: "« Une démarche » dans un contexte professionnel ?", options: ["Une marche", "Une procédure", "Un bureau", "Un document"], correct: "Une procédure" },
  { id: 42, level: "B2", category: "Compréhension Orale", question: "Quel est le principal défi mentionné ?", audioText: "Notre principal défi reste la gestion du changement climatique et ses impacts sur notre économie.", options: ["Le développement technologique", "Le changement climatique", "Les relations internationales", "La croissance démographique"], correct: "Le changement climatique" },
  { id: 43, level: "B2", category: "Compréhension Orale", question: "Quelle est l'opinion de la personne ?", audioText: "À mon avis, cette réforme est nécessaire mais elle devrait être mise en place progressivement pour éviter les perturbations.", options: ["Elle est contre", "Elle est pour sans conditions", "Elle est pour mais avec prudence", "Elle n'a pas d'opinion"], correct: "Elle est pour mais avec prudence" },
  { id: 44, level: "B2", category: "Compréhension Écrite", question: "« En dépit des obstacles, le projet a été mené à bien. » Cela signifie :", options: ["Le projet a échoué", "Le projet a réussi malgré les difficultés", "Le projet n'a pas commencé", "Le projet est en cours"], correct: "Le projet a réussi malgré les difficultés" },
  { id: 45, level: "B2", category: "Compréhension Écrite", question: "Que signifie « concertée » dans « action concertée » ?", options: ["Rapide", "Musicale", "Coordonnée", "Isolée"], correct: "Coordonnée" },
  { id: 50, level: "B2", category: "Expression Écrite", type: "written", question: "Donnez votre opinion sur le télétravail. Avantages et inconvénients ?", placeholder: "Exemple : À mon avis, le télétravail présente plusieurs avantages...", minWords: 20, criteria: ["Argumentation structurée", "Connecteurs logiques", "Avantages ET inconvénients"] },

  // ==================== C1 Level ====================
  { id: 51, level: "C1", category: "Grammaire", question: "Bien qu'il ___ déjà lu ce livre, il l'a relu.", options: ["a", "ait", "avait", "aurait"], correct: "ait" },
  { id: 52, level: "C1", category: "Grammaire", question: "Voici le projet ___ nous avons besoin.", options: ["que", "dont", "qui", "où"], correct: "dont" },
  { id: 53, level: "C1", category: "Grammaire", question: "___ ses efforts, il n'a pas réussi.", options: ["Malgré", "Bien que", "Quoique", "Pendant"], correct: "Malgré" },
  { id: 54, level: "C1", category: "Grammaire", question: "Il faut que vous ___ cette décision rapidement.", options: ["prenez", "preniez", "prendrez", "prendriez"], correct: "preniez" },
  { id: 55, level: "C1", category: "Vocabulaire", question: "Mot signifiant « plusieurs interprétations possibles » ?", options: ["Équivoque", "Explicite", "Évident", "Clair"], correct: "Équivoque" },
  { id: 56, level: "C1", category: "Vocabulaire", question: "Que signifie « être réticent » ?", options: ["Être enthousiaste", "Hésiter, montrer de la résistance", "Être rapide", "Être d'accord"], correct: "Hésiter, montrer de la résistance" },
  { id: 57, level: "C1", category: "Vocabulaire", question: "Synonyme de « préconiser » ?", options: ["Déconseiller", "Recommander", "Interdire", "Ignorer"], correct: "Recommander" },
  { id: 58, level: "C1", category: "Compréhension Orale", question: "Que propose l'orateur ?", audioText: "Il est nécessaire de repenser notre système éducatif pour qu'il corresponde mieux aux besoins de la société moderne.", options: ["Garder le système actuel", "Réformer l'éducation", "Supprimer les écoles", "Augmenter les vacances"], correct: "Réformer l'éducation" },
  { id: 59, level: "C1", category: "Compréhension Écrite", question: "« Cette mesure, bien qu'utile, reste insuffisante. » Quel est le ton ?", options: ["Enthousiaste", "Critique mais nuancé", "Très négatif", "Indifférent"], correct: "Critique mais nuancé" },
  { id: 60, level: "C1", category: "Compréhension Écrite", question: "Dans « pour le moins étrange », que signifie « pour le moins » ?", options: ["Au minimum", "Exactement", "Jamais", "Toujours"], correct: "Au minimum" },
  { id: 70, level: "C1", category: "Expression Écrite", type: "written", question: "Rédigez une analyse critique sur l'impact des réseaux sociaux sur le débat démocratique contemporain.", placeholder: "Exemple : L'avènement des réseaux sociaux a profondément reconfiguré l'espace public démocratique...", minWords: 30, criteria: ["Vocabulaire sophistiqué", "Argumentation nuancée", "Connecteurs logiques variés", "Registre soutenu"] },

  // ==================== C2 Level ====================
  { id: 61, level: "C2", category: "Grammaire", question: "Quoi qu'il ___, nous le soutiendrons.", options: ["fait", "fasse", "fera", "ferait"], correct: "fasse" },
  { id: 62, level: "C2", category: "Grammaire", question: "Quelle phrase est correcte ?", options: ["Il aurait fallu qu'il ait terminé plus tôt", "Il aurait fallu qu'il avait terminé plus tôt", "Il aurait fallu qu'il termine plus tôt", "Il aurait fallu qu'il a terminé plus tôt"], correct: "Il aurait fallu qu'il ait terminé plus tôt" },
  { id: 63, level: "C2", category: "Grammaire", question: "Pour compétent qu'il ___, il ne peut pas tout faire seul.", options: ["est", "soit", "serait", "sera"], correct: "soit" },
  { id: 64, level: "C2", category: "Vocabulaire", question: "Mot désignant un discours confus et prétentieux ?", options: ["Bref", "Amphigourique", "Simple", "Direct"], correct: "Amphigourique" },
  { id: 65, level: "C2", category: "Vocabulaire", question: "Que signifie « vitupérer » ?", options: ["Féliciter", "Critiquer vivement", "Hésiter", "Encourager"], correct: "Critiquer vivement" },
  { id: 66, level: "C2", category: "Vocabulaire", question: "Mot désignant l'art culinaire raffiné ?", options: ["Œnologie", "Gastronomie", "Diététique", "Nutrition"], correct: "Gastronomie" },
  { id: 67, level: "C2", category: "Compréhension Orale", question: "Quelle est l'idée principale ?", audioText: "L'évolution de la pensée philosophique moderne montre une rupture progressive avec les traditions anciennes, tout en conservant certains éléments fondamentaux.", options: ["La philosophie n'a pas changé", "La philosophie moderne rompt avec le passé tout en gardant des bases", "La philosophie ancienne est meilleure", "Il n'y a plus de philosophie"], correct: "La philosophie moderne rompt avec le passé tout en gardant des bases" },
  { id: 68, level: "C2", category: "Compréhension Écrite", question: "Que signifie 'paradoxe' dans : « Ce paradoxe logique remet en question l'argumentation » ?", options: ["Une évidence", "Une contradiction apparente", "Un accord", "Une preuve"], correct: "Une contradiction apparente" },
  { id: 69, level: "C2", category: "Compréhension Écrite", question: "Que signifie « interpréter un texte de manière approfondie » ?", options: ["Le traduire", "L'analyser en profondeur", "Le critiquer", "Le réécrire"], correct: "L'analyser en profondeur" },
  { id: 71, level: "C2", category: "Expression Écrite", type: "written", question: "Élaborez une réflexion philosophique sur la notion d'authenticité à l'ère du numérique.", placeholder: "Exemple : La question de l'authenticité, loin d'être un simple avatar des préoccupations existentialistes...", minWords: 40, criteria: ["Maîtrise parfaite de la langue", "Profondeur conceptuelle", "Style élégant", "Références culturelles implicites"] },

  // ==================== Production Orale ====================
  { id: 46, level: "A1", category: "Production Orale", type: "oral", question: "Présentez-vous : dites votre nom, votre âge et où vous habitez.", minDuration: 5, criteria: ["Prononciation claire", "Utilise 'je m'appelle'", "Donne au moins 2 informations"] },
  { id: 47, level: "A1", category: "Expression Écrite", type: "written", question: "Décrivez votre famille : qui habite avec vous ?", placeholder: "Exemple : J'habite avec mes parents et mon frère...", minWords: 20, criteria: ["Vocabulaire de la famille", "Utilise des nombres", "Phrases simples"] },
  { id: 48, level: "A2", category: "Expression Écrite", type: "written", question: "Décrivez votre journée typique. Que faites-vous le matin, l'après-midi et le soir ?", placeholder: "Exemple : Le matin, je me réveille à 7h...", minWords: 20, criteria: ["Utilise le présent", "Structure chronologique", "Connecteurs temporels"] },
];

export const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export function getTimerDuration(level: string): number {
  if (level === "C1" || level === "C2") return 30;
  return 12;
}

export function calculateLevel(score: number): string {
  if (score >= 80) return "B2";
  if (score >= 65) return "B1";
  if (score >= 45) return "A2";
  return "A1";
}

export function calculateDetailedLevel(answers: { questionId: number; isCorrect: boolean; level: string }[]): string {
  const levelScores: Record<string, { correct: number; total: number }> = {};
  
  for (const a of answers) {
    if (!levelScores[a.level]) levelScores[a.level] = { correct: 0, total: 0 };
    levelScores[a.level].total++;
    if (a.isCorrect) levelScores[a.level].correct++;
  }

  let achievedLevel = "A1";
  for (const level of LEVEL_ORDER) {
    const s = levelScores[level];
    if (!s || s.total === 0) continue;
    const pct = (s.correct / s.total) * 100;
    if (pct >= 60) {
      achievedLevel = level;
    } else {
      break;
    }
  }
  
  return achievedLevel;
}

export function getQuestionsForLevel(level: string): PlacementQuestion[] {
  return questions.filter(q => q.level === level && !q.type);
}

export function getWrittenQuestions(): PlacementQuestion[] {
  return questions.filter(q => q.type === "written");
}

export function getOralQuestions(): PlacementQuestion[] {
  return questions.filter(q => q.type === "oral");
}

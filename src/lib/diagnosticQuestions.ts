// Catalogue standard des questions de diagnostic CIP / France Travail
// Pour primo-arrivants : projet, freins, mobilité, situation administrative et familiale.

export type DiagnosticCategory = "projet" | "situation" | "freins" | "competences";

export interface DiagnosticQuestion {
  key: string;
  category: DiagnosticCategory;
  icon: string;
  // Texte de la question dans chaque langue supportée
  question: Record<string, string>;
  // Aide / contexte affiché en plus petit (FR uniquement, pour le formateur)
  helper_fr?: string;
}

export const CATEGORY_META: Record<DiagnosticCategory, { label: string; color: string; icon: string }> = {
  projet: { label: "Projet", color: "text-primary", icon: "🎯" },
  situation: { label: "Situation", color: "text-secondary-foreground", icon: "📋" },
  freins: { label: "Freins & besoins", color: "text-destructive", icon: "⚠️" },
  competences: { label: "Compétences & expérience", color: "text-accent-foreground", icon: "💼" },
};

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // === Projet ===
  {
    key: "main_goal",
    category: "projet",
    icon: "🎯",
    question: {
      fr: "Quel est votre projet en France ? (travail, formation, apprendre le français…)",
      ar: "ما هو مشروعك في فرنسا؟ (عمل، تدريب، تعلم الفرنسية…)",
      en: "What is your project in France? (work, training, learn French…)",
      es: "¿Cuál es su proyecto en Francia? (trabajo, formación, aprender francés…)",
      pt: "Qual é o seu projeto na França? (trabalho, formação, aprender francês…)",
      ru: "Какой ваш проект во Франции? (работа, обучение, изучение французского…)",
    },
    helper_fr: "Objectif principal — le formateur reformule en projet professionnel clair.",
  },
  {
    key: "target_sector",
    category: "projet",
    icon: "🏢",
    question: {
      fr: "Dans quel secteur souhaitez-vous travailler ?",
      ar: "في أي قطاع ترغب في العمل؟",
      en: "In which sector would you like to work?",
      es: "¿En qué sector le gustaría trabajar?",
      pt: "Em que setor gostaria de trabalhar?",
      ru: "В какой сфере вы хотели бы работать?",
    },
    helper_fr: "Hôtellerie, BTP, aide à la personne, propreté, logistique, etc.",
  },
  {
    key: "training_done",
    category: "projet",
    icon: "🎓",
    question: {
      fr: "Avez-vous déjà suivi une formation en France ou dans votre pays ?",
      ar: "هل سبق لك أن خضعت لتدريب في فرنسا أو في بلدك؟",
      en: "Have you ever taken any training in France or in your country?",
      es: "¿Ha realizado alguna formación en Francia o en su país?",
      pt: "Já fez alguma formação na França ou no seu país?",
      ru: "Проходили ли вы обучение во Франции или в своей стране?",
    },
  },

  // === Situation ===
  {
    key: "admin_status",
    category: "situation",
    icon: "📜",
    question: {
      fr: "Quelle est votre situation administrative ? (titre de séjour, demande en cours…)",
      ar: "ما هو وضعك الإداري؟ (تصريح الإقامة، طلب قيد المعالجة…)",
      en: "What is your administrative status? (residence permit, pending application…)",
      es: "¿Cuál es su situación administrativa? (permiso de residencia, solicitud en curso…)",
      pt: "Qual é a sua situação administrativa? (autorização de residência, pedido em curso…)",
      ru: "Какой у вас административный статус? (вид на жительство, заявление на рассмотрении…)",
    },
    helper_fr: "Ne pas demander le numéro AGDREF — juste le type de titre et la durée.",
  },
  {
    key: "work_right",
    category: "situation",
    icon: "✅",
    question: {
      fr: "Avez-vous le droit de travailler en France ?",
      ar: "هل لديك الحق في العمل في فرنسا؟",
      en: "Do you have the right to work in France?",
      es: "¿Tiene derecho a trabajar en Francia?",
      pt: "Tem o direito de trabalhar na França?",
      ru: "У вас есть право работать во Франции?",
    },
  },
  {
    key: "family_situation",
    category: "situation",
    icon: "👨‍👩‍👧",
    question: {
      fr: "Quelle est votre situation familiale ? (enfants, garde, conjoint·e en France…)",
      ar: "ما هو وضعك العائلي؟ (أطفال، حضانة، زوج/زوجة في فرنسا…)",
      en: "What is your family situation? (children, childcare, partner in France…)",
      es: "¿Cuál es su situación familiar? (hijos, custodia, pareja en Francia…)",
      pt: "Qual é a sua situação familiar? (filhos, guarda, parceiro/a na França…)",
      ru: "Какова ваша семейная ситуация? (дети, опека, супруг/а во Франции…)",
    },
  },
  {
    key: "housing",
    category: "situation",
    icon: "🏠",
    question: {
      fr: "Comment êtes-vous logé·e actuellement ?",
      ar: "كيف تسكن حالياً؟",
      en: "How are you housed at the moment?",
      es: "¿Cómo está alojado/a actualmente?",
      pt: "Como está alojado/a atualmente?",
      ru: "Где вы сейчас живёте?",
    },
    helper_fr: "Logement stable, hébergement d'urgence, chez un proche, hôtel social…",
  },

  // === Freins ===
  {
    key: "french_level_felt",
    category: "freins",
    icon: "🗣️",
    question: {
      fr: "Comment évaluez-vous votre niveau de français à l'oral et à l'écrit ?",
      ar: "كيف تقيّم مستواك في اللغة الفرنسية شفهياً وكتابياً؟",
      en: "How do you rate your French level, both spoken and written?",
      es: "¿Cómo evalúa su nivel de francés oral y escrito?",
      pt: "Como avalia o seu nível de francês oral e escrito?",
      ru: "Как вы оцениваете свой уровень французского устно и письменно?",
    },
    helper_fr: "Niveau ressenti — à confronter avec un test FLE plus tard.",
  },
  {
    key: "mobility",
    category: "freins",
    icon: "🚌",
    question: {
      fr: "Comment vous déplacez-vous ? (transports, permis, voiture…)",
      ar: "كيف تتنقل؟ (وسائل النقل، رخصة القيادة، السيارة…)",
      en: "How do you get around? (transport, driving license, car…)",
      es: "¿Cómo se desplaza? (transporte, permiso de conducir, coche…)",
      pt: "Como se desloca? (transportes, carta de condução, carro…)",
      ru: "Как вы передвигаетесь? (транспорт, права, машина…)",
    },
  },
  {
    key: "barriers",
    category: "freins",
    icon: "⚠️",
    question: {
      fr: "Quelles difficultés rencontrez-vous au quotidien ? (santé, garde d'enfants, papiers, argent…)",
      ar: "ما هي الصعوبات التي تواجهها يومياً؟ (الصحة، حضانة الأطفال، الأوراق، المال…)",
      en: "What difficulties do you face in daily life? (health, childcare, paperwork, money…)",
      es: "¿Qué dificultades encuentra en su día a día? (salud, custodia, papeles, dinero…)",
      pt: "Que dificuldades enfrenta no dia a dia? (saúde, guarda, papelada, dinheiro…)",
      ru: "С какими трудностями вы сталкиваетесь? (здоровье, дети, документы, деньги…)",
    },
  },

  // === Compétences ===
  {
    key: "previous_experience",
    category: "competences",
    icon: "💼",
    question: {
      fr: "Quelle expérience professionnelle avez-vous, en France ou dans votre pays ?",
      ar: "ما هي خبرتك المهنية، في فرنسا أو في بلدك؟",
      en: "What work experience do you have, in France or in your country?",
      es: "¿Qué experiencia profesional tiene, en Francia o en su país?",
      pt: "Que experiência profissional tem, na França ou no seu país?",
      ru: "Какой у вас профессиональный опыт во Франции или у вас на родине?",
    },
  },
  {
    key: "availability",
    category: "competences",
    icon: "⏱️",
    question: {
      fr: "Êtes-vous disponible immédiatement pour travailler ou vous former ?",
      ar: "هل أنت متاح للعمل أو التدريب على الفور؟",
      en: "Are you available immediately to work or train?",
      es: "¿Está disponible inmediatamente para trabajar o formarse?",
      pt: "Está disponível imediatamente para trabalhar ou formar-se?",
      ru: "Готовы ли вы сразу приступить к работе или обучению?",
    },
  },
];

export const SUPPORTED_LANGUAGES: { code: string; label: string; flag: string; rtl?: boolean }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦", rtl: true },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

export const LANGUAGES = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
] as const;

export type LanguageCode = typeof LANGUAGES[number]["code"];

// Onboarding translations for all languages
const ONBOARDING_FR = {
  selectLanguage: "Quelle est votre langue ?",
  selectLanguageSubtitle: "Choisissez la langue dans laquelle vous souhaitez être accompagné(e)",
  questions: {
    name: "Comment vous appelez-vous et d'où venez-vous ?",
    profession: "Quel était votre métier dans votre pays d'origine ?",
    skills: "Quelles sont vos compétences et expériences professionnelles principales ?",
    goals: "Quel domaine ou métier vous intéresse en France ?",
    frenchLevel: "Notez votre niveau de français de 1 à 5. 1 signifie débutant, 5 signifie courant.",
  },
  recording: "Enregistrement en cours...",
  tapToStop: "Appuyez pour arrêter",
  tapToRecord: "Appuyez sur le microphone pour répondre",
  addMore: "Appuyez pour ajouter à votre réponse",
  transcribing: "Transcription en cours...",
  loadingAudio: "Chargement audio...",
  playing: "Lecture en cours...",
  switchToText: "Passer à la saisie texte",
  switchToVoice: "Passer au mode vocal",
  writeAnswer: "Écrivez votre réponse",
  yourAnswer: "Votre réponse",
  correct: "Corriger",
  cancel: "Annuler",
  save: "Enregistrer",
  skip: "Passer",
  next: "Suivant",
  finish: "Terminer",
  profileCreated: "Profil créé avec succès !",
  profileCreatedSubtitle: "Nous avons préparé un parcours personnalisé pour vous",
  discoverPath: "Découvrir mon parcours",
  micPermissionDenied: "Accès au microphone refusé",
  micPermissionInstructions: "Pour utiliser la saisie vocale, veuillez autoriser l'accès au microphone",
  noMicrophone: "Aucun microphone détecté",
  browserNotSupported: "Navigateur non compatible",
  technicalError: "Erreur technique",
  useTextInput: "Vous pouvez aussi utiliser la saisie texte",
};

const ONBOARDING_EN = {
  selectLanguage: "What is your language?",
  selectLanguageSubtitle: "Choose the language in which you want to be guided",
  questions: {
    name: "What is your name and where are you from?",
    profession: "What was your profession in your home country?",
    skills: "What are your main skills and professional experiences?",
    goals: "What field or profession interests you in France?",
    frenchLevel: "Rate your French level from 1 to 5. 1 means beginner, 5 means fluent.",
  },
  recording: "Recording...",
  tapToStop: "Tap to stop",
  tapToRecord: "Tap the microphone to answer",
  addMore: "Tap to add to your answer",
  transcribing: "Transcribing...",
  loadingAudio: "Loading audio...",
  playing: "Playing...",
  switchToText: "Switch to text input",
  switchToVoice: "Switch to voice mode",
  writeAnswer: "Write your answer",
  yourAnswer: "Your answer",
  correct: "Edit",
  cancel: "Cancel",
  save: "Save",
  skip: "Skip",
  next: "Next",
  finish: "Finish",
  profileCreated: "Profile created successfully!",
  profileCreatedSubtitle: "We have prepared a personalized path for you",
  discoverPath: "Discover my path",
  micPermissionDenied: "Microphone access denied",
  micPermissionInstructions: "To use voice input, please allow microphone access",
  noMicrophone: "No microphone detected",
  browserNotSupported: "Browser not supported",
  technicalError: "Technical error",
  useTextInput: "You can also use text input",
};

const ONBOARDING_AR = {
  selectLanguage: "ما لغتكم؟",
  selectLanguageSubtitle: "اختاروا اللغة التي تودّون تلقّي الإرشاد بها",
  questions: {
    name: "ما اسمكم ومن أين أنتم؟",
    profession: "ما كانت مهنتكم في بلدكم الأصلي؟",
    skills: "ما مهاراتكم وخبراتكم المهنية الرئيسة؟",
    goals: "ما المجال أو المهنة التي تهمّكم في فرنسا؟",
    frenchLevel: "قيِّموا مستواكم في الفرنسية من 1 إلى 5: 1 للمبتدئ، و5 للطلاقة.",
  },
  recording: "جارٍ التسجيل...",
  tapToStop: "اضغطوا للإيقاف",
  tapToRecord: "اضغطوا على الميكروفون للإجابة",
  addMore: "اضغطوا لإضافة المزيد",
  transcribing: "جارٍ النسخ...",
  loadingAudio: "جارٍ تحميل الصوت...",
  playing: "جارٍ التشغيل...",
  switchToText: "التبديل إلى الكتابة",
  switchToVoice: "التبديل إلى الصوت",
  writeAnswer: "اكتبوا إجابتكم",
  yourAnswer: "إجابتكم",
  correct: "تصحيح",
  cancel: "إلغاء",
  save: "حفظ",
  skip: "تخطي",
  next: "التالي",
  finish: "إنهاء",
  profileCreated: "تم إنشاء الملف الشخصي بنجاح!",
  profileCreatedSubtitle: "لقد أعددنا مسارًا مخصّصًا لكم",
  discoverPath: "اكتشفوا مساري",
  micPermissionDenied: "تم رفض الوصول إلى الميكروفون",
  micPermissionInstructions: "للاستخدام الصوتي، يُرجى السماح بالوصول إلى الميكروفون",
  noMicrophone: "لم يُكتشَف ميكروفون",
  browserNotSupported: "المتصفّح غير مدعوم",
  technicalError: "خطأ تقني",
  useTextInput: "يمكنكم أيضًا استخدام الكتابة",
};

const ONBOARDING_ES = {
  selectLanguage: "¿Cuál es tu idioma?",
  selectLanguageSubtitle: "Elige el idioma en el que deseas ser guiado",
  questions: {
    name: "¿Cómo te llamas y de dónde eres?",
    profession: "¿Cuál era tu profesión en tu país de origen?",
    skills: "¿Cuáles son tus principales habilidades y experiencias profesionales?",
    goals: "¿Qué campo o profesión te interesa en Francia?",
    frenchLevel: "Califica tu nivel de francés del 1 al 5. 1 significa principiante, 5 significa fluido.",
  },
  recording: "Grabando...",
  tapToStop: "Toca para detener",
  tapToRecord: "Toca el micrófono para responder",
  addMore: "Toca para añadir más",
  transcribing: "Transcribiendo...",
  loadingAudio: "Cargando audio...",
  playing: "Reproduciendo...",
  switchToText: "Cambiar a texto",
  switchToVoice: "Cambiar a voz",
  writeAnswer: "Escribe tu respuesta",
  yourAnswer: "Tu respuesta",
  correct: "Corregir",
  cancel: "Cancelar",
  save: "Guardar",
  skip: "Saltar",
  next: "Siguiente",
  finish: "Terminar",
  profileCreated: "¡Perfil creado con éxito!",
  profileCreatedSubtitle: "Hemos preparado un camino personalizado para ti",
  discoverPath: "Descubrir mi camino",
  micPermissionDenied: "Acceso al micrófono denegado",
  micPermissionInstructions: "Para usar la entrada de voz, permite el acceso al micrófono",
  noMicrophone: "No se detectó micrófono",
  browserNotSupported: "Navegador no compatible",
  technicalError: "Error técnico",
  useTextInput: "También puedes usar entrada de texto",
};

const ONBOARDING_PT = {
  selectLanguage: "Qual é o seu idioma?",
  selectLanguageSubtitle: "Escolha o idioma no qual deseja ser orientado",
  questions: {
    name: "Qual é o seu nome e de onde você é?",
    profession: "Qual era sua profissão no seu país de origem?",
    skills: "Quais são suas principais habilidades e experiências profissionais?",
    goals: "Qual área ou profissão te interessa na França?",
    frenchLevel: "Avalie seu nível de francês de 1 a 5. 1 significa iniciante, 5 significa fluente.",
  },
  recording: "Gravando...",
  tapToStop: "Toque para parar",
  tapToRecord: "Toque no microfone para responder",
  addMore: "Toque para adicionar mais",
  transcribing: "Transcrevendo...",
  loadingAudio: "Carregando áudio...",
  playing: "Reproduzindo...",
  switchToText: "Mudar para texto",
  switchToVoice: "Mudar para voz",
  writeAnswer: "Escreva sua resposta",
  yourAnswer: "Sua resposta",
  correct: "Corrigir",
  cancel: "Cancelar",
  save: "Salvar",
  skip: "Pular",
  next: "Próximo",
  finish: "Finalizar",
  profileCreated: "Perfil criado com sucesso!",
  profileCreatedSubtitle: "Preparamos um caminho personalizado para você",
  discoverPath: "Descobrir meu caminho",
  micPermissionDenied: "Acesso ao microfone negado",
  micPermissionInstructions: "Para usar entrada de voz, permita o acesso ao microfone",
  noMicrophone: "Nenhum microfone detectado",
  browserNotSupported: "Navegador não suportado",
  technicalError: "Erro técnico",
  useTextInput: "Você também pode usar entrada de texto",
};


const ONBOARDING_RU = {
  selectLanguage: "Какой ваш язык?",
  selectLanguageSubtitle: "Выберите язык, на котором хотите получать помощь",
  questions: {
    name: "Как вас зовут и откуда вы?",
    profession: "Какая была ваша профессия на родине?",
    skills: "Каковы ваши основные навыки и профессиональный опыт?",
    goals: "Какая область или профессия вас интересует во Франции?",
    frenchLevel: "Оцените свой уровень французского от 1 до 5. 1 означает начинающий, 5 означает свободный.",
  },
  recording: "Запись...",
  tapToStop: "Нажмите для остановки",
  tapToRecord: "Нажмите на микрофон для ответа",
  addMore: "Нажмите для добавления",
  transcribing: "Транскрипция...",
  loadingAudio: "Загрузка аудио...",
  playing: "Воспроизведение...",
  switchToText: "Переключить на текст",
  switchToVoice: "Переключить на голос",
  writeAnswer: "Напишите ваш ответ",
  yourAnswer: "Ваш ответ",
  correct: "Исправить",
  cancel: "Отмена",
  save: "Сохранить",
  skip: "Пропустить",
  next: "Далее",
  finish: "Завершить",
  profileCreated: "Профиль успешно создан!",
  profileCreatedSubtitle: "Мы подготовили персонализированный путь для вас",
  discoverPath: "Открыть мой путь",
  micPermissionDenied: "Доступ к микрофону запрещён",
  micPermissionInstructions: "Для голосового ввода разрешите доступ к микрофону",
  noMicrophone: "Микрофон не обнаружен",
  browserNotSupported: "Браузер не поддерживается",
  technicalError: "Техническая ошибка",
  useTextInput: "Вы также можете использовать текстовый ввод",
};

// Conversation UI translations
export const CONVERSATION_UI: Record<LanguageCode, {
  welcomeTitle: string;
  welcomeDescription: string;
  startButton: string;
  statusConnecting: string;
  statusSpeaking: string;
  statusListening: string;
  statusIdle: string;
  progressLabel: string;
  conversationStarting: string;
  speakingLabel: string;
  listeningLabel: string;
  typePlaceholder: string;
  endButton: string;
  typeButton: string;
  backToMic: string;
}> = {
  fr: { welcomeTitle: "Discutons ensemble", welcomeDescription: "Marianne va vous guider à travers quelques questions pour mieux comprendre votre situation.", startButton: "Commencer", statusConnecting: "Connexion en cours...", statusSpeaking: "Marianne parle", statusListening: "Je vous écoute", statusIdle: "Prête à discuter", progressLabel: "Progression", conversationStarting: "La conversation va commencer...", speakingLabel: "Marianne parle...", listeningLabel: "Parlez, je vous écoute", typePlaceholder: "Tapez votre réponse...", endButton: "Terminer", typeButton: "Écrire", backToMic: "Retour au micro" },
  en: { welcomeTitle: "Let's talk together", welcomeDescription: "Marianne will guide you through a few questions to better understand your situation.", startButton: "Start", statusConnecting: "Connecting...", statusSpeaking: "Marianne is speaking", statusListening: "Listening to you", statusIdle: "Ready to chat", progressLabel: "Progress", conversationStarting: "The conversation will start soon...", speakingLabel: "Marianne is speaking...", listeningLabel: "Speak, I'm listening", typePlaceholder: "Type your answer...", endButton: "End", typeButton: "Type", backToMic: "Back to mic" },
  ar: { welcomeTitle: "دعنا نتحدث معًا", welcomeDescription: "ستساعدك ماريان من خلال بعض الأسئلة لفهم وضعك بشكل أفضل.", startButton: "ابدأ", statusConnecting: "جاري الاتصال...", statusSpeaking: "ماريان تتحدث", statusListening: "أنا أستمع إليك", statusIdle: "مستعدة للدردشة", progressLabel: "التقدم", conversationStarting: "المحادثة ستبدأ قريبًا...", speakingLabel: "ماريان تتحدث...", listeningLabel: "تحدث، أنا أستمع", typePlaceholder: "اكتب إجابتك...", endButton: "إنهاء", typeButton: "اكتب", backToMic: "العودة للميكروفون" },
  es: { welcomeTitle: "Hablemos juntos", welcomeDescription: "Marianne te guiará con algunas preguntas para entender mejor tu situación.", startButton: "Empezar", statusConnecting: "Conectando...", statusSpeaking: "Marianne habla", statusListening: "Te escucho", statusIdle: "Lista para charlar", progressLabel: "Progreso", conversationStarting: "La conversación comenzará pronto...", speakingLabel: "Marianne habla...", listeningLabel: "Habla, te escucho", typePlaceholder: "Escribe tu respuesta...", endButton: "Terminar", typeButton: "Escribir", backToMic: "Volver al micro" },
  pt: { welcomeTitle: "Vamos conversar", welcomeDescription: "Marianne vai guiá-lo com algumas perguntas para entender melhor sua situação.", startButton: "Começar", statusConnecting: "Conectando...", statusSpeaking: "Marianne está falando", statusListening: "Estou ouvindo", statusIdle: "Pronta para conversar", progressLabel: "Progresso", conversationStarting: "A conversa vai começar em breve...", speakingLabel: "Marianne está falando...", listeningLabel: "Fale, estou ouvindo", typePlaceholder: "Digite sua resposta...", endButton: "Encerrar", typeButton: "Digitar", backToMic: "Voltar ao micro" },
  ru: { welcomeTitle: "Давайте поговорим", welcomeDescription: "Марианна проведёт вас через несколько вопросов, чтобы лучше понять вашу ситуацию.", startButton: "Начать", statusConnecting: "Подключение...", statusSpeaking: "Марианна говорит", statusListening: "Я вас слушаю", statusIdle: "Готова к разговору", progressLabel: "Прогресс", conversationStarting: "Разговор скоро начнётся...", speakingLabel: "Марианна говорит...", listeningLabel: "Говорите, я слушаю", typePlaceholder: "Введите ваш ответ...", endButton: "Завершить", typeButton: "Печатать", backToMic: "Назад к микрофону" },
};

export const TRANSLATIONS: Record<LanguageCode, {
  welcome: string;
  subtitle: string;
  startJourney: string;
  learnFrench: string;
  findTraining: string;
  getOriented: string;
  features: {
    language: { title: string; description: string };
    career: { title: string; description: string };
    training: { title: string; description: string };
    community: { title: string; description: string };
  };
  howItWorks: {
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  featuresSection: {
    title: string;
    subtitle: string;
    marianne: { title: string; description: string; cta: string };
    fle: { title: string; description: string; cta: string };
    local: { title: string; description: string; cta: string };
  };
  cta: {
    title: string;
    subtitle: string;
    badge: string;
    availableIn: string;
  };
  hero: {
    availableBadge: string;
    title: string;
    description: string;
    descriptionStrong: string;
    cta: string;
    reassurance: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
  };
  onboarding: typeof ONBOARDING_FR;
}> = {
  fr: {
    welcome: "ToFrance — Votre boussole pour avancer en France",
    subtitle: "Trouvez une direction claire, des rendez-vous utiles près de chez vous et les bonnes étapes selon votre situation et vos objectifs.",
    startJourney: "Lancer mon diagnostic",
    learnFrench: "Apprendre le français",
    findTraining: "Trouver une formation",
    getOriented: "M'orienter",
    features: {
      language: { title: "Cours de Français", description: "Des cours adaptés à votre niveau, du débutant au confirmé" },
      career: { title: "Orientation Personnalisée", description: "Un parcours sur-mesure basé sur votre profil" },
      training: { title: "Formations Locales", description: "Des organismes partenaires près de chez vous" },
      community: { title: "Accompagnement", description: "Un suivi pour réussir votre intégration" },
    },
    howItWorks: {
      title: "Comment ça marche ?",
      subtitle: "Un parcours simple en 3 étapes pour avancer sereinement en France",
      step1Title: "Diagnostic rapide",
      step1Desc: "Quelques minutes de conversation dans votre langue. On comprend votre situation et vos objectifs.",
      step2Title: "Orientations concrètes",
      step2Desc: "Vous recevez des recommandations datées et localisées : rendez-vous, formations, démarches près de chez vous.",
      step3Title: "Accompagnement humain",
      step3Desc: "Un conseiller vous rappelle dans votre langue pour vous guider pas à pas dans vos démarches.",
    },
    featuresSection: {
      title: "Tout ce qu'il vous faut pour avancer en France",
      subtitle: "Trois piliers pour trouver votre direction et avancer sereinement",
      marianne: { title: "Marianne, votre conseillère IA", description: "Onboarding vocal en 6 langues. En 5 minutes, Marianne comprend votre situation et vous donne une direction claire.", cta: "Discuter avec Marianne" },
      fle: { title: "Apprenez le français (FLE)", description: "Modules interactifs du niveau Alpha à B1. Apprentissage oral-first adapté à votre secteur professionnel.", cta: "Commencer les cours" },
      local: { title: "Rendez-vous près de chez vous", description: "Mise en relation avec des organismes de formation et associations partenaires près de chez vous.", cta: "Voir les partenaires" },
    },
    cta: {
      title: "Prêt à avancer en France ?",
      subtitle: "Lancez votre diagnostic gratuit et recevez des orientations concrètes, datées et localisées dans votre langue.",
      badge: "Gratuit · Sans inscription · 5 minutes",
      availableIn: "Disponible en",
    },
    hero: {
      availableBadge: "Disponible en français, العربية, English, español, português, русский",
      title: "ToFrance est votre boussole pour avancer en France",
      description: "Nous vous aidons à trouver une direction claire, des rendez-vous utiles près de chez vous et les bonnes étapes selon votre situation et vos objectifs. Après votre diagnostic, un conseiller vous rappelle",
      descriptionStrong: "dans votre langue",
      cta: "Lancer mon diagnostic",
      reassurance: "Après votre diagnostic, vous recevez des orientations concrètes, datées et localisées, avec un accompagnement humain dans votre langue.",
      card1Title: "Direction claire",
      card1Desc: "Des étapes adaptées à votre situation et vos objectifs.",
      card2Title: "Rendez-vous près de chez vous",
      card2Desc: "Orientations concrètes et localisées.",
      card3Title: "Accompagnement humain",
      card3Desc: "Un conseiller vous rappelle dans votre langue.",
    },
    onboarding: ONBOARDING_FR,
  },
  en: {
    welcome: "Find your path",
    subtitle: "Chat with Marianne, your AI advisor. She assesses your profile and suggests training programs near you.",
    startJourney: "Chat with Marianne",
    learnFrench: "Learn French",
    findTraining: "Find training",
    getOriented: "Get oriented",
    features: {
      language: { title: "French Courses", description: "Courses adapted to your level, from beginner to advanced" },
      career: { title: "Personalized Guidance", description: "A tailored path based on your profile" },
      training: { title: "Local Training", description: "Partner organizations near you" },
      community: { title: "Support", description: "Follow-up to help you succeed" },
    },
    howItWorks: {
      title: "How does it work?",
      subtitle: "A simple 3-step process, completely free",
      step1Title: "Talk to Marianne",
      step1Desc: "5 minutes of voice conversation in your language. Marianne assesses your profile and needs.",
      step2Title: "Receive your guidance",
      step2Desc: "Personalized path: French courses, professional training, or employment support.",
      step3Title: "Start your journey",
      step3Desc: "Access FLE modules or get connected with a local partner organization near you.",
    },
    featuresSection: {
      title: "Everything you need to succeed",
      subtitle: "Three pillars for your integration in France",
      marianne: { title: "Marianne, your AI advisor", description: "Vocal onboarding in 6 languages. Marianne assesses your situation and guides you in 5 minutes.", cta: "Chat with Marianne" },
      fle: { title: "Learn French (FLE)", description: "Interactive modules from Alpha to B1 level. Oral-first learning adapted to your professional sector.", cta: "Start learning" },
      local: { title: "Training near you", description: "Direct connection with training organizations and partner associations in your city.", cta: "View partners" },
    },
    cta: {
      title: "Ready to start?",
      subtitle: "Chat with Marianne and receive your personalized guidance in 5 minutes.",
      badge: "Free · No sign-up · 5 minutes",
      availableIn: "Available in",
    },
    hero: {
      availableBadge: "Available in français, العربية, English, español, português, русский",
      title: "Don't know where to start in France?",
      description: "ToFrance helps you understand your need, in your language. Then an advisor calls you back",
      descriptionStrong: "within 48h",
      cta: "Start my orientation",
      reassurance: "You are not alone. After your diagnosis, a person calls you back to support you.",
      card1Title: "5-minute diagnosis",
      card1Desc: "A few simple questions, in your language.",
      card2Title: "Human callback within 48h",
      card2Desc: "An advisor speaking your language calls you back.",
      card3Title: "Free and confidential",
      card3Desc: "Your information stays protected.",
    },
    onboarding: ONBOARDING_EN,
  },
  ar: {
    welcome: "اعثر على مسارك",
    subtitle: "تحدث مع ماريان، مستشارتك بالذكاء الاصطناعي. ستقيّم ملفك الشخصي وتقترح عليك تدريبات مناسبة بالقرب منك.",
    startJourney: "تحدث مع ماريان",
    learnFrench: "تعلم الفرنسية",
    findTraining: "البحث عن تدريب",
    getOriented: "التوجيه",
    features: {
      language: { title: "دورات الفرنسية", description: "دورات مكيفة لمستواك، من المبتدئ إلى المتقدم" },
      career: { title: "توجيه مخصص", description: "مسار مخصص بناءً على ملفك الشخصي" },
      training: { title: "تدريبات محلية", description: "منظمات شريكة بالقرب منك" },
      community: { title: "المرافقة", description: "متابعة لنجاح اندماجك" },
    },
    howItWorks: {
      title: "كيف يعمل؟",
      subtitle: "مسار بسيط في 3 خطوات، مجاني بالكامل",
      step1Title: "تحدث مع ماريان",
      step1Desc: "5 دقائق من المحادثة الصوتية بلغتك. تقيّم ماريان ملفك واحتياجاتك.",
      step2Title: "احصل على توجيهك",
      step2Desc: "مسار مخصص: دروس فرنسية، تدريب مهني أو مساعدة في التوظيف.",
      step3Title: "ابدأ مسارك",
      step3Desc: "الوصول إلى وحدات FLE أو التواصل مع منظمة شريكة بالقرب منك.",
    },
    featuresSection: {
      title: "كل ما تحتاجه للنجاح",
      subtitle: "ثلاث ركائز لاندماجك في فرنسا",
      marianne: { title: "ماريان، مستشارتك بالذكاء الاصطناعي", description: "تسجيل صوتي بـ 6 لغات. تقيّم ماريان وضعك وتوجهك في 5 دقائق.", cta: "تحدث مع ماريان" },
      fle: { title: "تعلّم الفرنسية (FLE)", description: "وحدات تفاعلية من المستوى Alpha إلى B1. تعلّم شفهي يتكيف مع قطاعك المهني.", cta: "ابدأ الدروس" },
      local: { title: "تدريبات بالقرب منك", description: "ربط مباشر مع منظمات التدريب والجمعيات الشريكة في مدينتك.", cta: "عرض الشركاء" },
    },
    cta: {
      title: "مستعد للبدء؟",
      subtitle: "تحدث مع ماريان واحصل على توجيهك الشخصي في 5 دقائق.",
      badge: "مجاني · بدون تسجيل · 5 دقائق",
      availableIn: "متوفر بـ",
    },
    hero: {
      availableBadge: "متوفر بالعربية، الفرنسية، الإنجليزية، الإسبانية، البرتغالية، الروسية",
      title: "لا تعرف من أين تبدأ في فرنسا؟",
      description: "تساعدك ToFrance على فهم احتياجك بلغتك. ثم يتصل بك مستشار",
      descriptionStrong: "خلال 48 ساعة",
      cta: "ابدأ التوجيه الخاص بي",
      reassurance: "أنت لست وحدك. بعد التشخيص، يتصل بك شخص لمرافقتك.",
      card1Title: "تشخيص في 5 دقائق",
      card1Desc: "بعض الأسئلة البسيطة بلغتك.",
      card2Title: "اتصال بشري خلال 48 ساعة",
      card2Desc: "مستشار يتحدث لغتك يتصل بك.",
      card3Title: "مجاني وسري",
      card3Desc: "تبقى معلوماتك محمية.",
    },
    onboarding: ONBOARDING_AR,
  },
  es: {
    welcome: "Encuentra tu camino",
    subtitle: "Habla con Marianne, tu asesora IA. Evalúa tu perfil y te propone formaciones adaptadas cerca de ti.",
    startJourney: "Hablar con Marianne",
    learnFrench: "Aprender francés",
    findTraining: "Encontrar formación",
    getOriented: "Orientarme",
    features: {
      language: { title: "Cursos de Francés", description: "Cursos adaptados a tu nivel" },
      career: { title: "Orientación Personalizada", description: "Un camino a medida basado en tu perfil" },
      training: { title: "Formaciones Locales", description: "Organismos asociados cerca de ti" },
      community: { title: "Acompañamiento", description: "Seguimiento para tu integración" },
    },
    howItWorks: {
      title: "¿Cómo funciona?",
      subtitle: "Un proceso simple en 3 pasos, totalmente gratuito",
      step1Title: "Habla con Marianne",
      step1Desc: "5 minutos de conversación vocal en tu idioma. Marianne evalúa tu perfil y necesidades.",
      step2Title: "Recibe tu orientación",
      step2Desc: "Recorrido personalizado: cursos de francés, formación profesional o ayuda al empleo.",
      step3Title: "Comienza tu camino",
      step3Desc: "Accede a los módulos FLE o conecta con un organismo asociado cerca de ti.",
    },
    featuresSection: {
      title: "Todo lo que necesitas para triunfar",
      subtitle: "Tres pilares para tu integración en Francia",
      marianne: { title: "Marianne, tu asesora IA", description: "Onboarding vocal en 6 idiomas. Marianne evalúa tu situación y te orienta en 5 minutos.", cta: "Hablar con Marianne" },
      fle: { title: "Aprende francés (FLE)", description: "Módulos interactivos del nivel Alpha a B1. Aprendizaje oral adaptado a tu sector profesional.", cta: "Empezar los cursos" },
      local: { title: "Formaciones cerca de ti", description: "Conexión directa con organismos de formación y asociaciones en tu ciudad.", cta: "Ver los socios" },
    },
    cta: {
      title: "¿Listo para empezar?",
      subtitle: "Habla con Marianne y recibe tu orientación personalizada en 5 minutos.",
      badge: "Gratis · Sin registro · 5 minutos",
      availableIn: "Disponible en",
    },
    hero: {
      availableBadge: "Disponible en español, français, العربية, English, português, русский",
      title: "¿No sabes por dónde empezar en Francia?",
      description: "ToFrance te ayuda a entender tu necesidad, en tu idioma. Luego un asesor te llama",
      descriptionStrong: "en menos de 48h",
      cta: "Comenzar mi orientación",
      reassurance: "No estás solo/a. Tras tu diagnóstico, una persona te llama para acompañarte.",
      card1Title: "Diagnóstico de 5 minutos",
      card1Desc: "Algunas preguntas simples, en tu idioma.",
      card2Title: "Llamada humana en 48h",
      card2Desc: "Un asesor que habla tu idioma te llama.",
      card3Title: "Gratis y confidencial",
      card3Desc: "Tu información permanece protegida.",
    },
    onboarding: ONBOARDING_ES,
  },
  pt: {
    welcome: "Encontre seu caminho",
    subtitle: "Converse com Marianne, sua conselheira IA. Ela avalia seu perfil e sugere formações adaptadas perto de você.",
    startJourney: "Falar com Marianne",
    learnFrench: "Aprender francês",
    findTraining: "Encontrar formação",
    getOriented: "Me orientar",
    features: {
      language: { title: "Cursos de Francês", description: "Cursos adaptados ao seu nível, do iniciante ao avançado" },
      career: { title: "Orientação Personalizada", description: "Um percurso sob medida baseado no seu perfil" },
      training: { title: "Formações Locais", description: "Organizações parceiras perto de você" },
      community: { title: "Acompanhamento", description: "Apoio para o sucesso da sua integração" },
    },
    howItWorks: {
      title: "Como funciona?",
      subtitle: "Um processo simples em 3 etapas, totalmente gratuito",
      step1Title: "Fale com Marianne",
      step1Desc: "5 minutos de conversa vocal no seu idioma. Marianne avalia seu perfil e necessidades.",
      step2Title: "Receba sua orientação",
      step2Desc: "Percurso personalizado: aulas de francês, formação profissional ou apoio ao emprego.",
      step3Title: "Comece seu percurso",
      step3Desc: "Acesse os módulos FLE ou conecte-se com uma organização parceira perto de você.",
    },
    featuresSection: {
      title: "Tudo o que você precisa para ter sucesso",
      subtitle: "Três pilares para sua integração na França",
      marianne: { title: "Marianne, sua conselheira IA", description: "Onboarding vocal em 6 idiomas. Marianne avalia sua situação e orienta você em 5 minutos.", cta: "Falar com Marianne" },
      fle: { title: "Aprenda francês (FLE)", description: "Módulos interativos do nível Alpha ao B1. Aprendizado oral adaptado ao seu setor profissional.", cta: "Começar as aulas" },
      local: { title: "Formações perto de você", description: "Conexão direta com organizações de formação e associações parceiras na sua cidade.", cta: "Ver parceiros" },
    },
    cta: {
      title: "Pronto para começar?",
      subtitle: "Converse com Marianne e receba sua orientação personalizada em 5 minutos.",
      badge: "Gratuito · Sem cadastro · 5 minutos",
      availableIn: "Disponível em",
    },
    hero: {
      availableBadge: "Disponível em português, français, العربية, English, español, русский",
      title: "Não sabe por onde começar na França?",
      description: "ToFrance ajuda você a entender sua necessidade, no seu idioma. Depois um conselheiro liga de volta",
      descriptionStrong: "em até 48h",
      cta: "Começar minha orientação",
      reassurance: "Você não está sozinho(a). Após o diagnóstico, uma pessoa liga para te acompanhar.",
      card1Title: "Diagnóstico em 5 minutos",
      card1Desc: "Algumas perguntas simples, no seu idioma.",
      card2Title: "Retorno humano em 48h",
      card2Desc: "Um conselheiro que fala seu idioma liga de volta.",
      card3Title: "Gratuito e confidencial",
      card3Desc: "Suas informações permanecem protegidas.",
    },
    onboarding: ONBOARDING_PT,
  },
  ru: {
    welcome: "Найдите свой путь",
    subtitle: "Поговорите с Марианной, вашим ИИ-консультантом. Она оценит ваш профиль и предложит подходящее обучение рядом с вами.",
    startJourney: "Поговорить с Марианной",
    learnFrench: "Изучить французский",
    findTraining: "Найти обучение",
    getOriented: "Получить ориентацию",
    features: {
      language: { title: "Курсы французского", description: "Курсы, адаптированные к вашему уровню" },
      career: { title: "Персональное руководство", description: "Путь, подобранный под ваш профиль" },
      training: { title: "Местное обучение", description: "Организации-партнёры рядом с вами" },
      community: { title: "Сопровождение", description: "Поддержка вашей интеграции" },
    },
    howItWorks: {
      title: "Как это работает?",
      subtitle: "Простой процесс в 3 шага, полностью бесплатный",
      step1Title: "Поговорите с Марианной",
      step1Desc: "5 минут голосового разговора на вашем языке. Марианна оценит ваш профиль и потребности.",
      step2Title: "Получите ориентацию",
      step2Desc: "Индивидуальный маршрут: курсы французского, профессиональное обучение или помощь в трудоустройстве.",
      step3Title: "Начните свой путь",
      step3Desc: "Получите доступ к модулям FLE или свяжитесь с партнёрской организацией рядом с вами.",
    },
    featuresSection: {
      title: "Всё, что нужно для успеха",
      subtitle: "Три столпа для вашей интеграции во Франции",
      marianne: { title: "Марианна, ваш ИИ-консультант", description: "Голосовой онбординг на 6 языках. Марианна оценит вашу ситуацию и направит за 5 минут.", cta: "Поговорить с Марианной" },
      fle: { title: "Учите французский (FLE)", description: "Интерактивные модули от уровня Alpha до B1. Устное обучение, адаптированное к вашему сектору.", cta: "Начать обучение" },
      local: { title: "Обучение рядом с вами", description: "Прямая связь с учебными организациями и ассоциациями-партнёрами в вашем городе.", cta: "Смотреть партнёров" },
    },
    cta: {
      title: "Готовы начать?",
      subtitle: "Поговорите с Марианной и получите персональную ориентацию за 5 минут.",
      badge: "Бесплатно · Без регистрации · 5 минут",
      availableIn: "Доступно на",
    },
    hero: {
      availableBadge: "Доступно на русском, français, العربية, English, español, português",
      title: "Не знаете, с чего начать во Франции?",
      description: "ToFrance помогает понять вашу потребность на вашем языке. Затем консультант перезвонит вам",
      descriptionStrong: "в течение 48 часов",
      cta: "Начать мою ориентацию",
      reassurance: "Вы не одни. После диагностики человек перезвонит, чтобы сопровождать вас.",
      card1Title: "Диагностика за 5 минут",
      card1Desc: "Несколько простых вопросов на вашем языке.",
      card2Title: "Звонок в течение 48 часов",
      card2Desc: "Консультант, говорящий на вашем языке, перезвонит.",
      card3Title: "Бесплатно и конфиденциально",
      card3Desc: "Ваши данные остаются защищёнными.",
    },
    onboarding: ONBOARDING_RU,
  },
};
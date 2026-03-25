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
  selectLanguage: "ما هي لغتك؟",
  selectLanguageSubtitle: "اختر اللغة التي تريد أن يتم إرشادك بها",
  questions: {
    name: "ما اسمك ومن أين أنت؟",
    profession: "ما كانت مهنتك في بلدك الأصلي؟",
    skills: "ما هي مهاراتك وخبراتك المهنية الرئيسية؟",
    goals: "ما المجال أو المهنة التي تهمك في فرنسا؟",
    frenchLevel: "قيّم مستواك في الفرنسية من 1 إلى 5. 1 يعني مبتدئ، 5 يعني طلاقة.",
  },
  recording: "جاري التسجيل...",
  tapToStop: "اضغط للتوقف",
  tapToRecord: "اضغط على الميكروفون للإجابة",
  addMore: "اضغط لإضافة المزيد",
  transcribing: "جاري النسخ...",
  loadingAudio: "جاري تحميل الصوت...",
  playing: "جاري التشغيل...",
  switchToText: "التبديل إلى الكتابة",
  switchToVoice: "التبديل إلى الصوت",
  writeAnswer: "اكتب إجابتك",
  yourAnswer: "إجابتك",
  correct: "تصحيح",
  cancel: "إلغاء",
  save: "حفظ",
  skip: "تخطي",
  next: "التالي",
  finish: "إنهاء",
  profileCreated: "تم إنشاء الملف الشخصي بنجاح!",
  profileCreatedSubtitle: "لقد أعددنا مسارًا مخصصًا لك",
  discoverPath: "اكتشف مساري",
  micPermissionDenied: "تم رفض الوصول إلى الميكروفون",
  micPermissionInstructions: "للاستخدام الصوتي، يرجى السماح بالوصول إلى الميكروفون",
  noMicrophone: "لم يتم اكتشاف ميكروفون",
  browserNotSupported: "المتصفح غير مدعوم",
  technicalError: "خطأ تقني",
  useTextInput: "يمكنك أيضًا استخدام الكتابة",
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
  onboarding: typeof ONBOARDING_FR;
}> = {
  fr: {
    welcome: "Trouvez votre parcours",
    subtitle: "Discutez avec Marianne, votre conseillère IA. Elle évalue votre profil et vous propose des formations adaptées près de chez vous.",
    startJourney: "Discuter avec Marianne",
    learnFrench: "Apprendre le français",
    findTraining: "Trouver une formation",
    getOriented: "M'orienter",
    features: {
      language: { title: "Cours de Français", description: "Des cours adaptés à votre niveau, du débutant au confirmé" },
      career: { title: "Orientation Personnalisée", description: "Un parcours sur-mesure basé sur votre profil" },
      training: { title: "Formations Locales", description: "Des organismes partenaires près de chez vous" },
      community: { title: "Accompagnement", description: "Un suivi pour réussir votre intégration" },
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
    onboarding: ONBOARDING_RU,
  },
};
// Decision tree for onboarding - structured questions with predefined choices
// Refactored for 3-route orientation (FLE, OF Métiers, Employeurs)

export type QuestionType = "choice" | "multiChoice" | "scale" | "text" | "email";

export interface Choice {
  id: string;
  label: Record<string, string>; // Translations
  icon?: string;
  nextQuestion?: string; // Branch to specific question based on choice
  tags?: string[]; // Tags for matching (e.g., sectors, skills)
}

export interface Question {
  id: string;
  type: QuestionType;
  question: Record<string, string>; // Translations
  subtitle?: Record<string, string>;
  choices?: Choice[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: Record<string, { min: string; max: string }>;
  required?: boolean;
  nextQuestion?: string; // Default next question
}

export interface DecisionTree {
  startQuestion: string;
  questions: Record<string, Question>;
}

// Lead route types
export type LeadRoute = "route_a" | "route_b" | "route_c" | "sas";

// Lead score breakdown
export interface LeadScoreBreakdown {
  completude: number;
  fit: number;
  reactivite: number;
  total: number;
}

// The structured decision tree - NEW FLOW with consent first
export const ONBOARDING_TREE: DecisionTree = {
  startQuestion: "location",
  questions: {
    // ============================================
    // ÉTAPE 1: TRIAGE RAPIDE (30-60 sec)
    // ============================================

    // Q1: Location (CP + ville)
    location: {
      id: "location",
      type: "text",
      question: {
        fr: "Où habitez-vous ?",
        en: "Where do you live?",
        ar: "أين تسكن؟",
        es: "¿Dónde vives?",
        pt: "Onde você mora?",
        it: "Dove abiti?",
        de: "Wo wohnen Sie?",
        tr: "Nerede yaşıyorsunuz?",
        pl: "Gdzie mieszkasz?",
        vi: "Bạn sống ở đâu?",
        zh: "你住在哪里？",
        ru: "Где вы живёте?",
        uk: "Де ви живете?",
        fa: "کجا زندگی می‌کنید؟",
        bn: "আপনি কোথায় থাকেন?",
        ur: "آپ کہاں رہتے ہیں؟",
      },
      subtitle: {
        fr: "Code postal ou ville (ex: 75001 Paris)",
        en: "Postal code or city (e.g., 75001 Paris)",
        ar: "الرمز البريدي أو المدينة",
        es: "Código postal o ciudad",
        pt: "Código postal ou cidade",
        it: "Codice postale o città",
        de: "Postleitzahl oder Stadt",
        tr: "Posta kodu veya şehir",
        pl: "Kod pocztowy lub miasto",
        vi: "Mã bưu điện hoặc thành phố",
        zh: "邮政编码或城市",
        ru: "Почтовый индекс или город",
        uk: "Поштовий індекс або місто",
        fa: "کد پستی یا شهر",
        bn: "পোস্টাল কোড বা শহর",
        ur: "پوسٹل کوڈ یا شہر",
      },
      required: true,
      nextQuestion: "origin_country",
    },

    // Q1b: Pays d'origine
    origin_country: {
      id: "origin_country",
      type: "text",
      question: {
        fr: "De quel pays venez-vous ?",
        en: "What country are you from?",
        ar: "من أي بلد أنت؟",
        es: "¿De qué país vienes?",
        pt: "De que país você vem?",
        ru: "Из какой вы страны?",
      },
      subtitle: {
        fr: "Pour mieux adapter nos services",
        en: "To better adapt our services",
        ar: "لتكييف خدماتنا بشكل أفضل",
        es: "Para adaptar mejor nuestros servicios",
        pt: "Para melhor adaptar nossos serviços",
        ru: "Чтобы лучше адаптировать наши услуги",
      },
      required: false,
      nextQuestion: "main_goal",
    },

    // Q2: Objectif principal
    main_goal: {
      id: "main_goal",
      type: "multiChoice",
      question: {
        fr: "Quels sont vos objectifs ? (plusieurs choix possibles)",
        en: "What are your goals? (multiple choices allowed)",
        ar: "ما هي أهدافك؟ (يمكنك اختيار عدة إجابات)",
        es: "¿Cuáles son tus objetivos? (varias opciones posibles)",
        pt: "Quais são seus objetivos? (várias opções possíveis)",
        it: "Quali sono i tuoi obiettivi? (scelte multiple possibili)",
        de: "Was sind Ihre Ziele? (Mehrfachauswahl möglich)",
        tr: "Hedefleriniz nelerdir? (birden fazla seçim yapılabilir)",
        pl: "Jakie są Twoje cele? (możliwość wyboru kilku)",
        vi: "Mục tiêu của bạn là gì? (có thể chọn nhiều)",
        zh: "你的目标是什么？（可多选）",
        ru: "Каковы ваши цели? (можно выбрать несколько)",
        uk: "Які ваші цілі? (можна обрати кілька)",
        fa: "اهداف شما چیست؟ (چند گزینه ممکن)",
        bn: "আপনার লক্ষ্য কি? (একাধিক পছন্দ সম্ভব)",
        ur: "آپ کے مقاصد کیا ہیں؟ (متعدد انتخاب ممکن)",
      },
      choices: [
        {
          id: "learn_french",
          label: {
            fr: "Apprendre / améliorer mon français",
            en: "Learn / improve my French",
            ar: "تعلم / تحسين لغتي الفرنسية",
            es: "Aprender / mejorar mi francés",
            pt: "Aprender / melhorar meu francês",
            it: "Imparare / migliorare il mio francese",
            de: "Französisch lernen / verbessern",
            tr: "Fransızcamı öğrenmek / geliştirmek",
            pl: "Nauczyć się / poprawić francuski",
            vi: "Học / cải thiện tiếng Pháp",
            zh: "学习/提高我的法语",
            ru: "Изучать / улучшать французский",
            uk: "Вивчати / покращувати французьку",
            fa: "یادگیری / بهبود فرانسه‌ام",
            bn: "ফরাসি শিখুন / উন্নত করুন",
            ur: "فرانسیسی سیکھنا / بہتر کرنا",
          },
          icon: "📖",
          tags: ["route_a", "fle_priority"],
        },
        {
          id: "find_job",
          label: {
            fr: "Trouver un emploi rapidement",
            en: "Find a job quickly",
            ar: "إيجاد عمل بسرعة",
            es: "Encontrar trabajo rápidamente",
            pt: "Encontrar emprego rapidamente",
            it: "Trovare lavoro rapidamente",
            de: "Schnell einen Job finden",
            tr: "Hızlıca iş bulmak",
            pl: "Szybko znaleźć pracę",
            vi: "Tìm việc nhanh chóng",
            zh: "快速找到工作",
            ru: "Быстро найти работу",
            uk: "Швидко знайти роботу",
            fa: "سریع کار پیدا کنید",
            bn: "দ্রুত চাকরি খুঁজুন",
            ur: "جلدی نوکری تلاش کریں",
          },
          icon: "💼",
          tags: ["route_c", "job_priority"],
        },
        {
          id: "job_training",
          label: {
            fr: "Faire une formation pour un métier",
            en: "Get vocational training",
            ar: "الحصول على تدريب مهني",
            es: "Hacer una formación profesional",
            pt: "Fazer uma formação profissional",
            it: "Fare una formazione professionale",
            de: "Eine Berufsausbildung machen",
            tr: "Mesleki eğitim almak",
            pl: "Odbyć szkolenie zawodowe",
            vi: "Đào tạo nghề",
            zh: "接受职业培训",
            ru: "Пройти профессиональное обучение",
            uk: "Пройти професійне навчання",
            fa: "آموزش حرفه‌ای",
            bn: "পেশাদার প্রশিক্ষণ নিন",
            ur: "پیشہ ورانہ تربیت حاصل کریں",
          },
          icon: "🎓",
          tags: ["route_b", "training_priority"],
        },
        {
          id: "validate_diploma",
          label: {
            fr: "Faire reconnaître mon diplôme ou mon expérience",
            en: "Get my diploma or experience recognized",
            ar: "الحصول على اعتراف بشهادتي أو خبرتي",
            es: "Hacer reconocer mi diploma o experiencia",
            pt: "Fazer reconhecer meu diploma ou experiência",
            ru: "Подтвердить мой диплом или опыт",
          },
          icon: "📜",
          tags: ["route_b", "diploma_validation"],
        },
        {
          id: "start_business",
          label: {
            fr: "Créer mon entreprise / devenir indépendant",
            en: "Start my own business / become self-employed",
            ar: "إنشاء عملي الخاص / العمل لحسابي",
            es: "Crear mi empresa / ser independiente",
            pt: "Criar meu negócio / ser autônomo",
            ru: "Создать бизнес / стать самозанятым",
          },
          icon: "🚀",
          tags: ["route_c", "entrepreneurship"],
        },
        {
          id: "french_and_job",
          label: {
            fr: "Apprendre le français ET trouver un emploi",
            en: "Learn French AND find a job",
            ar: "تعلم الفرنسية والعثور على عمل",
            es: "Aprender francés Y encontrar empleo",
            pt: "Aprender francês E encontrar emprego",
            ru: "Учить французский И найти работу",
          },
          icon: "📖💼",
          tags: ["route_a", "route_c", "fle_priority", "job_priority"],
        },
        {
          id: "need_help",
          label: {
            fr: "Je ne sais pas / besoin d'aide",
            en: "I don't know / need help",
            ar: "لا أعرف / أحتاج مساعدة",
            es: "No sé / necesito ayuda",
            pt: "Não sei / preciso de ajuda",
            ru: "Не знаю / нужна помощь",
          },
          icon: "🤝",
          tags: ["sas", "needs_orientation"],
        },
      ],
      nextQuestion: "contact_48h",
    },

    // Q3: Disponibilité contact 48h
    contact_48h: {
      id: "contact_48h",
      type: "choice",
      question: {
        fr: "Êtes-vous disponible pour être contacté sous 48 heures ?",
        en: "Are you available to be contacted within 48 hours?",
        ar: "هل أنت متاح للاتصال خلال 48 ساعة؟",
        es: "¿Estás disponible para ser contactado en 48 horas?",
        pt: "Você está disponível para ser contatado em 48 horas?",
        it: "Sei disponibile per essere contattato entro 48 ore?",
        de: "Können Sie innerhalb von 48 Stunden kontaktiert werden?",
        tr: "48 saat içinde iletişime geçilebilir misiniz?",
        pl: "Czy jesteś dostępny do kontaktu w ciągu 48 godzin?",
        vi: "Bạn có thể liên lạc trong 48 giờ không?",
        zh: "您能在48小时内联系吗？",
        ru: "Вы доступны для связи в течение 48 часов?",
        uk: "Ви доступні для зв'язку протягом 48 годин?",
        fa: "آیا در 48 ساعت قابل تماس هستید؟",
        bn: "আপনি কি 48 ঘন্টার মধ্যে যোগাযোগযোগ্য?",
        ur: "کیا آپ 48 گھنٹے میں رابطہ کے لیے دستیاب ہیں؟",
      },
      subtitle: {
        fr: "Un conseiller vous appellera pour vous aider",
        en: "An advisor will call you to help",
        ar: "سيتصل بك مستشار للمساعدة",
        es: "Un asesor te llamará para ayudarte",
        pt: "Um conselheiro ligará para ajudá-lo",
        it: "Un consulente ti chiamerà per aiutarti",
        de: "Ein Berater wird Sie anrufen, um zu helfen",
        tr: "Bir danışman size yardımcı olmak için arayacak",
        pl: "Doradca zadzwoni, aby pomóc",
        vi: "Một cố vấn sẽ gọi để giúp bạn",
        zh: "顾问会打电话帮助您",
        ru: "Консультант позвонит вам, чтобы помочь",
        uk: "Консультант зателефонує вам, щоб допомогти",
        fa: "یک مشاور با شما تماس خواهد گرفت",
        bn: "একজন পরামর্শদাতা আপনাকে সাহায্য করতে কল করবেন",
        ur: "ایک مشیر آپ کی مدد کے لیے کال کرے گا",
      },
      choices: [
        {
          id: "yes",
          label: {
            fr: "Oui, je suis disponible",
            en: "Yes, I am available",
            ar: "نعم، أنا متاح",
            es: "Sí, estoy disponible",
            pt: "Sim, estou disponível",
            ru: "Да, я доступен",
          },
          icon: "✅",
          tags: ["reactive", "contact_ok"],
        },
        {
          id: "this_week",
          label: {
            fr: "Oui, mais plus tard cette semaine",
            en: "Yes, but later this week",
            ar: "نعم، ولكن لاحقاً هذا الأسبوع",
            es: "Sí, pero más tarde esta semana",
            pt: "Sim, mas mais tarde esta semana",
            ru: "Да, но позже на этой неделе",
          },
          icon: "📅",
          tags: ["reactive", "contact_ok", "delayed"],
        },
        {
          id: "prefer_message",
          label: {
            fr: "Je préfère être contacté par message (SMS/email)",
            en: "I prefer to be contacted by message (SMS/email)",
            ar: "أفضل أن يتم الاتصال بي عبر رسالة",
            es: "Prefiero ser contactado por mensaje (SMS/email)",
            pt: "Prefiro ser contatado por mensagem (SMS/email)",
            ru: "Предпочитаю связь по сообщению (SMS/email)",
          },
          icon: "💬",
          tags: ["contact_ok", "prefer_message"],
        },
        {
          id: "no",
          label: {
            fr: "Non, pas tout de suite",
            en: "No, not right now",
            ar: "لا، ليس الآن",
            es: "No, ahora no",
            pt: "Não, agora não",
            ru: "Нет, не сейчас",
          },
          icon: "⏰",
          tags: ["a_relancer", "nurturing"],
        },
      ],
      nextQuestion: "literacy",
    },

    // ============================================
    // ÉTAPE 2: DIAGNOSTIC LINGUISTIQUE
    // ============================================

    // Q4: Littératie langue maternelle
    literacy: {
      id: "literacy",
      type: "choice",
      question: {
        fr: "Savez-vous lire et écrire dans votre langue ?",
        en: "Can you read and write in your language?",
        ar: "هل تستطيع القراءة والكتابة بلغتك؟",
        es: "¿Sabes leer y escribir en tu idioma?",
        pt: "Você sabe ler e escrever na sua língua?",
        it: "Sai leggere e scrivere nella tua lingua?",
        de: "Können Sie in Ihrer Sprache lesen und schreiben?",
        tr: "Kendi dilinizde okuyup yazabiliyor musunuz?",
        pl: "Czy umiesz czytać i pisać w swoim języku?",
        vi: "Bạn có biết đọc và viết bằng ngôn ngữ của mình không?",
        zh: "你会用自己的语言读写吗？",
        ru: "Вы умеете читать и писать на своём языке?",
        uk: "Ви вмієте читати і писати своєю мовою?",
        fa: "آیا به زبان خود خواندن و نوشتن بلد هستید؟",
        bn: "আপনি কি আপনার ভাষায় পড়তে এবং লিখতে পারেন?",
        ur: "کیا آپ اپنی زبان میں پڑھ اور لکھ سکتے ہیں؟",
      },
      choices: [
        {
          id: "yes",
          label: {
            fr: "Oui, couramment",
            en: "Yes, fluently",
            ar: "نعم، بطلاقة",
            es: "Sí, con fluidez",
            pt: "Sim, fluentemente",
            it: "Sì, correntemente",
            de: "Ja, fließend",
            tr: "Evet, akıcı",
            pl: "Tak, biegle",
            vi: "Có, thành thạo",
            zh: "是的，流利",
            ru: "Да, свободно",
            uk: "Так, вільно",
            fa: "بله، روان",
            bn: "হ্যাঁ, সাবলীলভাবে",
            ur: "ہاں، روانی سے",
          },
          icon: "✅",
          tags: ["literate"],
        },
        {
          id: "partial",
          label: {
            fr: "Un peu",
            en: "A little",
            ar: "قليلاً",
            es: "Un poco",
            pt: "Um pouco",
            it: "Un po'",
            de: "Ein bisschen",
            tr: "Biraz",
            pl: "Trochę",
            vi: "Một chút",
            zh: "一点点",
            ru: "Немного",
            uk: "Трохи",
            fa: "کمی",
            bn: "একটু",
            ur: "تھوڑا",
          },
          icon: "📝",
          tags: ["partial_literate"],
        },
        {
          id: "no",
          label: {
            fr: "Non",
            en: "No",
            ar: "لا",
            es: "No",
            pt: "Não",
            it: "No",
            de: "Nein",
            tr: "Hayır",
            pl: "Nie",
            vi: "Không",
            zh: "不",
            ru: "Нет",
            uk: "Ні",
            fa: "نه",
            bn: "না",
            ur: "نہیں",
          },
          icon: "❌",
          tags: ["non_literate", "alpha_priority"],
        },
      ],
      nextQuestion: "french_level_cecrl",
    },

    // Q5: Niveau français CECRL
    french_level_cecrl: {
      id: "french_level_cecrl",
      type: "choice",
      question: {
        fr: "En français, vous êtes plutôt :",
        en: "In French, you are:",
        ar: "في اللغة الفرنسية، أنت:",
        es: "En francés, eres:",
        pt: "Em francês, você é:",
        it: "In francese, sei:",
        de: "In Französisch sind Sie:",
        tr: "Fransızcada siz:",
        pl: "W języku francuskim jesteś:",
        vi: "Tiếng Pháp của bạn:",
        zh: "你的法语水平是：",
        ru: "По-французски вы:",
        uk: "Французькою ви:",
        fa: "در فرانسه، شما:",
        bn: "ফরাসিতে আপনি:",
        ur: "فرانسیسی میں آپ:",
      },
      subtitle: {
        fr: "Soyez honnête, cela nous aide à vous orienter",
        en: "Be honest, this helps us guide you better",
        ar: "كن صادقًا، هذا يساعدنا على توجيهك",
        es: "Sé honesto, esto nos ayuda a orientarte mejor",
        pt: "Seja honesto, isso nos ajuda a orientá-lo melhor",
        it: "Sii onesto, questo ci aiuta a guidarti meglio",
        de: "Seien Sie ehrlich, das hilft uns, Sie besser zu beraten",
        tr: "Dürüst olun, bu size daha iyi yönlendirmemize yardımcı olur",
        pl: "Bądź szczery, to pomaga nam lepiej cię kierować",
        vi: "Hãy thành thật, điều này giúp chúng tôi hướng dẫn bạn tốt hơn",
        zh: "请诚实回答，这有助于我们更好地指导您",
        ru: "Будьте честны, это поможет нам лучше вас направить",
        uk: "Будьте чесні, це допоможе нам краще вас спрямувати",
        fa: "صادق باشید، این به ما کمک می‌کند بهتر راهنمایی‌تان کنیم",
        bn: "সৎ থাকুন, এটি আমাদের আপনাকে ভালোভাবে গাইড করতে সাহায্য করে",
        ur: "ایماندار رہیں، یہ ہمیں آپ کی بہتر رہنمائی میں مدد کرتا ہے",
      },
      choices: [
        {
          id: "alpha",
          label: {
            fr: "Débutant total / Je ne parle pas français",
            en: "Complete beginner / I don't speak French",
            ar: "مبتدئ تماماً / لا أتحدث الفرنسية",
            es: "Principiante total / No hablo francés",
            pt: "Iniciante total / Não falo francês",
            it: "Principiante assoluto / Non parlo francese",
            de: "Absoluter Anfänger / Ich spreche kein Französisch",
            tr: "Tamamen yeni başlayan / Fransızca konuşamıyorum",
            pl: "Całkowity początkujący / Nie mówię po francusku",
            vi: "Người mới hoàn toàn / Tôi không nói tiếng Pháp",
            zh: "完全初学者 / 我不会说法语",
            ru: "Полный новичок / Я не говорю по-французски",
            uk: "Повний новачок / Я не говорю французькою",
            fa: "مبتدی کامل / فرانسه صحبت نمی‌کنم",
            bn: "সম্পূর্ণ নতুন / আমি ফরাসি বলতে পারি না",
            ur: "مکمل نوآموز / میں فرانسیسی نہیں بولتا",
          },
          icon: "🆕",
          tags: ["alpha", "level_0", "fle_required"],
        },
        {
          id: "a1",
          label: {
            fr: "A1 - Je connais quelques mots et phrases",
            en: "A1 - I know some words and phrases",
            ar: "A1 - أعرف بعض الكلمات والعبارات",
            es: "A1 - Conozco algunas palabras y frases",
            pt: "A1 - Conheço algumas palavras e frases",
            it: "A1 - Conosco alcune parole e frasi",
            de: "A1 - Ich kenne einige Wörter und Sätze",
            tr: "A1 - Bazı kelimeler ve cümleler biliyorum",
            pl: "A1 - Znam kilka słów i zdań",
            vi: "A1 - Tôi biết một số từ và cụm từ",
            zh: "A1 - 我知道一些单词和短语",
            ru: "A1 - Я знаю несколько слов и фраз",
            uk: "A1 - Я знаю кілька слів і фраз",
            fa: "A1 - چند کلمه و عبارت می‌دانم",
            bn: "A1 - আমি কিছু শব্দ এবং বাক্যাংশ জানি",
            ur: "A1 - میں کچھ الفاظ اور جملے جانتا ہوں",
          },
          icon: "📗",
          tags: ["a1", "level_1", "fle_required"],
        },
        {
          id: "a2",
          label: {
            fr: "A2 - Je me débrouille pour les choses simples",
            en: "A2 - I can manage simple things",
            ar: "A2 - أستطيع التعامل مع الأشياء البسيطة",
            es: "A2 - Me las arreglo para cosas simples",
            pt: "A2 - Me viro para coisas simples",
            it: "A2 - Me la cavo per le cose semplici",
            de: "A2 - Ich komme bei einfachen Dingen zurecht",
            tr: "A2 - Basit şeyleri halledebiliyorum",
            pl: "A2 - Radzę sobie z prostymi rzeczami",
            vi: "A2 - Tôi có thể xử lý những việc đơn giản",
            zh: "A2 - 我能处理简单的事情",
            ru: "A2 - Я справляюсь с простыми вещами",
            uk: "A2 - Я справляюся з простими речами",
            fa: "A2 - می‌توانم کارهای ساده را انجام دهم",
            bn: "A2 - আমি সাধারণ জিনিস সামলাতে পারি",
            ur: "A2 - میں سادہ چیزیں سنبھال سکتا ہوں",
          },
          icon: "📘",
          tags: ["a2", "level_2", "job_ready_basic"],
        },
        {
          id: "b1",
          label: {
            fr: "B1+ - Je suis à l'aise en français",
            en: "B1+ - I am comfortable in French",
            ar: "B1+ - أنا مرتاح بالفرنسية",
            es: "B1+ - Me siento cómodo en francés",
            pt: "B1+ - Me sinto confortável em francês",
            it: "B1+ - Mi sento a mio agio in francese",
            de: "B1+ - Ich fühle mich wohl in Französisch",
            tr: "B1+ - Fransızcada rahatım",
            pl: "B1+ - Czuję się komfortowo po francusku",
            vi: "B1+ - Tôi thoải mái với tiếng Pháp",
            zh: "B1+ - 我的法语很流利",
            ru: "B1+ - Я свободно владею французским",
            uk: "B1+ - Я вільно володію французькою",
            fa: "B1+ - با فرانسه راحت هستم",
            bn: "B1+ - আমি ফরাসিতে স্বাচ্ছন্দ্য",
            ur: "B1+ - میں فرانسیسی میں آرام دہ ہوں",
          },
          icon: "📙",
          tags: ["b1", "level_3", "job_ready"],
        },
      ],
      nextQuestion: "work_right",
    },

    // ============================================
    // ÉTAPE 3: DROITS & CONTRAINTES
    // ============================================

    // Q6: Droit au travail
    work_right: {
      id: "work_right",
      type: "choice",
      question: {
        fr: "Avez-vous le droit de travailler en France ?",
        en: "Do you have the right to work in France?",
        ar: "هل لديك الحق في العمل في فرنسا؟",
        es: "¿Tienes derecho a trabajar en Francia?",
        pt: "Você tem direito de trabalhar na França?",
        it: "Hai il diritto di lavorare in Francia?",
        de: "Haben Sie das Recht, in Frankreich zu arbeiten?",
        tr: "Fransa'da çalışma hakkınız var mı?",
        pl: "Czy masz prawo do pracy we Francji?",
        vi: "Bạn có quyền làm việc ở Pháp không?",
        zh: "你有在法国工作的权利吗？",
        ru: "У вас есть право работать во Франции?",
        uk: "Ви маєте право працювати у Франції?",
        fa: "آیا حق کار در فرانسه را دارید؟",
        bn: "আপনার কি ফ্রান্সে কাজ করার অধিকার আছে?",
        ur: "کیا آپ کو فرانس میں کام کرنے کا حق ہے؟",
      },
      subtitle: {
        fr: "Titre de séjour avec autorisation de travail",
        en: "Residence permit with work authorization",
        ar: "تصريح إقامة مع إذن عمل",
        es: "Permiso de residencia con autorización de trabajo",
        pt: "Permissão de residência com autorização de trabalho",
        it: "Permesso di soggiorno con autorizzazione al lavoro",
        de: "Aufenthaltsgenehmigung mit Arbeitserlaubnis",
        tr: "Çalışma izni olan oturma izni",
        pl: "Pozwolenie na pobyt z zezwoleniem na pracę",
        vi: "Giấy phép cư trú có giấy phép làm việc",
        zh: "带有工作许可的居留证",
        ru: "Вид на жительство с разрешением на работу",
        uk: "Дозвіл на проживання з дозволом на роботу",
        fa: "اجازه اقامت با مجوز کار",
        bn: "কাজের অনুমতি সহ বসবাসের অনুমতি",
        ur: "کام کی اجازت کے ساتھ رہائشی اجازت",
      },
      choices: [
        {
          id: "yes",
          label: {
            fr: "Oui",
            en: "Yes",
            ar: "نعم",
            es: "Sí",
            pt: "Sim",
            it: "Sì",
            de: "Ja",
            tr: "Evet",
            pl: "Tak",
            vi: "Có",
            zh: "是",
            ru: "Да",
            uk: "Так",
            fa: "بله",
            bn: "হ্যাঁ",
            ur: "ہاں",
          },
          icon: "✅",
          tags: ["work_permit"],
        },
        {
          id: "no",
          label: {
            fr: "Non",
            en: "No",
            ar: "لا",
            es: "No",
            pt: "Não",
            it: "No",
            de: "Nein",
            tr: "Hayır",
            pl: "Nie",
            vi: "Không",
            zh: "不",
            ru: "Нет",
            uk: "Ні",
            fa: "نه",
            bn: "না",
            ur: "نہیں",
          },
          icon: "❌",
          tags: ["no_work_permit", "needs_admin"],
        },
        {
          id: "unknown",
          label: {
            fr: "Je ne sais pas",
            en: "I don't know",
            ar: "لا أعرف",
            es: "No sé",
            pt: "Não sei",
            it: "Non lo so",
            de: "Ich weiß nicht",
            tr: "Bilmiyorum",
            pl: "Nie wiem",
            vi: "Tôi không biết",
            zh: "我不知道",
            ru: "Не знаю",
            uk: "Не знаю",
            fa: "نمی‌دانم",
            bn: "জানি না",
            ur: "نہیں معلوم",
          },
          icon: "❓",
          tags: ["status_unknown", "needs_admin"],
        },
      ],
      nextQuestion: "barriers",
    },

    // Q7: Freins (multi-choix)
    barriers: {
      id: "barriers",
      type: "multiChoice",
      question: {
        fr: "Avez-vous des difficultés à lever ?",
        en: "Do you have any challenges to overcome?",
        ar: "هل لديك تحديات للتغلب عليها؟",
        es: "¿Tienes dificultades que superar?",
        pt: "Você tem dificuldades a superar?",
        it: "Hai difficoltà da superare?",
        de: "Haben Sie Schwierigkeiten zu überwinden?",
        tr: "Aşmanız gereken zorluklarınız var mı?",
        pl: "Czy masz trudności do pokonania?",
        vi: "Bạn có khó khăn nào cần vượt qua không?",
        zh: "你有需要克服的困难吗？",
        ru: "Есть ли у вас трудности, которые нужно преодолеть?",
        uk: "Чи є у вас труднощі, які потрібно подолати?",
        fa: "آیا چالش‌هایی برای غلبه دارید؟",
        bn: "আপনার কি কোন চ্যালেঞ্জ আছে যা কাটিয়ে উঠতে হবে?",
        ur: "کیا آپ کو کوئی مشکلات ہیں جن پر قابو پانا ہے؟",
      },
      subtitle: {
        fr: "Sélectionnez tout ce qui s'applique",
        en: "Select all that apply",
        ar: "حدد كل ما ينطبق",
        es: "Selecciona todo lo que aplique",
        pt: "Selecione tudo que se aplica",
        it: "Seleziona tutto ciò che si applica",
        de: "Wählen Sie alles Zutreffende",
        tr: "Geçerli olanların tümünü seçin",
        pl: "Wybierz wszystko, co dotyczy",
        vi: "Chọn tất cả những gì áp dụng",
        zh: "选择所有适用的",
        ru: "Выберите все подходящие",
        uk: "Виберіть усе, що стосується",
        fa: "همه موارد قابل اعمال را انتخاب کنید",
        bn: "প্রযোজ্য সব নির্বাচন করুন",
        ur: "تمام قابل اطلاق منتخب کریں",
      },
      choices: [
        {
          id: "childcare",
          label: {
            fr: "Garde d'enfants",
            en: "Childcare",
            ar: "رعاية الأطفال",
            es: "Cuidado de niños",
            pt: "Cuidado de crianças",
            it: "Cura dei bambini",
            de: "Kinderbetreuung",
            tr: "Çocuk bakımı",
            pl: "Opieka nad dziećmi",
            vi: "Trông trẻ",
            zh: "儿童保育",
            ru: "Уход за детьми",
            uk: "Догляд за дітьми",
            fa: "مراقبت از کودک",
            bn: "শিশু যত্ন",
            ur: "بچوں کی دیکھ بھال",
          },
          icon: "👶",
          tags: ["barrier_childcare"],
        },
        {
          id: "transport",
          label: {
            fr: "Transport / mobilité",
            en: "Transport / mobility",
            ar: "النقل / التنقل",
            es: "Transporte / movilidad",
            pt: "Transporte / mobilidade",
            it: "Trasporto / mobilità",
            de: "Transport / Mobilität",
            tr: "Ulaşım / hareketlilik",
            pl: "Transport / mobilność",
            vi: "Giao thông / di chuyển",
            zh: "交通 / 出行",
            ru: "Транспорт / мобильность",
            uk: "Транспорт / мобільність",
            fa: "حمل و نقل / تحرک",
            bn: "পরিবহন / গতিশীলতা",
            ur: "ٹرانسپورٹ / نقل و حرکت",
          },
          icon: "🚗",
          tags: ["barrier_transport"],
        },
        {
          id: "health",
          label: {
            fr: "Santé",
            en: "Health",
            ar: "الصحة",
            es: "Salud",
            pt: "Saúde",
            it: "Salute",
            de: "Gesundheit",
            tr: "Sağlık",
            pl: "Zdrowie",
            vi: "Sức khỏe",
            zh: "健康",
            ru: "Здоровье",
            uk: "Здоров'я",
            fa: "سلامت",
            bn: "স্বাস্থ্য",
            ur: "صحت",
          },
          icon: "🏥",
          tags: ["barrier_health"],
        },
        {
          id: "housing",
          label: {
            fr: "Logement",
            en: "Housing",
            ar: "السكن",
            es: "Vivienda",
            pt: "Moradia",
            it: "Alloggio",
            de: "Unterkunft",
            tr: "Konut",
            pl: "Zakwaterowanie",
            vi: "Nhà ở",
            zh: "住房",
            ru: "Жильё",
            uk: "Житло",
            fa: "مسکن",
            bn: "বাসস্থান",
            ur: "رہائش",
          },
          icon: "🏠",
          tags: ["barrier_housing"],
        },
        {
          id: "admin",
          label: {
            fr: "Administratif (papiers)",
            en: "Administrative (papers)",
            ar: "إداري (أوراق)",
            es: "Administrativo (papeles)",
            pt: "Administrativo (documentos)",
            it: "Amministrativo (documenti)",
            de: "Administrativ (Dokumente)",
            tr: "İdari (evraklar)",
            pl: "Administracyjne (dokumenty)",
            vi: "Hành chính (giấy tờ)",
            zh: "行政（文件）",
            ru: "Административное (документы)",
            uk: "Адміністративне (документи)",
            fa: "اداری (مدارک)",
            bn: "প্রশাসনিক (কাগজপত্র)",
            ur: "انتظامی (کاغذات)",
          },
          icon: "📋",
          tags: ["barrier_admin"],
        },
        {
          id: "schedule",
          label: {
            fr: "Contraintes horaires",
            en: "Schedule constraints",
            ar: "قيود الجدول الزمني",
            es: "Restricciones de horario",
            pt: "Restrições de horário",
            it: "Vincoli di orario",
            de: "Zeitliche Einschränkungen",
            tr: "Program kısıtlamaları",
            pl: "Ograniczenia czasowe",
            vi: "Ràng buộc lịch trình",
            zh: "时间限制",
            ru: "Ограничения по времени",
            uk: "Часові обмеження",
            fa: "محدودیت‌های زمانی",
            bn: "সময়সূচী সীমাবদ্ধতা",
            ur: "شیڈول کی پابندیاں",
          },
          icon: "⏰",
          tags: ["barrier_schedule"],
        },
        {
          id: "none",
          label: {
            fr: "Aucun frein",
            en: "No barriers",
            ar: "لا عوائق",
            es: "Sin barreras",
            pt: "Sem barreiras",
            it: "Nessuna barriera",
            de: "Keine Hindernisse",
            tr: "Engel yok",
            pl: "Brak barier",
            vi: "Không có rào cản",
            zh: "没有障碍",
            ru: "Нет препятствий",
            uk: "Немає перешкод",
            fa: "بدون مانع",
            bn: "কোন বাধা নেই",
            ur: "کوئی رکاوٹ نہیں",
          },
          icon: "✅",
          tags: ["no_barriers"],
        },
      ],
      nextQuestion: null, // Dynamic routing will determine next
    },

    // Question de satisfaction secteur pour Route C
    sector_satisfaction: {
      id: "sector_satisfaction",
      type: "choice",
      question: {
        fr: "Souhaitez-vous continuer dans votre secteur d'activité ou vous reconvertir ?",
        en: "Do you want to continue in your field or switch careers?",
        ar: "هل تريد الاستمرار في مجالك أم تغيير مسارك المهني؟",
        es: "¿Quieres continuar en tu sector o reconvertirte?",
        pt: "Quer continuar na sua área ou mudar de carreira?",
        it: "Vuoi continuare nel tuo settore o cambiare carriera?",
        de: "Möchten Sie in Ihrem Bereich bleiben oder sich umschulen?",
        tr: "Alanınıza devam etmek mi yoksa kariyer değiştirmek mi istiyorsunuz?",
        pl: "Chcesz kontynuować w swoim sektorze czy się przekwalifikować?",
        vi: "Bạn muốn tiếp tục trong lĩnh vực của mình hay chuyển đổi nghề nghiệp?",
        zh: "你想继续在你的领域还是转行？",
        ru: "Хотите продолжить в своей сфере или сменить профессию?",
        uk: "Хочете продовжити у своїй сфері чи змінити професію?",
        fa: "آیا می‌خواهید در حوزه خود ادامه دهید یا شغل خود را تغییر دهید؟",
        bn: "আপনি কি আপনার ক্ষেত্রে চালিয়ে যেতে চান নাকি ক্যারিয়ার পরিবর্তন করতে চান?",
        ur: "کیا آپ اپنے شعبے میں جاری رکھنا چاہتے ہیں یا کیریئر تبدیل کرنا چاہتے ہیں؟",
      },
      subtitle: {
        fr: "Si vous souhaitez changer de métier, nous vous orienterons vers une formation",
        en: "If you want to change careers, we'll guide you to training",
        ar: "إذا كنت تريد تغيير مهنتك، سنوجهك إلى تدريب",
        es: "Si quieres cambiar de profesión, te orientaremos hacia una formación",
        pt: "Se quiser mudar de profissão, vamos orientá-lo para uma formação",
        it: "Se vuoi cambiare professione, ti guideremo verso una formazione",
        de: "Wenn Sie den Beruf wechseln möchten, leiten wir Sie zu einer Ausbildung weiter",
        tr: "Mesleğinizi değiştirmek istiyorsanız, sizi eğitime yönlendireceğiz",
        pl: "Jeśli chcesz zmienić zawód, skierujemy cię na szkolenie",
        vi: "Nếu bạn muốn đổi nghề, chúng tôi sẽ hướng dẫn bạn đào tạo",
        zh: "如果你想换职业，我们会为你推荐培训",
        ru: "Если вы хотите сменить профессию, мы направим вас на обучение",
        uk: "Якщо ви хочете змінити професію, ми направимо вас на навчання",
        fa: "اگر می‌خواهید شغل خود را تغییر دهید، شما را به آموزش هدایت می‌کنیم",
        bn: "আপনি যদি পেশা পরিবর্তন করতে চান, আমরা আপনাকে প্রশিক্ষণের দিকে নির্দেশ করব",
        ur: "اگر آپ پیشہ تبدیل کرنا چاہتے ہیں تو ہم آپ کو تربیت کی طرف رہنمائی کریں گے",
      },
      choices: [
        {
          id: "continue",
          label: {
            fr: "Continuer dans mon secteur",
            en: "Continue in my field",
            ar: "الاستمرار في مجالي",
            es: "Continuar en mi sector",
            pt: "Continuar na minha área",
            it: "Continuare nel mio settore",
            de: "In meinem Bereich weitermachen",
            tr: "Alanımda devam etmek",
            pl: "Kontynuować w moim sektorze",
            vi: "Tiếp tục trong lĩnh vực của tôi",
            zh: "继续在我的领域",
            ru: "Продолжить в своей сфере",
            uk: "Продовжити у своїй сфері",
            fa: "ادامه در حوزه خودم",
            bn: "আমার ক্ষেত্রে চালিয়ে যান",
            ur: "اپنے شعبے میں جاری رکھیں",
          },
          icon: "✅",
          tags: ["sector_satisfied", "no_reconversion"],
        },
        {
          id: "reconvert",
          label: {
            fr: "Me reconvertir dans un autre secteur",
            en: "Switch to a different field",
            ar: "التحول إلى مجال آخر",
            es: "Reconvertirme en otro sector",
            pt: "Mudar para outra área",
            it: "Cambiare settore",
            de: "In einen anderen Bereich wechseln",
            tr: "Başka bir alana geçmek",
            pl: "Przekwalifikować się",
            vi: "Chuyển sang lĩnh vực khác",
            zh: "转行到其他领域",
            ru: "Сменить сферу деятельности",
            uk: "Змінити сферу діяльності",
            fa: "تغییر به حوزه دیگر",
            bn: "অন্য ক্ষেত্রে যেতে চান",
            ur: "دوسرے شعبے میں تبدیل ہونا",
          },
          icon: "🔄",
          tags: ["reconversion", "needs_training"],
        },
      ],
      nextQuestion: null, // Dynamic: continue → work_schedule, reconvert → target_sector (route_b)
    },

    // ============================================
    // ROUTE A: FLE (niveau < A2)
    // ============================================

    // Type de FLE
    fle_type: {
      id: "fle_type",
      type: "choice",
      question: {
        fr: "Quel type de cours de français vous intéresse ?",
        en: "What type of French course interests you?",
        ar: "ما نوع دورة اللغة الفرنسية التي تهمك؟",
        es: "¿Qué tipo de curso de francés te interesa?",
        pt: "Que tipo de curso de francês te interessa?",
        it: "Che tipo di corso di francese ti interessa?",
        de: "Welche Art von Französischkurs interessiert Sie?",
        tr: "Ne tür bir Fransızca kursu ilginizi çekiyor?",
        pl: "Jaki rodzaj kursu francuskiego cię interesuje?",
        vi: "Loại khóa học tiếng Pháp nào bạn quan tâm?",
        zh: "你对什么类型的法语课程感兴趣？",
        ru: "Какой тип курса французского вас интересует?",
        uk: "Який тип курсу французької вас цікавить?",
        fa: "چه نوع دوره فرانسه به شما علاقه‌مند می‌کند؟",
        bn: "কোন ধরনের ফরাসি কোর্সে আগ্রহী?",
        ur: "کس قسم کا فرانسیسی کورس آپ کو دلچسپ لگتا ہے؟",
      },
      choices: [
        {
          id: "general",
          label: {
            fr: "Français général (vie quotidienne)",
            en: "General French (daily life)",
            ar: "فرنسية عامة (الحياة اليومية)",
            es: "Francés general (vida diaria)",
            pt: "Francês geral (vida diária)",
            it: "Francese generale (vita quotidiana)",
            de: "Allgemeines Französisch (Alltag)",
            tr: "Genel Fransızca (günlük yaşam)",
            pl: "Ogólny francuski (życie codzienne)",
            vi: "Tiếng Pháp tổng quát (cuộc sống hàng ngày)",
            zh: "通用法语（日常生活）",
            ru: "Общий французский (повседневная жизнь)",
            uk: "Загальна французька (повсякденне життя)",
            fa: "فرانسه عمومی (زندگی روزمره)",
            bn: "সাধারণ ফরাসি (দৈনন্দিন জীবন)",
            ur: "عام فرانسیسی (روزمرہ زندگی)",
          },
          icon: "📚",
          tags: ["fle_general"],
        },
        {
          id: "professional",
          label: {
            fr: "Français professionnel (pour le travail)",
            en: "Professional French (for work)",
            ar: "الفرنسية المهنية (للعمل)",
            es: "Francés profesional (para el trabajo)",
            pt: "Francês profissional (para trabalho)",
            it: "Francese professionale (per lavoro)",
            de: "Berufsfranzösisch (für die Arbeit)",
            tr: "Profesyonel Fransızca (iş için)",
            pl: "Francuski zawodowy (do pracy)",
            vi: "Tiếng Pháp chuyên nghiệp (cho công việc)",
            zh: "职业法语（用于工作）",
            ru: "Профессиональный французский (для работы)",
            uk: "Професійна французька (для роботи)",
            fa: "فرانسه حرفه‌ای (برای کار)",
            bn: "পেশাদার ফরাসি (কাজের জন্য)",
            ur: "پیشہ ورانہ فرانسیسی (کام کے لیے)",
          },
          icon: "💼",
          tags: ["fle_pro", "fos"],
        },
      ],
      nextQuestion: "fle_format",
    },

    // Format de FLE
    fle_format: {
      id: "fle_format",
      type: "choice",
      question: {
        fr: "Quand préférez-vous suivre les cours ?",
        en: "When do you prefer to take classes?",
        ar: "متى تفضل حضور الدروس؟",
        es: "¿Cuándo prefieres tomar las clases?",
        pt: "Quando você prefere fazer as aulas?",
        it: "Quando preferisci seguire i corsi?",
        de: "Wann möchten Sie den Unterricht besuchen?",
        tr: "Dersleri ne zaman almayı tercih edersiniz?",
        pl: "Kiedy wolisz chodzić na zajęcia?",
        vi: "Bạn thích học vào khi nào?",
        zh: "你喜欢什么时候上课？",
        ru: "Когда вы предпочитаете посещать занятия?",
        uk: "Коли ви віддаєте перевагу відвідувати заняття?",
        fa: "ترجیح می‌دهید کلاس‌ها را چه زمانی شرکت کنید؟",
        bn: "আপনি কখন ক্লাস করতে পছন্দ করেন?",
        ur: "آپ کلاسیں کب لینا پسند کرتے ہیں؟",
      },
      choices: [
        {
          id: "daytime",
          label: {
            fr: "En journée",
            en: "During the day",
            ar: "خلال النهار",
            es: "Durante el día",
            pt: "Durante o dia",
            it: "Durante il giorno",
            de: "Tagsüber",
            tr: "Gündüz",
            pl: "W ciągu dnia",
            vi: "Ban ngày",
            zh: "白天",
            ru: "Днём",
            uk: "Вдень",
            fa: "در طول روز",
            bn: "দিনের বেলা",
            ur: "دن میں",
          },
          icon: "☀️",
          tags: ["daytime_classes"],
        },
        {
          id: "evening",
          label: {
            fr: "Le soir",
            en: "In the evening",
            ar: "في المساء",
            es: "Por la noche",
            pt: "À noite",
            it: "Di sera",
            de: "Abends",
            tr: "Akşam",
            pl: "Wieczorem",
            vi: "Buổi tối",
            zh: "晚上",
            ru: "Вечером",
            uk: "Ввечері",
            fa: "عصر",
            bn: "সন্ধ্যায়",
            ur: "شام کو",
          },
          icon: "🌙",
          tags: ["evening_classes"],
        },
        {
          id: "flexible",
          label: {
            fr: "Je suis flexible",
            en: "I'm flexible",
            ar: "أنا مرن",
            es: "Soy flexible",
            pt: "Sou flexível",
            it: "Sono flessibile",
            de: "Ich bin flexibel",
            tr: "Esneyim",
            pl: "Jestem elastyczny",
            vi: "Tôi linh hoạt",
            zh: "我很灵活",
            ru: "Я гибкий",
            uk: "Я гнучкий",
            fa: "انعطاف‌پذیر هستم",
            bn: "আমি নমনীয়",
            ur: "میں لچکدار ہوں",
          },
          icon: "🔄",
          tags: ["flexible_schedule"],
        },
      ],
      nextQuestion: "contact_firstname",
    },

    // ============================================
    // ROUTE B: OF Métiers (niveau >= A2)
    // ============================================

    // Secteur cible
    target_sector: {
      id: "target_sector",
      type: "choice",
      question: {
        fr: "Quel secteur vous intéresse ?",
        en: "What sector interests you?",
        ar: "ما هو القطاع الذي يهمك؟",
        es: "¿Qué sector te interesa?",
        pt: "Que setor te interessa?",
        it: "Quale settore ti interessa?",
        de: "Welcher Sektor interessiert Sie?",
        tr: "Hangi sektör ilginizi çekiyor?",
        pl: "Jaki sektor cię interesuje?",
        vi: "Lĩnh vực nào bạn quan tâm?",
        zh: "你对哪个行业感兴趣？",
        ru: "Какой сектор вас интересует?",
        uk: "Який сектор вас цікавить?",
        fa: "چه بخشی به شما علاقه‌مند می‌کند؟",
        bn: "কোন সেক্টরে আগ্রহী?",
        ur: "کون سا شعبہ آپ کو دلچسپ لگتا ہے؟",
      },
      subtitle: {
        fr: "Métiers en tension avec des offres disponibles",
        en: "In-demand sectors with available positions",
        ar: "قطاعات مطلوبة مع وظائف متاحة",
        es: "Sectores en demanda con ofertas disponibles",
        pt: "Setores em demanda com vagas disponíveis",
        it: "Settori in domanda con posizioni disponibili",
        de: "Gefragte Sektoren mit verfügbaren Stellen",
        tr: "Mevcut pozisyonlarla talep gören sektörler",
        pl: "Sektory z popytem z dostępnymi stanowiskami",
        vi: "Các lĩnh vực có nhu cầu với vị trí có sẵn",
        zh: "有空缺职位的热门行业",
        ru: "Востребованные секторы с доступными вакансиями",
        uk: "Затребувані сектори з доступними вакансіями",
        fa: "بخش‌های پرتقاضا با موقعیت‌های موجود",
        bn: "চাহিদাসম্পন্ন সেক্টর উপলব্ধ পদের সাথে",
        ur: "دستیاب عہدوں کے ساتھ مانگ والے شعبے",
      },
      choices: [
        { id: "logistique", label: { fr: "Logistique / Entrepôt", en: "Logistics / Warehouse", ar: "اللوجستيات / المستودع", es: "Logística / Almacén", pt: "Logística / Armazém", it: "Logistica / Magazzino", de: "Logistik / Lager", tr: "Lojistik / Depo", pl: "Logistyka / Magazyn", vi: "Hậu cần / Kho", zh: "物流 / 仓库", ru: "Логистика / Склад", uk: "Логістика / Склад", fa: "لجستیک / انبار", bn: "সরবরাহ / গুদাম", ur: "لاجسٹکس / گودام" }, icon: "📦", tags: ["sector_logistics"] },
        { id: "transport", label: { fr: "Transport / Livraison / Mobilité", en: "Transport / Delivery", ar: "النقل / التوصيل", es: "Transporte / Entrega", pt: "Transporte / Entrega", it: "Trasporto / Consegna", de: "Transport / Lieferung", tr: "Ulaşım / Teslimat", pl: "Transport / Dostawa", vi: "Vận tải / Giao hàng", zh: "运输 / 配送", ru: "Транспорт / Доставка", uk: "Транспорт / Доставка", fa: "حمل و نقل / تحویل", bn: "পরিবহন / ডেলিভারি", ur: "ٹرانسپورٹ / ڈیلیوری" }, icon: "🚚", tags: ["sector_transport"] },
        { id: "btp", label: { fr: "BTP / Travaux publics / Réseaux", en: "Construction / Public works", ar: "البناء / الأشغال العامة", es: "Construcción / Obras públicas", pt: "Construção / Obras públicas", it: "Edilizia / Lavori pubblici", de: "Bau / Öffentliche Arbeiten", tr: "İnşaat / Kamu işleri", pl: "Budownictwo / Roboty publiczne", vi: "Xây dựng / Công trình công cộng", zh: "建筑 / 公共工程", ru: "Строительство / Общественные работы", uk: "Будівництво / Громадські роботи", fa: "ساختمان / کارهای عمومی", bn: "নির্মাণ / জনকাজ", ur: "تعمیرات / عوامی کام" }, icon: "🏗️", tags: ["sector_btp"] },
        { id: "proprete", label: { fr: "Propreté / Hygiène", en: "Cleaning / Hygiene", ar: "النظافة", es: "Limpieza / Higiene", pt: "Limpeza / Higiene", it: "Pulizia / Igiene", de: "Reinigung / Hygiene", tr: "Temizlik / Hijyen", pl: "Sprzątanie / Higiena", vi: "Vệ sinh", zh: "清洁 / 卫生", ru: "Уборка / Гигиена", uk: "Прибирання / Гігієна", fa: "نظافت / بهداشت", bn: "পরিষ্কার / স্বাস্থ্যবিধি", ur: "صفائی / حفظان صحت" }, icon: "🧹", tags: ["sector_cleaning"] },
        { id: "hotellerie", label: { fr: "Hôtellerie – Restauration / Métiers de bouche", en: "Hospitality / Food industry", ar: "الضيافة / صناعة الطعام", es: "Hostelería / Gastronomía", pt: "Hotelaria / Gastronomia", it: "Ristorazione / Gastronomia", de: "Gastronomie / Lebensmittel", tr: "Otelcilik / Yemek", pl: "Gastronomia / Żywność", vi: "Nhà hàng khách sạn", zh: "餐饮酒店", ru: "Гостиничный бизнес / Питание", uk: "Готельний бізнес / Харчування", fa: "مهمان‌نوازی / صنایع غذایی", bn: "আতিথেয়তা / খাদ্য", ur: "مہمان نوازی / کھانا" }, icon: "🏨", tags: ["sector_hospitality"] },
        { id: "sante", label: { fr: "Santé – Médico-social / Aide à la personne", en: "Health / Social care / Personal assistance", ar: "الصحة / الرعاية الاجتماعية", es: "Salud / Atención social", pt: "Saúde / Assistência social", it: "Sanità / Assistenza sociale", de: "Gesundheit / Soziale Betreuung", tr: "Sağlık / Sosyal bakım", pl: "Zdrowie / Opieka społeczna", vi: "Y tế / Chăm sóc xã hội", zh: "健康 / 社会护理", ru: "Здоровье / Социальная помощь", uk: "Здоров'я / Соціальна допомога", fa: "بهداشت / مراقبت اجتماعی", bn: "স্বাস্থ্য / সামাজিক যত্ন", ur: "صحت / سماجی دیکھ بھال" }, icon: "🤝", tags: ["sector_care"] },
        { id: "commerce", label: { fr: "Commerce / Vente / Relation client", en: "Retail / Sales / Customer relations", ar: "التجارة / المبيعات", es: "Comercio / Ventas", pt: "Comércio / Vendas", it: "Commercio / Vendite", de: "Handel / Verkauf", tr: "Ticaret / Satış", pl: "Handel / Sprzedaż", vi: "Thương mại / Bán hàng", zh: "商业 / 销售", ru: "Торговля / Продажи", uk: "Торгівля / Продажі", fa: "تجارت / فروش", bn: "বাণিজ্য / বিক্রয়", ur: "تجارت / فروخت" }, icon: "🏪", tags: ["sector_commerce"] },
        { id: "admin_accueil", label: { fr: "Administration / Accueil / Secrétariat", en: "Administration / Reception / Office work", ar: "الإدارة / الاستقبال", es: "Administración / Recepción", pt: "Administração / Receção", it: "Amministrazione / Accoglienza", de: "Verwaltung / Empfang", tr: "Yönetim / Resepsiyon", pl: "Administracja / Recepcja", vi: "Hành chính / Lễ tân", zh: "行政 / 前台", ru: "Администрация / Приём", uk: "Адміністрація / Прийом", fa: "اداره / پذیرش", bn: "প্রশাসন / অভ্যর্থনা", ur: "انتظامیہ / استقبالیہ" }, icon: "🏢", tags: ["sector_admin"] },
        { id: "industrie", label: { fr: "Industrie / Production / Maintenance", en: "Industry / Production / Maintenance", ar: "الصناعة / الإنتاج / الصيانة", es: "Industria / Producción / Mantenimiento", pt: "Indústria / Produção / Manutenção", it: "Industria / Produzione / Manutenzione", de: "Industrie / Produktion / Wartung", tr: "Sanayi / Üretim / Bakım", pl: "Przemysł / Produkcja / Konserwacja", vi: "Công nghiệp / Sản xuất / Bảo trì", zh: "工业 / 生产 / 维护", ru: "Промышленность / Производство / Обслуживание", uk: "Промисловість / Виробництво / Обслуговування", fa: "صنعت / تولید / نگهداری", bn: "শিল্প / উৎপাদন / রক্ষণাবেক্ষণ", ur: "صنعت / پیداوار / دیکھ بھال" }, icon: "🏭", tags: ["sector_industry"] },
        { id: "securite", label: { fr: "Sécurité / Sûreté", en: "Security / Safety", ar: "الأمن / السلامة", es: "Seguridad / Protección", pt: "Segurança / Proteção", it: "Sicurezza / Protezione", de: "Sicherheit / Schutz", tr: "Güvenlik / Emniyet", pl: "Bezpieczeństwo / Ochrona", vi: "An ninh / An toàn", zh: "安保 / 安全", ru: "Безопасность / Охрана", uk: "Безпека / Охорона", fa: "امنیت / ایمنی", bn: "নিরাপত্তা / সুরক্ষা", ur: "سیکیورٹی / حفاظت" }, icon: "🛡️", tags: ["sector_security"] },
        { id: "transversal", label: { fr: "Transversal (tous secteurs)", en: "Cross-sector (all sectors)", ar: "شامل (جميع القطاعات)", es: "Transversal (todos los sectores)", pt: "Transversal (todos os setores)", it: "Trasversale (tutti i settori)", de: "Übergreifend (alle Branchen)", tr: "Genel (tüm sektörler)", pl: "Ogólny (wszystkie sektory)", vi: "Đa ngành (tất cả)", zh: "跨行业（所有行业）", ru: "Универсальный (все отрасли)", uk: "Універсальний (усі галузі)", fa: "فراگیر (همه بخش‌ها)", bn: "সার্বজনীন (সকল খাত)", ur: "ہمہ جہت (تمام شعبے)" }, icon: "🔄", tags: ["sector_transversal"] },
      ],
      nextQuestion: null, // Dynamic: route_b → training_duration, route_c → work_schedule
    },

    // Durée formation
    training_duration: {
      id: "training_duration",
      type: "choice",
      question: {
        fr: "Quelle durée de formation pouvez-vous faire ?",
        en: "How long can you train for?",
        ar: "ما هي مدة التدريب التي يمكنك القيام بها؟",
        es: "¿Cuánto tiempo de formación puedes hacer?",
        pt: "Quanto tempo de formação você pode fazer?",
        it: "Per quanto tempo puoi formarti?",
        de: "Wie lange können Sie sich weiterbilden?",
        tr: "Ne kadar süre eğitim alabilirsiniz?",
        pl: "Na jak długo możesz się szkolić?",
        vi: "Bạn có thể đào tạo trong bao lâu?",
        zh: "你能培训多长时间？",
        ru: "Как долго вы можете обучаться?",
        uk: "Як довго ви можете навчатися?",
        fa: "چه مدت می‌توانید آموزش ببینید؟",
        bn: "আপনি কতদিন প্রশিক্ষণ নিতে পারবেন?",
        ur: "آپ کتنی دیر تربیت کر سکتے ہیں؟",
      },
      choices: [
        { id: "short", label: { fr: "Courte (1-2 mois)", en: "Short (1-2 months)", ar: "قصيرة (1-2 أشهر)", es: "Corta (1-2 meses)", pt: "Curta (1-2 meses)", it: "Breve (1-2 mesi)", de: "Kurz (1-2 Monate)", tr: "Kısa (1-2 ay)", pl: "Krótka (1-2 miesiące)", vi: "Ngắn (1-2 tháng)", zh: "短期（1-2个月）", ru: "Короткая (1-2 месяца)", uk: "Коротка (1-2 місяці)", fa: "کوتاه (1-2 ماه)", bn: "সংক্ষিপ্ত (1-2 মাস)", ur: "مختصر (1-2 ماہ)" }, icon: "⚡", tags: ["training_short"] },
        { id: "medium", label: { fr: "Moyenne (3-6 mois)", en: "Medium (3-6 months)", ar: "متوسطة (3-6 أشهر)", es: "Media (3-6 meses)", pt: "Média (3-6 meses)", it: "Media (3-6 mesi)", de: "Mittel (3-6 Monate)", tr: "Orta (3-6 ay)", pl: "Średnia (3-6 miesięcy)", vi: "Trung bình (3-6 tháng)", zh: "中期（3-6个月）", ru: "Средняя (3-6 месяцев)", uk: "Середня (3-6 місяців)", fa: "متوسط (3-6 ماه)", bn: "মাঝারি (3-6 মাস)", ur: "درمیانی (3-6 ماہ)" }, icon: "📅", tags: ["training_medium"] },
        { id: "long", label: { fr: "Longue (6+ mois)", en: "Long (6+ months)", ar: "طويلة (6+ أشهر)", es: "Larga (6+ meses)", pt: "Longa (6+ meses)", it: "Lunga (6+ mesi)", de: "Lang (6+ Monate)", tr: "Uzun (6+ ay)", pl: "Długa (6+ miesięcy)", vi: "Dài (6+ tháng)", zh: "长期（6个月以上）", ru: "Длинная (6+ месяцев)", uk: "Довга (6+ місяців)", fa: "طولانی (6+ ماه)", bn: "দীর্ঘ (6+ মাস)", ur: "طویل (6+ ماہ)" }, icon: "📆", tags: ["training_long"] },
      ],
      nextQuestion: "mobility",
    },

    // Mobilité
    mobility: {
      id: "mobility",
      type: "choice",
      question: {
        fr: "Quelle est votre mobilité géographique ?",
        en: "What is your geographical mobility?",
        ar: "ما هي قدرتك على التنقل الجغرافي؟",
        es: "¿Cuál es tu movilidad geográfica?",
        pt: "Qual é a sua mobilidade geográfica?",
        it: "Qual è la tua mobilità geografica?",
        de: "Wie mobil sind Sie geografisch?",
        tr: "Coğrafi hareketliliğiniz nedir?",
        pl: "Jaka jest Twoja mobilność geograficzna?",
        vi: "Khả năng di chuyển địa lý của bạn là gì?",
        zh: "你的地理流动性如何？",
        ru: "Какова ваша географическая мобильность?",
        uk: "Яка ваша географічна мобільність?",
        fa: "تحرک جغرافیایی شما چیست؟",
        bn: "আপনার ভৌগোলিক গতিশীলতা কী?",
        ur: "آپ کی جغرافیائی نقل و حرکت کیا ہے؟",
      },
      choices: [
        { id: "local", label: { fr: "Locale (< 30 km)", en: "Local (< 30 km)", ar: "محلية (< 30 كم)", es: "Local (< 30 km)", pt: "Local (< 30 km)", it: "Locale (< 30 km)", de: "Lokal (< 30 km)", tr: "Yerel (< 30 km)", pl: "Lokalna (< 30 km)", vi: "Địa phương (< 30 km)", zh: "本地（< 30公里）", ru: "Местная (< 30 км)", uk: "Місцева (< 30 км)", fa: "محلی (< 30 کیلومتر)", bn: "স্থানীয় (< 30 কিমি)", ur: "مقامی (< 30 کلومیٹر)" }, icon: "📍", tags: ["mobility_local"] },
        { id: "regional", label: { fr: "Régionale (30-100 km)", en: "Regional (30-100 km)", ar: "إقليمية (30-100 كم)", es: "Regional (30-100 km)", pt: "Regional (30-100 km)", it: "Regionale (30-100 km)", de: "Regional (30-100 km)", tr: "Bölgesel (30-100 km)", pl: "Regionalna (30-100 km)", vi: "Khu vực (30-100 km)", zh: "区域（30-100公里）", ru: "Региональная (30-100 км)", uk: "Регіональна (30-100 км)", fa: "منطقه‌ای (30-100 کیلومتر)", bn: "আঞ্চলিক (30-100 কিমি)", ur: "علاقائی (30-100 کلومیٹر)" }, icon: "🗺️", tags: ["mobility_regional"] },
        { id: "national", label: { fr: "Nationale", en: "National", ar: "وطنية", es: "Nacional", pt: "Nacional", it: "Nazionale", de: "National", tr: "Ulusal", pl: "Krajowa", vi: "Quốc gia", zh: "全国", ru: "Национальная", uk: "Національна", fa: "ملی", bn: "জাতীয়", ur: "قومی" }, icon: "🇫🇷", tags: ["mobility_national"] },
      ],
      nextQuestion: "funding_status",
    },

    // Financement
    funding_status: {
      id: "funding_status",
      type: "choice",
      question: {
        fr: "Avez-vous un financement pour la formation ?",
        en: "Do you have funding for training?",
        ar: "هل لديك تمويل للتدريب؟",
        es: "¿Tienes financiación para la formación?",
        pt: "Você tem financiamento para formação?",
        it: "Hai un finanziamento per la formazione?",
        de: "Haben Sie eine Finanzierung für die Ausbildung?",
        tr: "Eğitim için finansmanınız var mı?",
        pl: "Czy masz finansowanie na szkolenie?",
        vi: "Bạn có tài trợ cho đào tạo không?",
        zh: "你有培训资金吗？",
        ru: "У вас есть финансирование для обучения?",
        uk: "Чи є у вас фінансування для навчання?",
        fa: "آیا برای آموزش بودجه دارید؟",
        bn: "প্রশিক্ষণের জন্য আপনার অর্থায়ন আছে?",
        ur: "کیا آپ کے پاس تربیت کے لیے فنڈنگ ہے؟",
      },
      subtitle: {
        fr: "France Travail, OPCO, Région, CPF...",
        en: "France Travail, OPCO, Region, CPF...",
        ar: "فرنسا ترافيل، OPCO، المنطقة، CPF...",
        es: "France Travail, OPCO, Región, CPF...",
        pt: "France Travail, OPCO, Região, CPF...",
        it: "France Travail, OPCO, Regione, CPF...",
        de: "France Travail, OPCO, Region, CPF...",
        tr: "France Travail, OPCO, Bölge, CPF...",
        pl: "France Travail, OPCO, Region, CPF...",
        vi: "France Travail, OPCO, Vùng, CPF...",
        zh: "France Travail、OPCO、地区、CPF...",
        ru: "France Travail, OPCO, Регион, CPF...",
        uk: "France Travail, OPCO, Регіон, CPF...",
        fa: "France Travail، OPCO، منطقه، CPF...",
        bn: "France Travail, OPCO, অঞ্চল, CPF...",
        ur: "France Travail, OPCO, علاقہ, CPF...",
      },
      choices: [
        { id: "yes", label: { fr: "Oui, j'ai un financement", en: "Yes, I have funding", ar: "نعم، لدي تمويل", es: "Sí, tengo financiación", pt: "Sim, tenho financiamento", it: "Sì, ho un finanziamento", de: "Ja, ich habe eine Finanzierung", tr: "Evet, finansmanım var", pl: "Tak, mam finansowanie", vi: "Có, tôi có tài trợ", zh: "是的，我有资金", ru: "Да, у меня есть финансирование", uk: "Так, у мене є фінансування", fa: "بله، بودجه دارم", bn: "হ্যাঁ, আমার অর্থায়ন আছে", ur: "ہاں، میرے پاس فنڈنگ ہے" }, icon: "✅", tags: ["funding_confirmed"] },
        { id: "pending", label: { fr: "C'est en cours", en: "It's in progress", ar: "قيد التنفيذ", es: "Está en curso", pt: "Está em andamento", it: "È in corso", de: "Es ist in Bearbeitung", tr: "Süreç devam ediyor", pl: "W trakcie", vi: "Đang tiến hành", zh: "正在进行中", ru: "В процессе", uk: "В процесі", fa: "در حال پیشرفت", bn: "চলমান", ur: "جاری ہے" }, icon: "⏳", tags: ["funding_pending"] },
        { id: "no", label: { fr: "Non, pas encore", en: "No, not yet", ar: "لا، ليس بعد", es: "No, todavía no", pt: "Não, ainda não", it: "No, non ancora", de: "Nein, noch nicht", tr: "Hayır, henüz değil", pl: "Nie, jeszcze nie", vi: "Chưa có", zh: "还没有", ru: "Нет, ещё нет", uk: "Ні, ще ні", fa: "نه، هنوز نه", bn: "না, এখনও না", ur: "نہیں، ابھی نہیں" }, icon: "❓", tags: ["funding_needed"] },
        { id: "unknown", label: { fr: "Je ne sais pas", en: "I don't know", ar: "لا أعرف", es: "No sé", pt: "Não sei", it: "Non lo so", de: "Ich weiß nicht", tr: "Bilmiyorum", pl: "Nie wiem", vi: "Tôi không biết", zh: "我不知道", ru: "Не знаю", uk: "Не знаю", fa: "نمی‌دانم", bn: "জানি না", ur: "نہیں معلوم" }, icon: "🤷", tags: ["funding_unknown"] },
      ],
      nextQuestion: "contact_firstname",
    },

    // ============================================
    // ROUTE C: Employeurs (job ready)
    // ============================================

    // Horaires de travail
    work_schedule: {
      id: "work_schedule",
      type: "choice",
      question: {
        fr: "Quels horaires de travail acceptez-vous ?",
        en: "What work schedule do you accept?",
        ar: "ما هي ساعات العمل التي تقبلها؟",
        es: "¿Qué horario de trabajo aceptas?",
        pt: "Qual horário de trabalho você aceita?",
        it: "Quali orari di lavoro accetti?",
        de: "Welche Arbeitszeiten akzeptieren Sie?",
        tr: "Hangi çalışma saatlerini kabul ediyorsunuz?",
        pl: "Jakie godziny pracy akceptujesz?",
        vi: "Bạn chấp nhận lịch làm việc nào?",
        zh: "你接受什么工作时间？",
        ru: "Какой график работы вы принимаете?",
        uk: "Який графік роботи ви приймаєте?",
        fa: "چه برنامه کاری را قبول می‌کنید؟",
        bn: "আপনি কোন কাজের সময়সূচী গ্রহণ করেন?",
        ur: "آپ کون سا کام کا شیڈول قبول کرتے ہیں؟",
      },
      choices: [
        { id: "standard", label: { fr: "Journée standard", en: "Standard day", ar: "نهار عادي", es: "Día estándar", pt: "Dia padrão", it: "Giornata standard", de: "Normaler Tag", tr: "Standart gündüz", pl: "Standardowy dzień", vi: "Ngày tiêu chuẩn", zh: "标准白班", ru: "Стандартный день", uk: "Стандартний день", fa: "روز معمولی", bn: "স্ট্যান্ডার্ড দিন", ur: "معیاری دن" }, icon: "☀️", tags: ["schedule_day"] },
        { id: "flexible", label: { fr: "Horaires décalés (nuit/WE)", en: "Flexible hours (night/weekend)", ar: "ساعات مرنة (ليلي/نهاية الأسبوع)", es: "Horarios flexibles (noche/fin de semana)", pt: "Horários flexíveis (noite/fim de semana)", it: "Orari flessibili (notte/fine settimana)", de: "Flexible Zeiten (Nacht/Wochenende)", tr: "Esnek saatler (gece/hafta sonu)", pl: "Elastyczne godziny (noc/weekend)", vi: "Giờ linh hoạt (đêm/cuối tuần)", zh: "弹性时间（夜班/周末）", ru: "Гибкий график (ночь/выходные)", uk: "Гнучкий графік (ніч/вихідні)", fa: "ساعات انعطاف‌پذیر (شب/آخر هفته)", bn: "নমনীয় সময় (রাত/সাপ্তাহিক ছুটি)", ur: "لچکدار اوقات (رات/ہفتے کا اختتام)" }, icon: "🌙", tags: ["schedule_flexible", "night_ok", "weekend_ok"] },
        { id: "any", label: { fr: "Tout horaire", en: "Any schedule", ar: "أي جدول", es: "Cualquier horario", pt: "Qualquer horário", it: "Qualsiasi orario", de: "Jede Arbeitszeit", tr: "Herhangi bir saat", pl: "Dowolne godziny", vi: "Bất kỳ lịch nào", zh: "任何时间", ru: "Любой график", uk: "Будь-який графік", fa: "هر برنامه‌ای", bn: "যেকোনো সময়সূচী", ur: "کوئی بھی شیڈول" }, icon: "🔄", tags: ["schedule_any"] },
      ],
      nextQuestion: "mobility_km",
    },

    // Mobilité km
    mobility_km: {
      id: "mobility_km",
      type: "choice",
      question: {
        fr: "Quel rayon de déplacement acceptez-vous ?",
        en: "What travel radius do you accept?",
        ar: "ما هو نطاق التنقل الذي تقبله؟",
        es: "¿Qué radio de desplazamiento aceptas?",
        pt: "Qual raio de deslocamento você aceita?",
        it: "Quale raggio di spostamento accetti?",
        de: "Welchen Reiseradius akzeptieren Sie?",
        tr: "Hangi seyahat yarıçapını kabul ediyorsunuz?",
        pl: "Jaki promień podróży akceptujesz?",
        vi: "Bạn chấp nhận bán kính di chuyển nào?",
        zh: "你接受多大的通勤范围？",
        ru: "Какой радиус поездок вы принимаете?",
        uk: "Який радіус поїздок ви приймаєте?",
        fa: "چه شعاع سفری را قبول می‌کنید؟",
        bn: "আপনি কোন ভ্রমণ ব্যাসার্ধ গ্রহণ করেন?",
        ur: "آپ کون سا سفر کا دائرہ قبول کرتے ہیں؟",
      },
      choices: [
        { id: "close", label: { fr: "< 10 km", en: "< 10 km", ar: "< 10 كم", es: "< 10 km", pt: "< 10 km", it: "< 10 km", de: "< 10 km", tr: "< 10 km", pl: "< 10 km", vi: "< 10 km", zh: "< 10 公里", ru: "< 10 км", uk: "< 10 км", fa: "< 10 کیلومتر", bn: "< 10 কিমি", ur: "< 10 کلومیٹر" }, icon: "🚶", tags: ["radius_10km"] },
        { id: "medium", label: { fr: "10-30 km", en: "10-30 km", ar: "10-30 كم", es: "10-30 km", pt: "10-30 km", it: "10-30 km", de: "10-30 km", tr: "10-30 km", pl: "10-30 km", vi: "10-30 km", zh: "10-30 公里", ru: "10-30 км", uk: "10-30 км", fa: "10-30 کیلومتر", bn: "10-30 কিমি", ur: "10-30 کلومیٹر" }, icon: "🚌", tags: ["radius_30km"] },
        { id: "far", label: { fr: "> 30 km", en: "> 30 km", ar: "> 30 كم", es: "> 30 km", pt: "> 30 km", it: "> 30 km", de: "> 30 km", tr: "> 30 km", pl: "> 30 km", vi: "> 30 km", zh: "> 30 公里", ru: "> 30 км", uk: "> 30 км", fa: "> 30 کیلومتر", bn: "> 30 কিমি", ur: "> 30 کلومیٹر" }, icon: "🚗", tags: ["radius_30km_plus"] },
      ],
      nextQuestion: "immediate_availability",
    },

    // Disponibilité immédiate
    immediate_availability: {
      id: "immediate_availability",
      type: "choice",
      question: {
        fr: "Êtes-vous disponible immédiatement ?",
        en: "Are you available immediately?",
        ar: "هل أنت متاح فوراً؟",
        es: "¿Estás disponible inmediatamente?",
        pt: "Você está disponível imediatamente?",
        it: "Sei disponibile immediatamente?",
        de: "Sind Sie sofort verfügbar?",
        tr: "Hemen müsait misiniz?",
        pl: "Czy jesteś dostępny natychmiast?",
        vi: "Bạn có sẵn sàng ngay không?",
        zh: "你能立即开始工作吗？",
        ru: "Вы доступны сразу?",
        uk: "Ви доступні одразу?",
        fa: "آیا فوراً در دسترس هستید؟",
        bn: "আপনি কি এখনই উপলব্ধ?",
        ur: "کیا آپ فوری طور پر دستیاب ہیں؟",
      },
      choices: [
        { id: "yes", label: { fr: "Oui, immédiatement", en: "Yes, immediately", ar: "نعم، فوراً", es: "Sí, inmediatamente", pt: "Sim, imediatamente", it: "Sì, immediatamente", de: "Ja, sofort", tr: "Evet, hemen", pl: "Tak, natychmiast", vi: "Có, ngay lập tức", zh: "是的，立即", ru: "Да, сразу", uk: "Так, одразу", fa: "بله، فوراً", bn: "হ্যাঁ, এখনই", ur: "ہاں، فوری طور پر" }, icon: "✅", tags: ["available_now"] },
        { id: "soon", label: { fr: "Dans 1-2 semaines", en: "In 1-2 weeks", ar: "خلال 1-2 أسبوع", es: "En 1-2 semanas", pt: "Em 1-2 semanas", it: "In 1-2 settimane", de: "In 1-2 Wochen", tr: "1-2 hafta içinde", pl: "Za 1-2 tygodnie", vi: "Trong 1-2 tuần", zh: "1-2周内", ru: "Через 1-2 недели", uk: "Через 1-2 тижні", fa: "در 1-2 هفته", bn: "1-2 সপ্তাহের মধ্যে", ur: "1-2 ہفتوں میں" }, icon: "📅", tags: ["available_soon"] },
        { id: "later", label: { fr: "Plus tard", en: "Later", ar: "لاحقاً", es: "Más tarde", pt: "Mais tarde", it: "Più tardi", de: "Später", tr: "Daha sonra", pl: "Później", vi: "Sau đó", zh: "稍后", ru: "Позже", uk: "Пізніше", fa: "بعداً", bn: "পরে", ur: "بعد میں" }, icon: "⏰", tags: ["available_later"] },
      ],
      nextQuestion: "contact_firstname",
    },

    // ============================================
    // CONTACT (fin de parcours)
    // ============================================

    contact_firstname: {
      id: "contact_firstname",
      type: "text",
      question: {
        fr: "Quel est votre prénom ?",
        en: "What is your first name?",
        ar: "ما هو اسمك الأول؟",
        es: "¿Cuál es tu nombre?",
        pt: "Qual é o seu primeiro nome?",
        it: "Qual è il tuo nome?",
        de: "Wie ist Ihr Vorname?",
        tr: "Adınız nedir?",
        pl: "Jakie jest Twoje imię?",
        vi: "Tên của bạn là gì?",
        zh: "你的名字是什么？",
        ru: "Как вас зовут?",
        uk: "Як вас звати?",
        fa: "نام شما چیست؟",
        bn: "আপনার প্রথম নাম কি?",
        ur: "آپ کا پہلا نام کیا ہے؟",
      },
      required: true,
      nextQuestion: "contact_lastname",
    },

    contact_lastname: {
      id: "contact_lastname",
      type: "text",
      question: {
        fr: "Quel est votre nom de famille ?",
        en: "What is your last name?",
        ar: "ما هو اسم عائلتك؟",
        es: "¿Cuál es tu apellido?",
        pt: "Qual é o seu sobrenome?",
        it: "Qual è il tuo cognome?",
        de: "Wie ist Ihr Nachname?",
        tr: "Soyadınız nedir?",
        pl: "Jakie jest Twoje nazwisko?",
        vi: "Họ của bạn là gì?",
        zh: "你的姓是什么？",
        ru: "Какая у вас фамилия?",
        uk: "Яке ваше прізвище?",
        fa: "نام خانوادگی شما چیست؟",
        bn: "আপনার পদবি কি?",
        ur: "آپ کا خاندانی نام کیا ہے؟",
      },
      required: true,
      nextQuestion: "contact_email",
    },

    contact_email: {
      id: "contact_email",
      type: "email",
      question: {
        fr: "Quel est votre email ?",
        en: "What is your email?",
        ar: "ما هو بريدك الإلكتروني؟",
        es: "¿Cuál es tu email?",
        pt: "Qual é o seu email?",
        it: "Qual è la tua email?",
        de: "Wie ist Ihre E-Mail?",
        tr: "E-postanız nedir?",
        pl: "Jaki jest Twój email?",
        vi: "Email của bạn là gì?",
        zh: "你的邮箱是什么？",
        ru: "Какой у вас email?",
        uk: "Який ваш email?",
        fa: "ایمیل شما چیست؟",
        bn: "আপনার ইমেইল কি?",
        ur: "آپ کا ای میل کیا ہے؟",
      },
      subtitle: {
        fr: "Pour recevoir votre orientation personnalisée",
        en: "To receive your personalized guidance",
        ar: "لتلقي توجيهك الشخصي",
        es: "Para recibir tu orientación personalizada",
        pt: "Para receber sua orientação personalizada",
        it: "Per ricevere la tua guida personalizzata",
        de: "Um Ihre personalisierte Beratung zu erhalten",
        tr: "Kişiselleştirilmiş yönlendirmenizi almak için",
        pl: "Aby otrzymać spersonalizowane wskazówki",
        vi: "Để nhận hướng dẫn cá nhân hóa của bạn",
        zh: "接收您的个性化指导",
        ru: "Чтобы получить персонализированное руководство",
        uk: "Щоб отримати персоналізоване керівництво",
        fa: "برای دریافت راهنمایی شخصی‌سازی شده",
        bn: "আপনার ব্যক্তিগতকৃত গাইডেন্স পেতে",
        ur: "اپنی ذاتی رہنمائی حاصل کرنے کے لیے",
      },
      required: true,
      nextQuestion: null,
    },
  },
};

// ============================================
// ROUTING LOGIC
// ============================================

export interface OnboardingAnswers {
  location?: string;
  main_goal?: string;
  contact_48h?: string;
  origin_country?: string;
  previous_job?: string;
  literacy?: string;
  french_level_cecrl?: string;
  work_right?: string;
  barriers?: string | string[];
  sector_satisfaction?: string;
  fle_type?: string;
  fle_format?: string;
  target_sector?: string;
  training_duration?: string;
  mobility?: string;
  funding_status?: string;
  work_schedule?: string;
  mobility_km?: string;
  immediate_availability?: string;
  contact_firstname?: string;
  contact_lastname?: string;
  contact_email?: string;
  tags: string[];
  [key: string]: unknown;
}

// Determine the route based on answers
export function determineRoute(answers: OnboardingAnswers): LeadRoute {
  const mainGoal = answers.main_goal as string | undefined;
  const frenchLevel = answers.french_level_cecrl as string | undefined;
  const workRight = answers.work_right as string | undefined;

  // Route C: Emploi direct — personne prête à travailler immédiatement
  // Conditions: veut un emploi + droit de travailler + niveau A2 minimum
  // Pas besoin de formation, juste mise en relation avec employeurs
  if (mainGoal === "find_job" && workRight === "yes" && (frenchLevel === "a2" || frenchLevel === "b1")) {
    return "route_c";
  }

  // Route A: FLE — besoin d'apprendre le français d'abord
  // Conditions: veut apprendre OU niveau trop faible (alpha/A1)
  if (mainGoal === "learn_french") {
    return "route_a";
  }
  if (frenchLevel === "alpha" || frenchLevel === "a1") {
    return "route_a";
  }

  // Route B: Formation qualifiante — a le niveau de français, veut un métier
  // Conditions: veut une formation + niveau A2 minimum
  if (mainGoal === "job_training" && (frenchLevel === "a2" || frenchLevel === "b1")) {
    return "route_b";
  }

  // Route B aussi: veut un emploi mais pas de droit de travail → formation d'abord
  if (mainGoal === "find_job" && workRight !== "yes" && (frenchLevel === "a2" || frenchLevel === "b1")) {
    return "route_b";
  }

  // SAS: besoin d'aide / cas mixtes / orientation nécessaire
  return "sas";
}

// Dynamic next question function
export function getNextQuestion(
  currentQuestionId: string,
  answer: string | number,
  allAnswers: OnboardingAnswers
): string | null {
  const question = ONBOARDING_TREE.questions[currentQuestionId];

  // After barriers, determine route
  if (currentQuestionId === "barriers") {
    const route = determineRoute(allAnswers);
    
    if (route === "route_a") {
      return "fle_type";
    }
    if (route === "route_b") {
      return "target_sector";
    }
    if (route === "route_c") {
      // Emploi direct: d'abord demander si satisfait du secteur
      return "sector_satisfaction";
    }
    // SAS: go to target_sector for orientation
    return "target_sector";
  }

  // After sector_satisfaction (Route C only)
  if (currentQuestionId === "sector_satisfaction") {
    const satisfactionAnswer = String(answer);
    if (satisfactionAnswer === "reconvert") {
      // Reconversion → bascule vers route B (formation)
      return "target_sector";
    }
    // Continue dans son secteur → emploi direct
    return "target_sector";
  }

  // After target_sector, route determines next step
  if (currentQuestionId === "target_sector") {
    const route = determineRoute(allAnswers);
    const wantsReconversion = allAnswers.sector_satisfaction === "reconvert";
    
    if (wantsReconversion) {
      // Reconversion: besoin de formation → route B flow
      return "training_duration";
    }
    if (route === "route_c") {
      // Emploi direct: horaires, mobilité, dispo
      return "work_schedule";
    }
    if (route === "route_b" || route === "sas") {
      return "training_duration";
    }
    return "training_duration";
  }

  // Default: follow the static nextQuestion
  return question?.nextQuestion || null;
}

// Calculate lead score (0-100)
export function calculateLeadScore(answers: OnboardingAnswers): LeadScoreBreakdown {
  let completude = 0;
  let fit = 0;
  let reactivite = 0;

  // Complétude (0-30 points)
  if (answers.contact_email) completude += 5;
  if (answers.contact_firstname && answers.contact_lastname) completude += 5;
  if (answers.location) completude += 5;
  if (answers.main_goal && answers.main_goal !== "need_help") completude += 5;
  if (answers.french_level_cecrl) completude += 5;
  if (answers.contact_48h === "yes") completude += 5;

  // Fit (0-50 points)
  const frenchLevel = answers.french_level_cecrl;
  const mainGoal = answers.main_goal;
  const workRight = answers.work_right;

  // Match niveau langue avec prérequis
  if (frenchLevel === "b1") fit += 20;
  else if (frenchLevel === "a2") fit += 15;
  else if (frenchLevel === "a1") fit += 10;
  else if (frenchLevel === "alpha") fit += 5;

  // Match zone géographique (si localisation fournie)
  if (answers.location) fit += 15;

  // Match secteur/compétences
  if (answers.target_sector || answers.fle_type) fit += 15;

  // Réactivité (0-20 points)
  if (answers.contact_48h === "yes") reactivite += 10;
  
  // Session complète (si on a l'email, on considère que c'est complet)
  if (answers.contact_email) reactivite += 10;

  // Work right bonus for Route C
  if (mainGoal === "find_job" && workRight === "yes") fit += 5;

  // Cap at max values
  completude = Math.min(completude, 30);
  fit = Math.min(fit, 50);
  reactivite = Math.min(reactivite, 20);

  return {
    completude,
    fit,
    reactivite,
    total: completude + fit + reactivite,
  };
}

// Estimate total questions based on route
export function estimateTotalQuestions(answers: OnboardingAnswers): number {
  // Base: location, main_goal, contact_48h, literacy, french_level_cecrl, work_right, barriers = 7
  // Contact: firstname, lastname, email = 3
  // Total base = 10
  let total = 10;

  const route = determineRoute(answers);

  if (route === "route_a") {
    // FLE: +2 (fle_type, fle_format)
    total += 2;
  } else if (route === "route_b") {
    // OF: +4 (target_sector, training_duration, mobility, funding_status)
    total += 4;
  } else if (route === "route_c") {
    const wantsReconversion = answers.sector_satisfaction === "reconvert";
    if (wantsReconversion) {
      // Reconversion: sector_satisfaction + target_sector + training_duration + mobility + funding_status
      total += 5;
    } else {
      // Emploi direct: sector_satisfaction + target_sector + work_schedule + mobility_km + immediate_availability
      total += 5;
    }
  } else {
    // SAS: +4 (orientation complète)
    total += 4;
  }

  return total;
}

// Helper function to get translated text
export function getTranslatedText(
  texts: Record<string, string> | undefined,
  language: string,
  fallback: string = ""
): string {
  if (!texts) return fallback;
  return texts[language] || texts["fr"] || texts["en"] || fallback;
}

// Get route label for display
export function getRouteLabel(route: LeadRoute, language: string = "fr"): { label: string; description: string; icon: string } {
  const labels: Record<LeadRoute, Record<string, { label: string; description: string; icon: string }>> = {
    route_a: {
      fr: { label: "Parcours FLE", description: "Formation en français langue étrangère", icon: "📖" },
      en: { label: "FLE Path", description: "French as a foreign language training", icon: "📖" },
    },
    route_b: {
      fr: { label: "Parcours Formation", description: "Formation professionnelle qualifiante", icon: "🎓" },
      en: { label: "Training Path", description: "Vocational training", icon: "🎓" },
    },
    route_c: {
      fr: { label: "Parcours Emploi", description: "Prêt à travailler — mise en relation directe avec employeurs", icon: "💼" },
      en: { label: "Employment Path", description: "Ready to work — direct connection with employers", icon: "💼" },
    },
    sas: {
      fr: { label: "Parcours Accompagnement", description: "Orientation et accompagnement personnalisé", icon: "🤝" },
      en: { label: "Guidance Path", description: "Personalized orientation and support", icon: "🤝" },
    },
  };

  return labels[route]?.[language] || labels[route]?.fr || { label: route, description: "", icon: "📋" };
}

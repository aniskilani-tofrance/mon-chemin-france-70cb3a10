// Localized content for the 6 recommended paths shown on ConfirmationPage.
import type { RecommendedPath } from "@/lib/orientationRouter";

export type PathIconKey =
  | "francais" | "emploi" | "formation" | "diplome" | "social" | "numerique";

export interface PathStep {
  title: string;
  desc: string;
  delay: string;
}

export interface PathContent {
  label: string;
  description: string;
  iconKey: PathIconKey;
  color: string;
  bgGradient: string;
  nextSteps: PathStep[];
}

export type PathLang = "fr" | "en" | "ar" | "es" | "pt" | "ru";

const STYLE: Record<RecommendedPath, { iconKey: PathIconKey; color: string; bgGradient: string }> = {
  francais:  { iconKey: "francais",  color: "text-blue-700 dark:text-blue-300",    bgGradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20" },
  emploi:    { iconKey: "emploi",    color: "text-green-700 dark:text-green-300",  bgGradient: "from-green-50 to-green-100/50 dark:from-green-950/40 dark:to-green-900/20" },
  formation: { iconKey: "formation", color: "text-purple-700 dark:text-purple-300",bgGradient: "from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/20" },
  diplome:   { iconKey: "diplome",   color: "text-indigo-700 dark:text-indigo-300",bgGradient: "from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/20" },
  social:    { iconKey: "social",    color: "text-amber-700 dark:text-amber-300",  bgGradient: "from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20" },
  numerique: { iconKey: "numerique", color: "text-cyan-700 dark:text-cyan-300",    bgGradient: "from-cyan-50 to-cyan-100/50 dark:from-cyan-950/40 dark:to-cyan-900/20" },
};

type PathTextBundle = Record<RecommendedPath, { label: string; description: string; nextSteps: PathStep[] }>;

const TEXT: Record<PathLang, PathTextBundle> = {
  fr: {
    francais: {
      label: "Apprendre le français",
      description: "Cours de français adaptés à votre niveau",
      nextSteps: [
        { title: "Mise en relation", desc: "Un organisme de cours de français proche de chez vous est identifié.", delay: "Sous 24h" },
        { title: "Évaluation de niveau", desc: "Un conseiller vous contacte pour évaluer votre niveau.", delay: "Sous 48h" },
        { title: "Début des cours", desc: "Vous démarrez vos cours adaptés.", delay: "Sous 2 semaines" },
      ],
    },
    emploi: {
      label: "Accès à l'emploi",
      description: "Mise en relation avec des employeurs et accompagnement à l'embauche",
      nextSteps: [
        { title: "Transmission du profil", desc: "Votre profil est partagé avec des employeurs de votre secteur.", delay: "Sous 24h" },
        { title: "Prise de contact", desc: "Un recruteur vous contacte pour un entretien.", delay: "Sous 1 semaine" },
        { title: "Accompagnement", desc: "Suivi à la prise de poste pour faciliter votre intégration.", delay: "Dès l'embauche" },
      ],
    },
    formation: {
      label: "Formation professionnelle",
      description: "Formation qualifiante ou certifiante",
      nextSteps: [
        { title: "Analyse de votre profil", desc: "Identification des formations adaptées à votre secteur.", delay: "Sous 24h" },
        { title: "Entretien d'orientation", desc: "Un organisme partenaire vous reçoit en entretien.", delay: "Sous 48h" },
        { title: "Entrée en formation", desc: "Démarrage de votre parcours de formation.", delay: "Sous 1 mois" },
      ],
    },
    diplome: {
      label: "Reconnaissance de diplôme",
      description: "Faire reconnaître vos diplômes étrangers en France",
      nextSteps: [
        { title: "Inventaire de vos diplômes", desc: "Un conseiller fait le point sur vos qualifications.", delay: "Sous 48h" },
        { title: "Procédure ENIC-NARIC", desc: "Accompagnement dans la demande d'attestation.", delay: "Sous 1 semaine" },
        { title: "Suite du parcours", desc: "Orientation vers l'emploi ou la formation complémentaire.", delay: "À réception" },
      ],
    },
    social: {
      label: "Accompagnement social et administratif",
      description: "Aide pour vos démarches et votre situation",
      nextSteps: [
        { title: "Analyse de votre situation", desc: "Un conseiller dédié étudie votre dossier.", delay: "Sous 48h" },
        { title: "Plan d'action", desc: "Vous recevez un plan adapté à vos besoins.", delay: "Sous 1 semaine" },
        { title: "Mise en relation ciblée", desc: "Orientation vers les dispositifs pertinents (logement, droits, santé).", delay: "En continu" },
      ],
    },
    numerique: {
      label: "Aide numérique",
      description: "Accompagnement aux outils numériques et démarches en ligne",
      nextSteps: [
        { title: "Identification des besoins", desc: "Un conseiller fait le point sur vos usages numériques.", delay: "Sous 48h" },
        { title: "Atelier numérique", desc: "Mise en relation avec un point d'accueil numérique près de chez vous.", delay: "Sous 1 semaine" },
        { title: "Autonomie", desc: "Vous gagnez en autonomie sur les démarches en ligne.", delay: "En continu" },
      ],
    },
  },
  en: {
    francais: { label: "Learn French", description: "French courses adapted to your level", nextSteps: [
      { title: "Introduction", desc: "A French language provider near you is identified.", delay: "Within 24h" },
      { title: "Level assessment", desc: "An advisor contacts you to assess your level.", delay: "Within 48h" },
      { title: "Start of classes", desc: "You begin classes adapted to your level.", delay: "Within 2 weeks" },
    ]},
    emploi: { label: "Access to employment", description: "Connection with employers and hiring support", nextSteps: [
      { title: "Profile shared", desc: "Your profile is shared with employers in your sector.", delay: "Within 24h" },
      { title: "First contact", desc: "A recruiter contacts you for an interview.", delay: "Within 1 week" },
      { title: "Onboarding support", desc: "Support during your first weeks on the job.", delay: "From hiring" },
    ]},
    formation: { label: "Vocational training", description: "Qualifying or certifying training", nextSteps: [
      { title: "Profile analysis", desc: "We identify training programs that match your sector.", delay: "Within 24h" },
      { title: "Orientation interview", desc: "A partner organization meets you for an interview.", delay: "Within 48h" },
      { title: "Start of training", desc: "You begin your training program.", delay: "Within 1 month" },
    ]},
    diplome: { label: "Diploma recognition", description: "Get your foreign qualifications recognized in France", nextSteps: [
      { title: "Inventory of diplomas", desc: "An advisor reviews your qualifications.", delay: "Within 48h" },
      { title: "ENIC-NARIC procedure", desc: "Support filing the recognition application.", delay: "Within 1 week" },
      { title: "Next step", desc: "Orientation toward employment or complementary training.", delay: "Upon receipt" },
    ]},
    social: { label: "Social and administrative support", description: "Help with your situation and paperwork", nextSteps: [
      { title: "Situation analysis", desc: "A dedicated advisor reviews your case.", delay: "Within 48h" },
      { title: "Action plan", desc: "You receive a plan adapted to your needs.", delay: "Within 1 week" },
      { title: "Targeted referrals", desc: "Referrals to relevant services (housing, rights, health).", delay: "Ongoing" },
    ]},
    numerique: { label: "Digital support", description: "Help with digital tools and online procedures", nextSteps: [
      { title: "Needs assessment", desc: "An advisor reviews your digital skills.", delay: "Within 48h" },
      { title: "Digital workshop", desc: "Connection with a digital help point near you.", delay: "Within 1 week" },
      { title: "Autonomy", desc: "You gain autonomy with online procedures.", delay: "Ongoing" },
    ]},
  },
  ar: {
    francais: { label: "تعلّم الفرنسية", description: "دروس فرنسية تناسب مستواكم", nextSteps: [
      { title: "ربط بمؤسسة", desc: "نحدد مؤسسة لتعليم الفرنسية قريبة منكم.", delay: "خلال 24 ساعة" },
      { title: "تقييم المستوى", desc: "يتصل بكم مستشار لتقييم مستواكم.", delay: "خلال 48 ساعة" },
      { title: "بداية الدروس", desc: "تبدأون دروسكم الملائمة.", delay: "خلال أسبوعين" },
    ]},
    emploi: { label: "الوصول إلى العمل", description: "ربط بأرباب العمل ومرافقة في التوظيف", nextSteps: [
      { title: "إرسال الملف", desc: "يتم مشاركة ملفكم مع أرباب عمل في قطاعكم.", delay: "خلال 24 ساعة" },
      { title: "أول اتصال", desc: "يتصل بكم مسؤول توظيف لإجراء مقابلة.", delay: "خلال أسبوع" },
      { title: "المرافقة", desc: "متابعة عند بداية العمل لتسهيل الاندماج.", delay: "منذ التوظيف" },
    ]},
    formation: { label: "تكوين مهني", description: "تكوين مؤهل أو معترف به", nextSteps: [
      { title: "تحليل الملف", desc: "نحدد التكوينات المناسبة لقطاعكم.", delay: "خلال 24 ساعة" },
      { title: "مقابلة توجيه", desc: "تستقبلكم مؤسسة شريكة لمقابلة.", delay: "خلال 48 ساعة" },
      { title: "بداية التكوين", desc: "تنطلقون في مسار التكوين.", delay: "خلال شهر" },
    ]},
    diplome: { label: "الاعتراف بالشهادات", description: "الاعتراف بشهاداتكم الأجنبية في فرنسا", nextSteps: [
      { title: "جرد الشهادات", desc: "يتم مراجعة مؤهلاتكم.", delay: "خلال 48 ساعة" },
      { title: "إجراء ENIC-NARIC", desc: "مرافقة في طلب شهادة المعادلة.", delay: "خلال أسبوع" },
      { title: "الخطوة التالية", desc: "توجيه نحو العمل أو تكوين تكميلي.", delay: "عند الاستلام" },
    ]},
    social: { label: "مرافقة اجتماعية وإدارية", description: "مساعدة في وضعيتكم وإجراءاتكم", nextSteps: [
      { title: "تحليل الوضعية", desc: "مستشار مخصص يدرس ملفكم.", delay: "خلال 48 ساعة" },
      { title: "خطة عمل", desc: "تتلقّون خطة تناسب احتياجاتكم.", delay: "خلال أسبوع" },
      { title: "ربط مستهدف", desc: "توجيه نحو الخدمات الملائمة (سكن، حقوق، صحة).", delay: "بشكل مستمر" },
    ]},
    numerique: { label: "مساعدة رقمية", description: "مرافقة في الأدوات الرقمية والإجراءات عبر الإنترنت", nextSteps: [
      { title: "تحديد الاحتياجات", desc: "مستشار يقيّم مهاراتكم الرقمية.", delay: "خلال 48 ساعة" },
      { title: "ورشة رقمية", desc: "ربط بمركز مساعدة رقمي قريب منكم.", delay: "خلال أسبوع" },
      { title: "الاستقلالية", desc: "تكتسبون استقلالية في الإجراءات الإلكترونية.", delay: "بشكل مستمر" },
    ]},
  },
  es: {
    francais: { label: "Aprender francés", description: "Cursos de francés adaptados a tu nivel", nextSteps: [
      { title: "Conexión", desc: "Identificamos un centro de francés cerca de ti.", delay: "En 24h" },
      { title: "Evaluación de nivel", desc: "Un asesor te contacta para evaluar tu nivel.", delay: "En 48h" },
      { title: "Inicio de clases", desc: "Comienzas tus clases adaptadas.", delay: "En 2 semanas" },
    ]},
    emploi: { label: "Acceso al empleo", description: "Conexión con empleadores y acompañamiento", nextSteps: [
      { title: "Envío del perfil", desc: "Tu perfil se comparte con empleadores de tu sector.", delay: "En 24h" },
      { title: "Primer contacto", desc: "Un reclutador te contacta para una entrevista.", delay: "En 1 semana" },
      { title: "Acompañamiento", desc: "Seguimiento al comenzar el puesto.", delay: "Desde la contratación" },
    ]},
    formation: { label: "Formación profesional", description: "Formación cualificante o certificante", nextSteps: [
      { title: "Análisis del perfil", desc: "Identificamos las formaciones adaptadas a tu sector.", delay: "En 24h" },
      { title: "Entrevista de orientación", desc: "Una entidad asociada te recibe en entrevista.", delay: "En 48h" },
      { title: "Inicio de formación", desc: "Comienzas tu programa de formación.", delay: "En 1 mes" },
    ]},
    diplome: { label: "Reconocimiento de diploma", description: "Reconoce tus diplomas extranjeros en Francia", nextSteps: [
      { title: "Inventario de diplomas", desc: "Un asesor revisa tus cualificaciones.", delay: "En 48h" },
      { title: "Procedimiento ENIC-NARIC", desc: "Acompañamiento en la solicitud.", delay: "En 1 semana" },
      { title: "Siguiente paso", desc: "Orientación hacia empleo o formación complementaria.", delay: "Al recibir" },
    ]},
    social: { label: "Acompañamiento social y administrativo", description: "Ayuda para tu situación y trámites", nextSteps: [
      { title: "Análisis de situación", desc: "Un asesor dedicado estudia tu caso.", delay: "En 48h" },
      { title: "Plan de acción", desc: "Recibes un plan adaptado a tus necesidades.", delay: "En 1 semana" },
      { title: "Derivación dirigida", desc: "Orientación a servicios pertinentes (vivienda, derechos, salud).", delay: "Continuo" },
    ]},
    numerique: { label: "Ayuda digital", description: "Acompañamiento con herramientas digitales y trámites en línea", nextSteps: [
      { title: "Evaluación de necesidades", desc: "Un asesor revisa tus competencias digitales.", delay: "En 48h" },
      { title: "Taller digital", desc: "Conexión con un punto de ayuda digital cercano.", delay: "En 1 semana" },
      { title: "Autonomía", desc: "Ganas autonomía en los trámites en línea.", delay: "Continuo" },
    ]},
  },
  pt: {
    francais: { label: "Aprender francês", description: "Aulas de francês adaptadas ao seu nível", nextSteps: [
      { title: "Conexão", desc: "Identificamos um centro de francês perto de você.", delay: "Em 24h" },
      { title: "Avaliação de nível", desc: "Um conselheiro entra em contato para avaliar seu nível.", delay: "Em 48h" },
      { title: "Início das aulas", desc: "Você começa suas aulas adaptadas.", delay: "Em 2 semanas" },
    ]},
    emploi: { label: "Acesso ao emprego", description: "Conexão com empregadores e acompanhamento", nextSteps: [
      { title: "Envio do perfil", desc: "Seu perfil é compartilhado com empregadores do seu setor.", delay: "Em 24h" },
      { title: "Primeiro contato", desc: "Um recrutador entra em contato para uma entrevista.", delay: "Em 1 semana" },
      { title: "Acompanhamento", desc: "Apoio ao iniciar o cargo.", delay: "Desde a contratação" },
    ]},
    formation: { label: "Formação profissional", description: "Formação qualificante ou certificante", nextSteps: [
      { title: "Análise do perfil", desc: "Identificamos formações adequadas ao seu setor.", delay: "Em 24h" },
      { title: "Entrevista de orientação", desc: "Uma organização parceira recebe você.", delay: "Em 48h" },
      { title: "Início da formação", desc: "Você começa seu programa de formação.", delay: "Em 1 mês" },
    ]},
    diplome: { label: "Reconhecimento de diploma", description: "Reconheça seus diplomas estrangeiros na França", nextSteps: [
      { title: "Inventário de diplomas", desc: "Um conselheiro analisa suas qualificações.", delay: "Em 48h" },
      { title: "Procedimento ENIC-NARIC", desc: "Apoio na solicitação.", delay: "Em 1 semana" },
      { title: "Próximo passo", desc: "Orientação para emprego ou formação complementar.", delay: "Ao receber" },
    ]},
    social: { label: "Acompanhamento social e administrativo", description: "Ajuda para sua situação e trâmites", nextSteps: [
      { title: "Análise da situação", desc: "Um conselheiro dedicado estuda seu caso.", delay: "Em 48h" },
      { title: "Plano de ação", desc: "Você recebe um plano adaptado.", delay: "Em 1 semana" },
      { title: "Encaminhamento direcionado", desc: "Orientação para serviços relevantes (moradia, direitos, saúde).", delay: "Contínuo" },
    ]},
    numerique: { label: "Apoio digital", description: "Acompanhamento com ferramentas digitais e trâmites online", nextSteps: [
      { title: "Avaliação de necessidades", desc: "Um conselheiro analisa suas competências digitais.", delay: "Em 48h" },
      { title: "Oficina digital", desc: "Conexão com um ponto de apoio digital próximo.", delay: "Em 1 semana" },
      { title: "Autonomia", desc: "Você ganha autonomia nos trâmites online.", delay: "Contínuo" },
    ]},
  },
  ru: {
    francais: { label: "Изучать французский", description: "Курсы французского, адаптированные к вашему уровню", nextSteps: [
      { title: "Подбор центра", desc: "Подбираем центр изучения французского рядом с вами.", delay: "В течение 24ч" },
      { title: "Оценка уровня", desc: "Консультант свяжется для оценки вашего уровня.", delay: "В течение 48ч" },
      { title: "Начало занятий", desc: "Вы начинаете занятия по вашему уровню.", delay: "В течение 2 недель" },
    ]},
    emploi: { label: "Доступ к работе", description: "Связь с работодателями и сопровождение при найме", nextSteps: [
      { title: "Передача профиля", desc: "Ваш профиль передаётся работодателям в вашем секторе.", delay: "В течение 24ч" },
      { title: "Первый контакт", desc: "Рекрутер свяжется с вами для собеседования.", delay: "В течение недели" },
      { title: "Сопровождение", desc: "Поддержка в первые недели работы.", delay: "С момента найма" },
    ]},
    formation: { label: "Профессиональное обучение", description: "Квалифицирующее или сертифицирующее обучение", nextSteps: [
      { title: "Анализ профиля", desc: "Подбираем программы по вашему сектору.", delay: "В течение 24ч" },
      { title: "Ориентационная встреча", desc: "Партнёрская организация проводит интервью.", delay: "В течение 48ч" },
      { title: "Начало обучения", desc: "Вы начинаете программу обучения.", delay: "В течение месяца" },
    ]},
    diplome: { label: "Признание диплома", description: "Признание иностранных дипломов во Франции", nextSteps: [
      { title: "Инвентаризация дипломов", desc: "Консультант рассматривает вашу квалификацию.", delay: "В течение 48ч" },
      { title: "Процедура ENIC-NARIC", desc: "Сопровождение в подаче заявки.", delay: "В течение недели" },
      { title: "Следующий шаг", desc: "Направление к работе или дополнительному обучению.", delay: "По получении" },
    ]},
    social: { label: "Социально-административное сопровождение", description: "Помощь в вашей ситуации и формальностях", nextSteps: [
      { title: "Анализ ситуации", desc: "Личный консультант изучает ваше дело.", delay: "В течение 48ч" },
      { title: "План действий", desc: "Вы получаете план под ваши потребности.", delay: "В течение недели" },
      { title: "Целевое направление", desc: "Направление к нужным службам (жильё, права, здоровье).", delay: "Постоянно" },
    ]},
    numerique: { label: "Цифровая помощь", description: "Сопровождение в цифровых инструментах и онлайн-процедурах", nextSteps: [
      { title: "Оценка потребностей", desc: "Консультант оценивает ваши цифровые навыки.", delay: "В течение 48ч" },
      { title: "Цифровой воркшоп", desc: "Подбор центра цифровой помощи рядом.", delay: "В течение недели" },
      { title: "Автономия", desc: "Вы становитесь самостоятельны в онлайн-процедурах.", delay: "Постоянно" },
    ]},
  },
};

export function getPathContent(lang: string, path: RecommendedPath): PathContent {
  const l = (TEXT[lang as PathLang] ? lang : "fr") as PathLang;
  const t = TEXT[l][path];
  const s = STYLE[path];
  return { ...t, ...s };
}

export interface ConfirmationTexts {
  title: string;
  subtitle: string;
  cta: string;
  nextStepsTitle: string;
  signupCta: string;
  contactTitle: string;
  profileTitle: string;
  primaryHeader: string;
  secondaryHeader: string;
  callbackBadge: string;
  callbackThanks: string;
  callbackBody: (phone: string) => string;
  downloadPdf: string;
  managePersonalData: string;
  fieldName: string;
  fieldEmail: string;
  fieldLocation: string;
}

export function getConfirmationTexts(lang: string): ConfirmationTexts {
  const map: Record<PathLang, ConfirmationTexts> = {
    fr: {
      title: "Votre parcours est prêt !",
      subtitle: "Nous avons analysé vos réponses et identifié les parcours les plus adaptés.",
      cta: "Retour à l'accueil",
      nextStepsTitle: "Prochaines étapes",
      signupCta: "Créer mon compte pour suivre mon dossier",
      contactTitle: "Besoin d'aide ?",
      profileTitle: "Votre profil",
      primaryHeader: "Votre parcours recommandé",
      secondaryHeader: "Aussi pertinent pour vous",
      callbackBadge: "Un conseiller vous rappelle sous 48h",
      callbackThanks: "Merci. Votre demande a bien été reçue.",
      callbackBody: (phone) => `Un conseiller parlant votre langue vous rappellera dans les 48 heures au numéro ${phone} pour vous aider à avancer. Vous n'êtes pas seul·e.`,
      downloadPdf: "Télécharger le récapitulatif PDF",
      managePersonalData: "Gérer mes données personnelles",
      fieldName: "Nom", fieldEmail: "Email", fieldLocation: "Localisation",
    },
    en: {
      title: "Your path is ready!",
      subtitle: "We've analyzed your answers and identified the best paths for you.",
      cta: "Back to home",
      nextStepsTitle: "Next steps",
      signupCta: "Create my account to track my case",
      contactTitle: "Need help?",
      profileTitle: "Your profile",
      primaryHeader: "Your recommended path",
      secondaryHeader: "Also relevant for you",
      callbackBadge: "An advisor will call you back within 48h",
      callbackThanks: "Thank you. Your request has been received.",
      callbackBody: (phone) => `An advisor speaking your language will call you back within 48 hours at ${phone}. You are not alone.`,
      downloadPdf: "Download PDF summary",
      managePersonalData: "Manage my personal data",
      fieldName: "Name", fieldEmail: "Email", fieldLocation: "Location",
    },
    ar: {
      title: "مسارك جاهز!",
      subtitle: "لقد حللنا إجاباتك وحدّدنا المسارات الأنسب لك.",
      cta: "العودة للرئيسية",
      nextStepsTitle: "الخطوات التالية",
      signupCta: "إنشاء حسابي لمتابعة ملفي",
      contactTitle: "تحتاج مساعدة؟",
      profileTitle: "ملفك الشخصي",
      primaryHeader: "مسارك المقترح",
      secondaryHeader: "أيضًا مناسب لك",
      callbackBadge: "سيتصل بك مستشار خلال 48 ساعة",
      callbackThanks: "شكرًا. تم استلام طلبك.",
      callbackBody: (phone) => `سيتصل بك مستشار يتحدث لغتك خلال 48 ساعة على الرقم ${phone}. أنت لست وحدك.`,
      downloadPdf: "تنزيل ملخص PDF",
      managePersonalData: "إدارة بياناتي الشخصية",
      fieldName: "الاسم", fieldEmail: "البريد", fieldLocation: "الموقع",
    },
    es: {
      title: "¡Tu recorrido está listo!",
      subtitle: "Analizamos tus respuestas e identificamos los recorridos más adecuados.",
      cta: "Volver al inicio",
      nextStepsTitle: "Próximos pasos",
      signupCta: "Crear mi cuenta",
      contactTitle: "¿Necesitas ayuda?",
      profileTitle: "Tu perfil",
      primaryHeader: "Tu recorrido recomendado",
      secondaryHeader: "También relevante para ti",
      callbackBadge: "Un asesor te llamará en 48h",
      callbackThanks: "Gracias. Tu solicitud ha sido recibida.",
      callbackBody: (phone) => `Un asesor que habla tu idioma te llamará en menos de 48 horas al ${phone}. No estás solo/a.`,
      downloadPdf: "Descargar resumen PDF",
      managePersonalData: "Gestionar mis datos personales",
      fieldName: "Nombre", fieldEmail: "Email", fieldLocation: "Ubicación",
    },
    pt: {
      title: "Seu percurso está pronto!",
      subtitle: "Analisamos suas respostas e identificamos os percursos mais adequados.",
      cta: "Voltar ao início",
      nextStepsTitle: "Próximos passos",
      signupCta: "Criar minha conta",
      contactTitle: "Precisa de ajuda?",
      profileTitle: "Seu perfil",
      primaryHeader: "Seu percurso recomendado",
      secondaryHeader: "Também relevante para você",
      callbackBadge: "Um conselheiro liga em até 48h",
      callbackThanks: "Obrigado. Sua solicitação foi recebida.",
      callbackBody: (phone) => `Um conselheiro que fala seu idioma ligará em até 48 horas para o número ${phone}. Você não está sozinho(a).`,
      downloadPdf: "Baixar resumo PDF",
      managePersonalData: "Gerenciar meus dados pessoais",
      fieldName: "Nome", fieldEmail: "Email", fieldLocation: "Localização",
    },
    ru: {
      title: "Ваш маршрут готов!",
      subtitle: "Мы проанализировали ответы и подобрали для вас оптимальные маршруты.",
      cta: "На главную",
      nextStepsTitle: "Следующие шаги",
      signupCta: "Создать аккаунт",
      contactTitle: "Нужна помощь?",
      profileTitle: "Ваш профиль",
      primaryHeader: "Рекомендованный маршрут",
      secondaryHeader: "Также актуально",
      callbackBadge: "Консультант перезвонит в течение 48 часов",
      callbackThanks: "Спасибо. Ваш запрос получен.",
      callbackBody: (phone) => `Консультант, говорящий на вашем языке, перезвонит в течение 48 часов по номеру ${phone}. Вы не одни.`,
      downloadPdf: "Скачать PDF",
      managePersonalData: "Управление моими данными",
      fieldName: "Имя", fieldEmail: "Email", fieldLocation: "Местоположение",
    },
  };
  return map[(map[lang as PathLang] ? lang : "fr") as PathLang];
}

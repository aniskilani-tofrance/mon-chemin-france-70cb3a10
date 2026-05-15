// Localized labels for the orientation result shown at the end of onboarding.
import type { LanguageCode } from "@/lib/translations";
import {
  ParcoursId,
  ActionId,
  AlerteCode,
  Secteur,
  PARCOURS_META,
  ACTIONS_LABELS,
  ALERTE_FR,
  OrientationResult,
} from "@/lib/orientationEngine";

type Lang = LanguageCode;

// ── Parcours (label + description) ──────────────────────────
const PARCOURS_I18N: Record<Exclude<Lang, "fr">, Record<ParcoursId, { label: string; description: string }>> = {
  en: {
    ADMIN: { label: "Administrative support", description: "Before any training or job, your administrative status must be regularized first. An advisor will help you." },
    LOGEMENT: { label: "Address & priority housing", description: "Without an administrative address, you can't register with France Travail or open your rights. We refer you to a CCAS or approved association." },
    BPI: { label: "Refugee pathway (AGIR / HOPE)", description: "As a beneficiary of international protection, you have access to enhanced programs: AGIR (24 months), HOPE (AFPA + OFII), Accelair. Easier recognition of qualifications." },
    OFII: { label: "Free OFII hours as a priority", description: "You still have unused OFII French hours: free, already funded, and required for your multi-year residence permit. Use them before any paid program." },
    INSERTION: { label: "Quick employment placement", description: "You're ready to work quickly. We refer you to in-demand jobs in your sector with targeted support." },
    FORMATION: { label: "Vocational training (TP/CQP)", description: "You want to learn a certified trade. We identify the most suitable training and available funding." },
    FRANCAIS: { label: "Professional French learning", description: "French is your priority. We propose an FLE/FOS pathway adapted to your level and project." },
    MIXTE: { label: "Mixed French + Trade pathway", description: "You want to improve your French AND train for a trade. This pathway combines both for full integration." },
    ORIENTATION: { label: "Personalized orientation", description: "You're not yet sure of your direction. A dedicated advisor will help clarify your project." },
    ECOUTE: { label: "Holistic support & specific needs", description: "You have priority needs beyond work or training (health, social, mental health). We connect you with the right partners (COMEDE, Primo Levi, PASS, CCAS)." },
    RECONNAISSANCE: { label: "Foreign diploma recognition", description: "You hold a foreign diploma. We refer you to ENIC-NARIC for recognition, and to in-demand jobs in your field accessible via short training." },
  },
  ar: {
    ADMIN: { label: "مرافقة إدارية", description: "قبل أي تدريب أو عمل، يجب تسوية وضعك الإداري أولاً. سيساعدك مستشار." },
    LOGEMENT: { label: "السكن والإقامة الإدارية أولوية", description: "بدون عنوان إداري، لا يمكنك التسجيل في France Travail أو فتح حقوقك. نوجهك إلى CCAS أو جمعية معتمدة." },
    BPI: { label: "مسار اللاجئ (AGIR / HOPE)", description: "بصفتك مستفيداً من الحماية الدولية، لديك الحق في برامج معززة: AGIR (24 شهراً)، HOPE (AFPA + OFII)، Accelair. اعتراف ميسّر بالمؤهلات." },
    OFII: { label: "ساعات OFII المجانية أولاً", description: "لا تزال لديك ساعات OFII مجانية لتعلم الفرنسية: مجانية، ممولة، وشرط لبطاقة إقامتك. استخدمها قبل أي برنامج مدفوع." },
    INSERTION: { label: "إدماج سريع في العمل", description: "أنت جاهز للعمل بسرعة. نوجهك إلى المهن المطلوبة في قطاعك مع مرافقة مستهدفة." },
    FORMATION: { label: "تدريب مهني مؤهل (TP/CQP)", description: "تريد تعلم مهنة معتمدة. نحدد التدريب الأنسب والتمويلات المتاحة." },
    FRANCAIS: { label: "تعلم الفرنسية المهنية", description: "الفرنسية أولويتك. نقترح مساراً FLE/FOS مكيفاً مع مستواك ومشروعك." },
    MIXTE: { label: "مسار مزدوج: فرنسية + مهنة", description: "تريد التقدم في الفرنسية وتعلم مهنة. يجمع هذا المسار بينهما لاندماج كامل." },
    ORIENTATION: { label: "توجيه شخصي", description: "لست متأكداً بعد من اتجاهك. مستشار مخصص سيرافقك لتوضيح مشروعك." },
    ECOUTE: { label: "مرافقة شاملة واحتياجات خاصة", description: "لديك احتياجات أولوية تتجاوز العمل أو التدريب (صحة، اجتماعي، صحة نفسية). نربطك بالمحاورين المناسبين." },
    RECONNAISSANCE: { label: "الاعتراف بالشهادات الأجنبية", description: "لديك شهادة أجنبية. نوجهك إلى ENIC-NARIC للاعتراف بها، وإلى مهن مطلوبة في مجالك متاحة عبر تدريبات قصيرة." },
  },
  es: {
    ADMIN: { label: "Acompañamiento administrativo", description: "Antes de cualquier formación o empleo, hay que regularizar tu situación administrativa. Un asesor te ayudará." },
    LOGEMENT: { label: "Domicilio y vivienda prioritaria", description: "Sin domicilio administrativo no puedes inscribirte en France Travail ni abrir tus derechos. Te orientamos a un CCAS o asociación autorizada." },
    BPI: { label: "Itinerario refugiado (AGIR / HOPE)", description: "Como beneficiario de protección internacional, accedes a programas reforzados: AGIR (24 meses), HOPE (AFPA + OFII), Accelair. Reconocimiento facilitado." },
    OFII: { label: "Horas OFII gratuitas con prioridad", description: "Aún tienes horas de francés OFII no usadas: gratis, ya financiadas, y necesarias para tu tarjeta plurianual. Úsalas antes que cualquier dispositivo pagado." },
    INSERTION: { label: "Inserción laboral rápida", description: "Estás listo para trabajar pronto. Te orientamos a empleos demandados de tu sector con acompañamiento." },
    FORMATION: { label: "Formación cualificante (TP/CQP)", description: "Quieres aprender un oficio certificado. Identificamos la formación adecuada y la financiación disponible." },
    FRANCAIS: { label: "Aprendizaje del francés profesional", description: "El francés es tu prioridad. Te proponemos un itinerario FLE/FOS adaptado a tu nivel y proyecto." },
    MIXTE: { label: "Itinerario mixto Francés + Oficio", description: "Quieres mejorar el francés Y formarte en un oficio. Este itinerario combina ambos." },
    ORIENTATION: { label: "Orientación personalizada", description: "Aún no estás seguro de tu dirección. Un asesor dedicado te acompañará para aclarar tu proyecto." },
    ECOUTE: { label: "Acompañamiento global y necesidades específicas", description: "Tienes necesidades prioritarias más allá del empleo o la formación (salud, social, salud mental). Te conectamos con los interlocutores adecuados." },
    RECONNAISSANCE: { label: "Reconocimiento de diploma extranjero", description: "Tienes un diploma extranjero. Te orientamos a ENIC-NARIC, y a empleos demandados de tu campo accesibles con formaciones cortas." },
  },
  pt: {
    ADMIN: { label: "Acompanhamento administrativo", description: "Antes de qualquer formação ou emprego, é preciso regularizar sua situação administrativa. Um conselheiro vai ajudar." },
    LOGEMENT: { label: "Domicílio e moradia prioritária", description: "Sem domicílio administrativo você não pode se inscrever no France Travail ou abrir seus direitos. Indicamos um CCAS ou associação autorizada." },
    BPI: { label: "Percurso refugiado (AGIR / HOPE)", description: "Como beneficiário de proteção internacional, você acessa programas reforçados: AGIR (24 meses), HOPE (AFPA + OFII), Accelair. Reconhecimento facilitado." },
    OFII: { label: "Horas OFII gratuitas como prioridade", description: "Você ainda tem horas de francês OFII não usadas: gratuitas, já financiadas e necessárias para seu cartão plurianual. Use-as antes de qualquer dispositivo pago." },
    INSERTION: { label: "Inserção rápida no emprego", description: "Você está pronto para trabalhar logo. Indicamos profissões em alta no seu setor com acompanhamento." },
    FORMATION: { label: "Formação qualificante (TP/CQP)", description: "Você quer aprender uma profissão certificada. Identificamos a formação adequada e o financiamento disponível." },
    FRANCAIS: { label: "Aprendizado do francês profissional", description: "O francês é sua prioridade. Propomos um percurso FLE/FOS adaptado ao seu nível e projeto." },
    MIXTE: { label: "Percurso misto Francês + Profissão", description: "Você quer melhorar o francês E se formar numa profissão. Este percurso combina ambos." },
    ORIENTATION: { label: "Orientação personalizada", description: "Você ainda não tem certeza da direção. Um conselheiro dedicado vai ajudar a esclarecer seu projeto." },
    ECOUTE: { label: "Acompanhamento global e necessidades específicas", description: "Você tem necessidades prioritárias além do emprego ou formação (saúde, social, saúde mental). Conectamos com os interlocutores certos." },
    RECONNAISSANCE: { label: "Reconhecimento de diploma estrangeiro", description: "Você tem um diploma estrangeiro. Indicamos ENIC-NARIC, e profissões em alta do seu campo acessíveis via formações curtas." },
  },
  ru: {
    ADMIN: { label: "Административное сопровождение", description: "До любого обучения или работы необходимо урегулировать административный статус. Консультант поможет." },
    LOGEMENT: { label: "Адрес и приоритетное жильё", description: "Без административного адреса невозможно зарегистрироваться во France Travail. Направляем в CCAS или утверждённую ассоциацию." },
    BPI: { label: "Путь беженца (AGIR / HOPE)", description: "Как бенефициар международной защиты, вы имеете доступ к усиленным программам: AGIR (24 мес.), HOPE (AFPA + OFII), Accelair. Облегчённое признание квалификаций." },
    OFII: { label: "Бесплатные часы OFII в приоритете", description: "У вас остались неиспользованные часы OFII: бесплатно, уже оплачено, и необходимо для многолетнего вида на жительство. Используйте до любых платных программ." },
    INSERTION: { label: "Быстрое трудоустройство", description: "Вы готовы быстро работать. Направляем на востребованные профессии в вашем секторе с сопровождением." },
    FORMATION: { label: "Квалифицирующее обучение (TP/CQP)", description: "Вы хотите освоить сертифицированную профессию. Определяем подходящее обучение и доступное финансирование." },
    FRANCAIS: { label: "Профессиональное изучение французского", description: "Французский — ваш приоритет. Предлагаем путь FLE/FOS, адаптированный к вашему уровню и проекту." },
    MIXTE: { label: "Смешанный путь Французский + Профессия", description: "Вы хотите улучшить французский И освоить профессию. Этот путь сочетает обе цели." },
    ORIENTATION: { label: "Персональная ориентация", description: "Вы ещё не уверены в направлении. Выделенный консультант поможет прояснить проект." },
    ECOUTE: { label: "Комплексное сопровождение и особые нужды", description: "У вас приоритетные нужды помимо работы или обучения (здоровье, соцпомощь, психическое здоровье). Свяжем с нужными партнёрами." },
    RECONNAISSANCE: { label: "Признание иностранного диплома", description: "У вас иностранный диплом. Направляем в ENIC-NARIC, и на востребованные профессии вашей сферы через короткие обучения." },
  },
};

// ── Actions ─────────────────────────────────────────────────
const ACTIONS_I18N: Record<Exclude<Lang, "fr">, Record<ActionId, string>> = {
  en: {
    AIDE_FRANCE_TRAVAIL: "Register with France Travail (assistance available)",
    TEST_FRANCAIS: "Take a French level test",
    RDV_CONSEILLER: "Book an appointment with an orientation advisor",
    DOSSIER_FORMATION: "Prepare the training funding application",
    MISE_EN_RELATION_OF: "Connection with a partner training organization",
    CONTACT_SOCIAL: "Referral to social support",
    CONTACT_OFII: "Activate your free OFII French hours",
    CONTACT_DOMICILIATION: "Get an address (CCAS or approved association)",
    CONTACT_AGIR: "Join the AGIR program (24-month BPI support)",
    CONTACT_SANTE_MENTALE: "Referral to psychological support (COMEDE, Primo Levi, PASS)",
    CONTACT_ENIC_NARIC: "ENIC-NARIC procedure for diploma recognition",
  },
  ar: {
    AIDE_FRANCE_TRAVAIL: "التسجيل في France Travail (مساعدة متاحة)",
    TEST_FRANCAIS: "إجراء اختبار مستوى الفرنسية",
    RDV_CONSEILLER: "حجز موعد مع مستشار توجيه",
    DOSSIER_FORMATION: "تحضير ملف تمويل التدريب",
    MISE_EN_RELATION_OF: "الربط مع مؤسسة تدريب شريكة",
    CONTACT_SOCIAL: "التوجيه نحو مرافقة اجتماعية",
    CONTACT_OFII: "تفعيل ساعات الفرنسية المجانية في OFII",
    CONTACT_DOMICILIATION: "الحصول على عنوان إداري (CCAS أو جمعية معتمدة)",
    CONTACT_AGIR: "الانضمام إلى برنامج AGIR (24 شهراً)",
    CONTACT_SANTE_MENTALE: "التوجيه نحو دعم نفسي (COMEDE، Primo Levi، PASS)",
    CONTACT_ENIC_NARIC: "إجراء ENIC-NARIC للاعتراف بالشهادة",
  },
  es: {
    AIDE_FRANCE_TRAVAIL: "Inscribirse en France Travail (ayuda disponible)",
    TEST_FRANCAIS: "Realizar una prueba de nivel de francés",
    RDV_CONSEILLER: "Pedir cita con un asesor de orientación",
    DOSSIER_FORMATION: "Preparar el expediente de financiación de la formación",
    MISE_EN_RELATION_OF: "Conexión con una entidad de formación asociada",
    CONTACT_SOCIAL: "Derivación a acompañamiento social",
    CONTACT_OFII: "Activar tus horas de francés OFII (gratuito)",
    CONTACT_DOMICILIATION: "Obtener un domicilio (CCAS o asociación autorizada)",
    CONTACT_AGIR: "Integrar el programa AGIR (acompañamiento BPI 24 meses)",
    CONTACT_SANTE_MENTALE: "Derivación a apoyo psicológico (COMEDE, Primo Levi, PASS)",
    CONTACT_ENIC_NARIC: "Procedimiento ENIC-NARIC para reconocimiento de diploma",
  },
  pt: {
    AIDE_FRANCE_TRAVAIL: "Inscrever-se no France Travail (ajuda disponível)",
    TEST_FRANCAIS: "Fazer um teste de nível de francês",
    RDV_CONSEILLER: "Marcar consulta com um conselheiro de orientação",
    DOSSIER_FORMATION: "Preparar o pedido de financiamento da formação",
    MISE_EN_RELATION_OF: "Conexão com uma organização parceira de formação",
    CONTACT_SOCIAL: "Encaminhamento para acompanhamento social",
    CONTACT_OFII: "Ativar suas horas de francês OFII (gratuito)",
    CONTACT_DOMICILIATION: "Obter um domicílio (CCAS ou associação autorizada)",
    CONTACT_AGIR: "Integrar o programa AGIR (acompanhamento BPI 24 meses)",
    CONTACT_SANTE_MENTALE: "Encaminhamento para apoio psicológico (COMEDE, Primo Levi, PASS)",
    CONTACT_ENIC_NARIC: "Procedimento ENIC-NARIC para reconhecimento de diploma",
  },
  ru: {
    AIDE_FRANCE_TRAVAIL: "Зарегистрироваться во France Travail (помощь доступна)",
    TEST_FRANCAIS: "Пройти тест уровня французского",
    RDV_CONSEILLER: "Записаться к консультанту по ориентации",
    DOSSIER_FORMATION: "Подготовить заявку на финансирование обучения",
    MISE_EN_RELATION_OF: "Связь с партнёрской обучающей организацией",
    CONTACT_SOCIAL: "Направление к социальному сопровождению",
    CONTACT_OFII: "Активировать бесплатные часы OFII",
    CONTACT_DOMICILIATION: "Получить адрес (CCAS или утв. ассоциация)",
    CONTACT_AGIR: "Войти в программу AGIR (BPI, 24 месяца)",
    CONTACT_SANTE_MENTALE: "Направление к психологической поддержке (COMEDE, Primo Levi, PASS)",
    CONTACT_ENIC_NARIC: "Процедура ENIC-NARIC для признания диплома",
  },
};

// ── Alertes ─────────────────────────────────────────────────
const ALERTES_I18N: Record<Exclude<Lang, "fr">, Record<AlerteCode, string>> = {
  en: {
    LOGEMENT_NO_DOMICILIATION: "🏠 Without an administrative address, France Travail / CAF / bank registration is impossible. Priority referral to a CCAS or approved association.",
    ADMIN_WORK_RIGHT_NONE: "⚠️ Right to work not established — administrative orientation required before any step.",
    ADMIN_WORK_RIGHT_UNCERTAIN: "⚠️ Right to work uncertain — verification needed before orientation.",
    BPI_DETECTED: "🛡️ BPI status detected: you are eligible for enhanced programs AGIR (24 months), HOPE (AFPA + OFII) and Accelair. Easier qualifications recognition.",
    RECONNAISSANCE_DIPLOMA: "🎖️ Diploma recognition: ENIC-NARIC procedure to start. In parallel, in-demand jobs may be reachable via short training.",
    RECONNAISSANCE_RECONVERSION: "🔄 Reconversion requested — orientation support is a priority.",
    FRANCE_TRAVAIL_REQUIRED: "📌 France Travail registration required to unlock training funding.",
    LEVEL_ALPHA: "📚 Alpha level detected (literacy): a dedicated pathway is essential BEFORE any classic FLE.",
    LEVEL_A0A1: "📌 A0/A1 level detected: an FLE/FOS pathway is essential before any vocational training.",
    OFII_AVAILABLE: "🇫🇷 OFII hours available: use them as PRIORITY before any paid CPF FLE (free, already funded).",
    SANTE_MENTALE_NEEDED: "💚 Need for psychological support reported: referral to COMEDE / Primo Levi / PASS (free).",
    CONSTRAINTS_MULTIPLE: "ℹ️ Multiple constraints identified (mobility, childcare…) — to factor into matching.",
    FEMALE_TRAINER_PREF: "👩 Female trainer preference indicated — to be respected in matching.",
    NO_CHILDCARE: "👶 No childcare arrangement — major training barrier. Referral to AVIP nurseries / partner daycare.",
  },
  ar: {
    LOGEMENT_NO_DOMICILIATION: "🏠 بدون عنوان إداري، يستحيل التسجيل في France Travail / CAF / البنك. توجيه أولوي إلى CCAS أو جمعية معتمدة.",
    ADMIN_WORK_RIGHT_NONE: "⚠️ حق العمل غير مثبت — التوجيه الإداري إلزامي قبل أي خطوة.",
    ADMIN_WORK_RIGHT_UNCERTAIN: "⚠️ حق العمل غير مؤكد — يلزم التحقق قبل التوجيه.",
    BPI_DETECTED: "🛡️ تم رصد وضع BPI: أنت مؤهل لبرامج معززة AGIR (24 شهراً)، HOPE وAccelair.",
    RECONNAISSANCE_DIPLOMA: "🎖️ الاعتراف بالشهادة: ابدأ إجراء ENIC-NARIC. بالموازاة، مهن مطلوبة قد تكون متاحة عبر تدريبات قصيرة.",
    RECONNAISSANCE_RECONVERSION: "🔄 إعادة التوجيه المهني مطلوبة — مرافقة توجيه أولوية.",
    FRANCE_TRAVAIL_REQUIRED: "📌 التسجيل في France Travail مطلوب لفتح تمويلات التدريب.",
    LEVEL_ALPHA: "📚 مستوى Alpha مرصود (محو الأمية): مسار مخصص ضروري قبل أي FLE كلاسيكي.",
    LEVEL_A0A1: "📌 مستوى A0/A1 مرصود: مسار FLE/FOS ضروري قبل أي تكوين مهني.",
    OFII_AVAILABLE: "🇫🇷 ساعات OFII متاحة: استخدمها أولاً قبل أي FLE مدفوع (مجانية، ممولة).",
    SANTE_MENTALE_NEEDED: "💚 حاجة للدعم النفسي مرصودة: توجيه إلى COMEDE / Primo Levi / PASS (مجاني).",
    CONSTRAINTS_MULTIPLE: "ℹ️ قيود متعددة مرصودة (تنقل، رعاية أطفال…) — تؤخذ بعين الاعتبار عند الربط.",
    FEMALE_TRAINER_PREF: "👩 تفضيل مدربة امرأة — يُحترم عند الربط.",
    NO_CHILDCARE: "👶 لا توجد رعاية أطفال — عائق كبير للتدريب. توجيه إلى حضانات شريكة.",
  },
  es: {
    LOGEMENT_NO_DOMICILIATION: "🏠 Sin domicilio administrativo, es imposible inscribirse en France Travail / CAF / banco. Derivación prioritaria a un CCAS o asociación autorizada.",
    ADMIN_WORK_RIGHT_NONE: "⚠️ Derecho a trabajar no establecido — orientación administrativa obligatoria antes de cualquier paso.",
    ADMIN_WORK_RIGHT_UNCERTAIN: "⚠️ Derecho a trabajar incierto — se requiere verificación antes de la orientación.",
    BPI_DETECTED: "🛡️ Estatus BPI detectado: eres elegible para los programas reforzados AGIR (24 meses), HOPE y Accelair.",
    RECONNAISSANCE_DIPLOMA: "🎖️ Reconocimiento de diploma: iniciar el procedimiento ENIC-NARIC. En paralelo, empleos demandados pueden ser accesibles vía formación corta.",
    RECONNAISSANCE_RECONVERSION: "🔄 Reconversión deseada — acompañamiento de orientación prioritario.",
    FRANCE_TRAVAIL_REQUIRED: "📌 Inscripción en France Travail necesaria para desbloquear financiaciones de formación.",
    LEVEL_ALPHA: "📚 Nivel Alpha detectado (alfabetización): un itinerario dedicado es indispensable ANTES de cualquier FLE clásico.",
    LEVEL_A0A1: "📌 Nivel A0/A1 detectado: un itinerario FLE/FOS es indispensable antes de cualquier formación profesional.",
    OFII_AVAILABLE: "🇫🇷 Horas OFII disponibles: a usar PRIORITARIAMENTE antes de cualquier FLE de pago (gratis, ya financiado).",
    SANTE_MENTALE_NEEDED: "💚 Necesidad de apoyo psicológico señalada: derivación a COMEDE / Primo Levi / PASS (gratis).",
    CONSTRAINTS_MULTIPLE: "ℹ️ Múltiples restricciones identificadas (movilidad, cuidado infantil…) — a tener en cuenta.",
    FEMALE_TRAINER_PREF: "👩 Preferencia por formadora indicada — a respetar.",
    NO_CHILDCARE: "👶 Sin cuidado infantil — gran barrera para la formación. Derivación a guarderías AVIP / asociadas.",
  },
  pt: {
    LOGEMENT_NO_DOMICILIATION: "🏠 Sem domicílio administrativo, é impossível se inscrever no France Travail / CAF / banco. Encaminhamento prioritário para CCAS ou associação autorizada.",
    ADMIN_WORK_RIGHT_NONE: "⚠️ Direito de trabalho não estabelecido — orientação administrativa obrigatória antes de qualquer passo.",
    ADMIN_WORK_RIGHT_UNCERTAIN: "⚠️ Direito de trabalho incerto — verificação necessária antes da orientação.",
    BPI_DETECTED: "🛡️ Status BPI detectado: você é elegível para programas reforçados AGIR (24 meses), HOPE e Accelair.",
    RECONNAISSANCE_DIPLOMA: "🎖️ Reconhecimento de diploma: iniciar o procedimento ENIC-NARIC. Em paralelo, profissões em alta podem ser acessíveis via formação curta.",
    RECONNAISSANCE_RECONVERSION: "🔄 Reconversão desejada — acompanhamento de orientação prioritário.",
    FRANCE_TRAVAIL_REQUIRED: "📌 Inscrição no France Travail necessária para desbloquear financiamentos de formação.",
    LEVEL_ALPHA: "📚 Nível Alpha detectado (alfabetização): um percurso dedicado é indispensável ANTES de qualquer FLE clássico.",
    LEVEL_A0A1: "📌 Nível A0/A1 detectado: um percurso FLE/FOS é indispensável antes de qualquer formação profissional.",
    OFII_AVAILABLE: "🇫🇷 Horas OFII disponíveis: use-as PRIORITARIAMENTE antes de qualquer FLE pago (grátis, já financiado).",
    SANTE_MENTALE_NEEDED: "💚 Necessidade de apoio psicológico sinalizada: encaminhamento para COMEDE / Primo Levi / PASS (grátis).",
    CONSTRAINTS_MULTIPLE: "ℹ️ Múltiplas restrições identificadas (mobilidade, guarda de crianças…) — a considerar.",
    FEMALE_TRAINER_PREF: "👩 Preferência por formadora indicada — a respeitar.",
    NO_CHILDCARE: "👶 Sem guarda de crianças — grande barreira para a formação. Encaminhamento para creches parceiras.",
  },
  ru: {
    LOGEMENT_NO_DOMICILIATION: "🏠 Без административного адреса невозможна регистрация во France Travail / CAF / банке. Приоритетное направление в CCAS или утв. ассоциацию.",
    ADMIN_WORK_RIGHT_NONE: "⚠️ Право на работу не установлено — административная ориентация обязательна перед любыми шагами.",
    ADMIN_WORK_RIGHT_UNCERTAIN: "⚠️ Право на работу неясно — нужна проверка перед ориентацией.",
    BPI_DETECTED: "🛡️ Обнаружен статус BPI: вы имеете право на усиленные программы AGIR (24 мес.), HOPE и Accelair.",
    RECONNAISSANCE_DIPLOMA: "🎖️ Признание диплома: начать процедуру ENIC-NARIC. Параллельно — востребованные профессии могут быть доступны через короткое обучение.",
    RECONNAISSANCE_RECONVERSION: "🔄 Нужна смена сферы — приоритетное сопровождение по ориентации.",
    FRANCE_TRAVAIL_REQUIRED: "📌 Регистрация во France Travail требуется для разблокировки финансирования обучения.",
    LEVEL_ALPHA: "📚 Обнаружен уровень Alpha (грамотность): нужен отдельный путь ДО любого классического FLE.",
    LEVEL_A0A1: "📌 Обнаружен уровень A0/A1: путь FLE/FOS необходим до любого профессионального обучения.",
    OFII_AVAILABLE: "🇫🇷 Доступны часы OFII: используйте ИХ В ПЕРВУЮ ОЧЕРЕДЬ до любого платного FLE (бесплатно, оплачено).",
    SANTE_MENTALE_NEEDED: "💚 Заявлена потребность в психологической поддержке: направление в COMEDE / Primo Levi / PASS (бесплатно).",
    CONSTRAINTS_MULTIPLE: "ℹ️ Выявлено несколько ограничений (мобильность, уход за детьми…) — учесть при подборе.",
    FEMALE_TRAINER_PREF: "👩 Указано предпочтение преподавательницы-женщины — учесть при подборе.",
    NO_CHILDCARE: "👶 Нет ухода за детьми — серьёзный барьер для обучения. Направление в партнёрские ясли.",
  },
};

// ── Score labels ────────────────────────────────────────────
const SCORE_I18N: Record<Lang, Record<OrientationResult["scoreLabel"], string>> = {
  fr: { Froid: "Froid", Tiède: "Tiède", Chaud: "Chaud", "Très chaud": "Très chaud" },
  en: { Froid: "Cold", Tiède: "Warm", Chaud: "Hot", "Très chaud": "Very hot" },
  ar: { Froid: "بارد", Tiède: "فاتر", Chaud: "ساخن", "Très chaud": "ساخن جداً" },
  es: { Froid: "Frío", Tiède: "Tibio", Chaud: "Caliente", "Très chaud": "Muy caliente" },
  pt: { Froid: "Frio", Tiède: "Morno", Chaud: "Quente", "Très chaud": "Muito quente" },
  ru: { Froid: "Холодный", Tiède: "Тёплый", Chaud: "Горячий", "Très chaud": "Очень горячий" },
};

// ── Métiers (label translation) ─────────────────────────────
const METIER_I18N: Record<Exclude<Lang, "fr">, Record<Secteur, string>> = {
  en: {
    logistique: "Order picker",
    proprete: "Cleaning & hygiene agent",
    aide_personne: "Family life assistant (ADVF)",
    restauration: "Multi-skilled restaurant employee",
    commerce: "Multi-skilled retail employee",
    btp: "Multi-skilled construction worker",
    nsp: "To define with an advisor",
  },
  ar: {
    logistique: "محضّر(ة) طلبيات",
    proprete: "عامل(ة) نظافة وصحة",
    aide_personne: "مساعد(ة) معيشة للعائلات (ADVF)",
    restauration: "موظف(ة) مطعم متعدد المهام",
    commerce: "موظف(ة) تجارة متعدد المهام",
    btp: "عامل(ة) بناء متعدد المهام",
    nsp: "يُحدَّد مع مستشار",
  },
  es: {
    logistique: "Preparador(a) de pedidos",
    proprete: "Agente de limpieza e higiene",
    aide_personne: "Asistente de vida familiar (ADVF)",
    restauration: "Empleado(a) polivalente de restauración",
    commerce: "Empleado(a) polivalente de comercio",
    btp: "Obrero(a) polivalente de construcción",
    nsp: "Por definir con un asesor",
  },
  pt: {
    logistique: "Preparador(a) de pedidos",
    proprete: "Agente de limpeza e higiene",
    aide_personne: "Assistente de vida familiar (ADVF)",
    restauration: "Empregado(a) polivalente de restauração",
    commerce: "Empregado(a) polivalente de comércio",
    btp: "Operário(a) polivalente de construção",
    nsp: "A definir com um conselheiro",
  },
  ru: {
    logistique: "Сборщик(ца) заказов",
    proprete: "Сотрудник(ца) клининга и гигиены",
    aide_personne: "Помощник(ца) семейной жизни (ADVF)",
    restauration: "Универсальный(ая) сотрудник(ца) ресторана",
    commerce: "Универсальный(ая) сотрудник(ца) торговли",
    btp: "Универсальный(ая) рабочий(ая) стройки",
    nsp: "Определяется с консультантом",
  },
};

// ── Public helpers ──────────────────────────────────────────
export function tParcoursLabel(lang: Lang, id: ParcoursId): string {
  const meta = PARCOURS_META[id];
  if (lang === "fr") return `${meta.emoji} ${meta.label}`;
  return `${meta.emoji} ${PARCOURS_I18N[lang][id].label}`;
}

export function tParcoursDescription(lang: Lang, id: ParcoursId): string {
  if (lang === "fr") return PARCOURS_META[id].description;
  return PARCOURS_I18N[lang][id].description;
}

export function tAction(lang: Lang, id: ActionId): string {
  if (lang === "fr") return ACTIONS_LABELS[id];
  return ACTIONS_I18N[lang][id];
}

export function tAlerte(lang: Lang, code: AlerteCode): string {
  if (lang === "fr") return ALERTE_FR[code];
  return ALERTES_I18N[lang][code];
}

export function tScoreLabel(lang: Lang, label: OrientationResult["scoreLabel"]): string {
  return SCORE_I18N[lang][label];
}

export function tMetierLabel(lang: Lang, secteur: Secteur, frLabel: string): string {
  if (lang === "fr") return frLabel;
  return METIER_I18N[lang][secteur] || frLabel;
}

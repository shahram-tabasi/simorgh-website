// Hand-written texts for the header, navigation and home hero, per language.
// Kept apart from i18n.tsx (a client module) so server code can read them too.
import { languages } from './data/site';

export type Locale = (typeof languages)[number]['code'];

export type Dictionary = {
  nav: Record<string, string>;
  common: Record<string, string>;
  hero: {
    eyebrow: string;
    headline: string;
    accent: string;
    subtitle: string;
    primary: string;
    secondary: string;
    kicker: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    nav: { Products: 'Products', Solutions: 'Solutions', Industries: 'Industries', Technology: 'Technology', Insights: 'Insights', Company: 'Company' },
    common: { requestDemo: 'Request Demo', exploreTechnology: 'Explore Our Technology', exploreProducts: 'Explore Products', home: 'Home' },
    hero: {
      eyebrow: 'SIMORGH INTELLIGENT TECHNOLOGY',
      headline: 'Engineering Intelligence',
      accent: 'for a Smarter World',
      subtitle: 'AI-powered software, intelligent engineering systems, digital twins and smart infrastructure for industry, utilities and cities.',
      primary: 'Explore Our Technology',
      secondary: 'Explore Products',
      kicker: 'AI · INDUSTRY · DIGITAL TWIN · SMART GRID'
    }
  },
  fa: {
    nav: { Products: 'محصولات', Solutions: 'راهکارها', Industries: 'صنایع', Technology: 'فناوری', Insights: 'مقالات', Company: 'درباره ما' },
    common: { requestDemo: 'درخواست دمو', exploreTechnology: 'فناوری سیمرغ', exploreProducts: 'مشاهده محصولات', home: 'خانه' },
    hero: {
      eyebrow: 'فناوری هوشمند سیمرغ',
      headline: 'هوشمندی مهندسی',
      accent: 'برای جهانی هوشمندتر',
      subtitle: 'نرم‌افزارهای مبتنی بر هوش مصنوعی، سیستم‌های مهندسی هوشمند، دوقلوی دیجیتال و زیرساخت هوشمند برای صنعت، انرژی و شهرها.',
      primary: 'فناوری سیمرغ',
      secondary: 'مشاهده محصولات',
      kicker: 'هوش مصنوعی · صنعت · دوقلوی دیجیتال · شبکه هوشمند'
    }
  },
  ar: {
    nav: { Products: 'المنتجات', Solutions: 'الحلول', Industries: 'الصناعات', Technology: 'التقنية', Insights: 'المقالات', Company: 'الشركة' },
    common: { requestDemo: 'طلب عرض تجريبي', exploreTechnology: 'استكشف تقنيتنا', exploreProducts: 'استكشف المنتجات', home: 'الرئيسية' },
    hero: {
      eyebrow: 'تقنية سيمورغ الذكية',
      headline: 'ذكاء هندسي',
      accent: 'لعالم أكثر ذكاءً',
      subtitle: 'برمجيات مدعومة بالذكاء الاصطناعي وأنظمة هندسية ذكية وتوائم رقمية وبنية تحتية ذكية للصناعة والطاقة والمدن.',
      primary: 'استكشف تقنيتنا',
      secondary: 'استكشف المنتجات',
      kicker: 'الذكاء الاصطناعي · الصناعة · التوأم الرقمي · الشبكة الذكية'
    }
  },
  tr: {
    nav: { Products: 'Ürünler', Solutions: 'Çözümler', Industries: 'Sektörler', Technology: 'Teknoloji', Insights: 'İçgörüler', Company: 'Şirket' },
    common: { requestDemo: 'Demo Talep Et', exploreTechnology: 'Teknolojimizi Keşfet', exploreProducts: 'Ürünleri Keşfet', home: 'Ana Sayfa' },
    hero: {
      eyebrow: 'SIMORGH AKILLI TEKNOLOJİ', headline: 'Mühendislik Zekâsı', accent: 'Daha Akıllı Bir Dünya İçin',
      subtitle: 'Endüstri, enerji ve şehirler için yapay zekâ destekli yazılım, akıllı mühendislik sistemleri, dijital ikizler ve akıllı altyapı.', primary: 'Teknolojimizi Keşfet', secondary: 'Ürünleri Keşfet', kicker: 'YAPAY ZEKÂ · ENDÜSTRİ · DİJİTAL İKİZ · AKILLI ŞEBEKE'
    }
  },
  de: {
    nav: { Products: 'Produkte', Solutions: 'Lösungen', Industries: 'Branchen', Technology: 'Technologie', Insights: 'Insights', Company: 'Unternehmen' },
    common: { requestDemo: 'Demo anfragen', exploreTechnology: 'Technologie entdecken', exploreProducts: 'Produkte entdecken', home: 'Startseite' },
    hero: {
      eyebrow: 'SIMORGH INTELLIGENTE TECHNOLOGIE', headline: 'Engineering Intelligence', accent: 'für eine intelligentere Welt',
      subtitle: 'KI-gestützte Software, intelligente Engineering-Systeme, digitale Zwillinge und smarte Infrastruktur für Industrie, Energie und Städte.', primary: 'Technologie entdecken', secondary: 'Produkte entdecken', kicker: 'KI · INDUSTRIE · DIGITALER ZWILLING · SMART GRID'
    }
  },
  fr: {
    nav: { Products: 'Produits', Solutions: 'Solutions', Industries: 'Industries', Technology: 'Technologie', Insights: 'Analyses', Company: 'Entreprise' },
    common: { requestDemo: 'Demander une démo', exploreTechnology: 'Découvrir notre technologie', exploreProducts: 'Découvrir les produits', home: 'Accueil' },
    hero: {
      eyebrow: 'TECHNOLOGIE INTELLIGENTE SIMORGH', headline: 'Intelligence d’ingénierie', accent: 'pour un monde plus intelligent',
      subtitle: 'Logiciels alimentés par l’IA, systèmes d’ingénierie intelligents, jumeaux numériques et infrastructures intelligentes pour l’industrie, l’énergie et les villes.', primary: 'Découvrir notre technologie', secondary: 'Découvrir les produits', kicker: 'IA · INDUSTRIE · JUMEAU NUMÉRIQUE · SMART GRID'
    }
  },
  es: {
    nav: { Products: 'Productos', Solutions: 'Soluciones', Industries: 'Industrias', Technology: 'Tecnología', Insights: 'Perspectivas', Company: 'Empresa' },
    common: { requestDemo: 'Solicitar demo', exploreTechnology: 'Explorar tecnología', exploreProducts: 'Explorar productos', home: 'Inicio' },
    hero: {
      eyebrow: 'TECNOLOGÍA INTELIGENTE SIMORGH', headline: 'Inteligencia de ingeniería', accent: 'para un mundo más inteligente',
      subtitle: 'Software impulsado por IA, sistemas de ingeniería inteligentes, gemelos digitales e infraestructura inteligente para industria, energía y ciudades.', primary: 'Explorar tecnología', secondary: 'Explorar productos', kicker: 'IA · INDUSTRIA · GEMELO DIGITAL · SMART GRID'
    }
  },
  zh: {
    nav: { Products: '产品', Solutions: '解决方案', Industries: '行业', Technology: '技术', Insights: '洞察', Company: '公司' },
    common: { requestDemo: '申请演示', exploreTechnology: '探索技术', exploreProducts: '探索产品', home: '首页' },
    hero: {
      eyebrow: 'SIMORGH 智能科技', headline: '工程智能', accent: '让世界更加智能',
      subtitle: '面向工业、能源与城市的人工智能软件、智能工程系统、数字孪生与智能基础设施。', primary: '探索我们的技术', secondary: '探索产品', kicker: '人工智能 · 工业 · 数字孪生 · 智能电网'
    }
  },
  ja: {
    nav: { Products: '製品', Solutions: 'ソリューション', Industries: '産業', Technology: 'テクノロジー', Insights: 'インサイト', Company: '会社情報' },
    common: { requestDemo: 'デモを依頼', exploreTechnology: '技術を見る', exploreProducts: '製品を見る', home: 'ホーム' },
    hero: {
      eyebrow: 'SIMORGH インテリジェントテクノロジー', headline: 'エンジニアリング・インテリジェンス', accent: 'よりスマートな世界へ',
      subtitle: '産業、エネルギー、都市のためのAIソフトウェア、スマートエンジニアリング、デジタルツイン、スマートインフラ。', primary: '技術を見る', secondary: '製品を見る', kicker: 'AI · 産業 · デジタルツイン · スマートグリッド'
    }
  },
  ru: {
    nav: { Products: 'Продукты', Solutions: 'Решения', Industries: 'Отрасли', Technology: 'Технологии', Insights: 'Статьи', Company: 'Компания' },
    common: { requestDemo: 'Запросить демо', exploreTechnology: 'Изучить технологии', exploreProducts: 'Изучить продукты', home: 'Главная' },
    hero: {
      eyebrow: 'ИНТЕЛЛЕКТУАЛЬНЫЕ ТЕХНОЛОГИИ SIMORGH', headline: 'Инженерный интеллект', accent: 'для более умного мира',
      subtitle: 'ПО на базе ИИ, интеллектуальные инженерные системы, цифровые двойники и умная инфраструктура для промышленности, энергетики и городов.', primary: 'Изучить технологии', secondary: 'Изучить продукты', kicker: 'ИИ · ПРОМЫШЛЕННОСТЬ · ЦИФРОВОЙ ДВОЙНИК · SMART GRID'
    }
  }
};

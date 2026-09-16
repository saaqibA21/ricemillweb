// src/store/languageStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'ta';

interface LanguageState {
  lang: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      lang: 'en',
      setLanguage: (lang) => set({ lang }),
      toggleLanguage: () => set((state) => ({ lang: state.lang === 'en' ? 'ta' : 'en' })),
    }),
    {
      name: 'ricemill_lang',
    }
  )
);

export const translations: Record<string, { en: string; ta: string }> = {
  // Navigation
  'nav.shop': { en: 'Shop', ta: 'கடை' },
  'nav.wholesale': { en: 'Wholesale', ta: 'மொத்த வியாபாரம்' },
  'nav.export': { en: 'Export', ta: 'ஏற்றுமதி' },
  'nav.about': { en: 'About Us', ta: 'எங்களைப் பற்றி' },
  'nav.contact': { en: 'Contact', ta: 'தொடர்புகொள்ள' },
  'nav.cart': { en: 'Cart', ta: 'கூடை' },
  'nav.account': { en: 'Account', ta: 'கணக்கு' },
  'nav.login': { en: 'Login', ta: 'உள்நுழைக' },
  'nav.searchPlaceholder': { en: 'Search rice varieties, brands...', ta: 'அரிசி ரகங்களைத் தேடுக...' },
  'nav.searchBtn': { en: 'Search', ta: 'தேடுக' },
  'nav.tagline': { en: 'RICE • ஆரோக்கியமான வாழ்வு', ta: 'அரிசி • ஆரோக்கியமான வாழ்வு' },

  // Hero Section
  'hero.badge': {
    en: '🌾 DIRECT FROM RICE MILL • 100% PURE & NATURAL',
    ta: '🌾 நெல் ஆலையிலிருந்து நேரடியாக • 100% இயற்கை',
  },
  'hero.title': {
    en: 'Pure, Fresh Rice Direct From Our Mill',
    ta: 'எங்கள் ஆலையிலிருந்து நேரடியாக தூய்மையான புதிய அரிசி',
  },
  'hero.subtitle': {
    en: 'Delivering authentic Tamil Nadu Ponni, Basmati, Sona Masoori, and traditional heritage rice varieties directly to your home with guaranteed quality.',
    ta: 'பாரம்பரிய தமிழ்நாடு பொன்னி, பாஸ்மதி, சோனா மசூரி மற்றும் பாரம்பரிய அரிசி வகைகளை உங்களின் இல்லத்திற்கே நேரடியாக சேர்க்கிறோம்.',
  },
  'hero.shopNow': { en: 'Shop Rice Now', ta: 'அரிசியை வாங்க' },
  'hero.wholesaleBtn': { en: 'Wholesale Inquiry', ta: 'மொத்த ஆர்டர் செய்ய' },
  'hero.stat1': { en: 'Years Experience', ta: 'ஆண்டுகள் பாரம்பரியம்' },
  'hero.stat2': { en: 'Satisfied Families', ta: 'மகிழ்ச்சியான குடும்பங்கள்' },
  'hero.stat3': { en: 'Quality Checked', ta: 'தரமான ரகங்கள்' },
  'hero.stat4': { en: 'FSSAI Certified', ta: 'சான்றளிக்கப்பட்ட பாதுகாப்பு' },

  // Categories & Features
  'cat.title': { en: 'Explore Our Varieties', ta: 'எங்கள் அரிசி ரகங்கள்' },
  'cat.subtitle': { en: 'Carefully processed for nutrition, aroma, and taste', ta: 'சத்து மற்றும் நறுமணம் மாறாமல் தயாரிக்கப்படுகிறது' },
  'cat.basmati': { en: 'Basmati Rice', ta: 'பாஸ்மதி அரிசி' },
  'cat.ponni': { en: 'Ponni Rice', ta: 'பொன்னி அரிசி' },
  'cat.heritage': { en: 'Heritage & Red Rice', ta: 'பாரம்பரிய & சிவப்பு அரிசி' },
  'cat.raw': { en: 'Raw & Idli Rice', ta: 'பச்சரிசி & இட்லி அரிசி' },
  'cat.viewAll': { en: 'View All', ta: 'அனைத்தையும் பார்க்க' },

  // Common UI Buttons & Labels
  'btn.addToCart': { en: 'Add to Cart', ta: 'கூடையில் சேர்க்க' },
  'btn.buyNow': { en: 'Buy Now', ta: 'இப்போதே வாங்க' },
  'btn.viewDetails': { en: 'View Details', ta: 'விவரங்களை பார்க்க' },
  'btn.inquire': { en: 'Send Inquiry', ta: 'விசாரிக்க' },
  'btn.chatWhatsapp': { en: 'Chat on WhatsApp', ta: 'வாட்ஸ்அப்பில் உரையாட' },
  'btn.continueShopping': { en: 'Continue Shopping', ta: 'மேலும் பொருட்களை பார்க்க' },
  'btn.trackOrder': { en: 'Track Order', ta: 'ஆர்டரை பின்தொடர' },

  // Footer
  'footer.quickLinks': { en: 'Quick Links', ta: 'விரைவு இணைப்புகள்' },
  'footer.policies': { en: 'Policies', ta: 'கொள்கைகள்' },
  'footer.getInTouch': { en: 'Get In Touch', ta: 'தொடர்பு கொள்ள' },
  'footer.rights': { en: 'All rights reserved.', ta: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.' },
  'footer.desc': {
    en: 'From paddy fields to your kitchen — delivering the finest rice varieties since 1981. FSSAI Certified. ISO 22000. Trusted by 50,000+ families.',
    ta: 'வயல்வெளியில் இருந்து உங்கள் சமையலறை வரை — 1981 முதல் சிறந்த அரிசி வகைகளை வழங்குகிறோம். FSSAI சான்றளிக்கப்பட்டது.',
  },

  // Contact Page
  'contact.pageTitle': { en: 'Contact Us', ta: 'எங்களைத் தொடர்பு கொள்ள' },
  'contact.getInTouch': { en: 'Get In Touch', ta: 'தொடர்பில் இருங்கள்' },
  'contact.callUs': { en: 'Call Us', ta: 'அழைக்கவும்' },
  'contact.emailUs': { en: 'Email Us', ta: 'மின்னஞ்சல் அனுப்புக' },
  'contact.visitUs': { en: 'Visit Us', ta: 'நேரில் வர' },
  'contact.hours': { en: 'Business Hours', ta: 'இயங்கும் நேரங்கள்' },
  'contact.sendMsg': { en: 'Send a Message', ta: 'செய்தி அனுப்ப' },
  'contact.nameLabel': { en: 'Your Name', ta: 'உங்கள் பெயர்' },
  'contact.phoneLabel': { en: 'Phone', ta: 'கைபேசி எண்' },
  'contact.emailLabel': { en: 'Email', ta: 'மின்னஞ்சல்' },
  'contact.subjectLabel': { en: 'Subject', ta: 'தலைப்பு' },
  'contact.msgLabel': { en: 'Message', ta: 'செய்தி' },
  'contact.submitBtn': { en: 'Send Message', ta: 'செய்தியை அனுப்புக' },
};

export function useTranslation() {
  const { lang, toggleLanguage, setLanguage } = useLanguageStore();

  const t = (key: string, fallback?: string): string => {
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }
    return fallback || key;
  };

  return { t, lang, toggleLanguage, setLanguage };
}

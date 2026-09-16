// src/components/layout/LanguageToggle.tsx
import { Globe } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, toggleLanguage } = useLanguageStore();

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={`inline-flex items-center gap-1.5 bg-[#1a2e1a] border border-[#d4a017]/40 hover:border-[#d4a017] text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[#d4a017]/10 ${className}`}
      title={lang === 'en' ? 'Switch to Tamil (தமிழ்)' : 'Switch to English'}
      aria-label="Toggle language"
    >
      <Globe className="w-3.5 h-3.5 text-[#d4a017]" />
      <span className="flex items-center gap-1">
        <span className={lang === 'en' ? 'text-[#d4a017] font-bold' : 'text-gray-400'}>EN</span>
        <span className="text-gray-500">/</span>
        <span className={lang === 'ta' ? 'text-[#d4a017] font-bold' : 'text-gray-400'}>தமிழ்</span>
      </span>
    </button>
  );
}

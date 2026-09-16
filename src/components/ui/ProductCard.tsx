// src/components/ui/ProductCard.tsx
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useTranslation } from '../../store/languageStore';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
}

const badgeTranslations: Record<string, string> = {
  'Premium': 'பிரீமியம்',
  'Aged 12M': '12M பழமையானது',
  'FSSAI Certified': 'FSSAI சான்று',
  'Restaurant Grade': 'ஹோட்டல் தரம்',
  'Golden Sella': 'கோல்டன் செல்லா',
  'Export Quality': 'ஏற்றுமதி தரம்',
  'Everyday Premium': 'தினசரி பிரீமியம்',
  'Family Pack Available': 'குடும்ப பேக்',
  '100% Natural Aroma': '100% இயற்கை மணம்',
  'No Additives': 'கலப்படமற்றது',
  'Low Starch': 'குறைந்த மாவுச்சத்து',
  'Easy Digest': 'எளிதில் செரிக்கும்',
  'South Indian Favourite': 'தென்னிந்திய விருப்பம்',
  'Whole Grain': 'முழு தானியம்',
  'High Fibre': 'அதிக நார்ச்சத்து',
  'Antioxidant Rich': 'ஆன்டி-ஆக்ஸிடன்ட்',
  'Superfood': 'சூப்பர்ஃபுட்',
  'Anthocyanin Rich': 'ஆந்தோசயனின்',
  'Gourmet Grade': 'கூர்மெட் தரம்',
  'B Vitamins': 'பி வைட்டமின்கள்',
  'Bulk Available': 'மொத்த விற்பனை',
  'Export Grade': 'ஏற்றுமதி தரம்',
  'High Yield': 'அதிக பலன்',
  'Industrial Grade': 'தொழில்துறை தரம்',
  'Bulk Only': 'மொத்த விற்பனை',
  'D1/D2 Available': 'D1/D2 கிடைக்கும்',
  'Sortex Cleaned': 'சாப்டெக்ஸ் சுத்தம்',
  'Halal Certified': 'ஹலால் சான்று',
  'Marriage Special': 'திருமண சிறப்பு',
  'Stone-Free': 'கல் அற்றது',
  'VIP Ponni': 'VIP பொன்னி',
  'Everyday Quality': 'தினசரி தரம்',
  'Premium Old Rice': 'பழைய அரிசி',
  '100% Natural': '100% இயற்கை',
  'Stoneless & Brokenless': 'கல் இல்லா அரிசி',
  'Computer Sorted': 'கம்ப்யூட்டர் தரம்',
  'Everyday Staple': 'தினசரி உணவு',
  'Sortex Quality': 'சாப்டெக்ஸ் தரம்',
  'VIP Rice': 'VIP அரிசி',
  'Premium Wada Kolam': 'வாடா கொலம்',
  'QR Verified': 'QR சான்று',
  'Khila Khila Dana': 'உதிரியான தானியம்',
  'Since 1981': '1981 முதல்',
  'Rajabogam Arisi': 'ராஜபோகம் அரிசி',
  'Trusted Brand': 'நம்பகமான பிராண்ட்',
  'Idly & Dosa Special': 'இட்லி தோசை சிறப்பு',
  '100% Sortex': '100% சாப்டெக்ஸ்',
};

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const { t, lang } = useTranslation();
  const isTa = lang === 'ta';
  const defaultPrice = product.prices[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, defaultPrice, 1);
    const prodName = isTa && product.nameTa ? product.nameTa : product.name;
    toast.success(`${prodName} கூடையில் சேர்க்கப்பட்டது!`, {
      style: { background: '#1a2e1a', color: '#f0f7f0', border: '1px solid #d4a017' },
      iconTheme: { primary: '#d4a017', secondary: '#0f1a0f' },
    });
  };

  const discount = defaultPrice.originalPrice
    ? Math.round(((defaultPrice.originalPrice - defaultPrice.price) / defaultPrice.originalPrice) * 100)
    : null;

  const displayName = isTa && product.nameTa ? product.nameTa : product.name;
  const displayVariety = isTa && product.varietyTa ? product.varietyTa : product.variety;
  const displayDesc = isTa && product.descriptionTa ? product.descriptionTa : product.description;
  const displayWeight = isTa
    ? defaultPrice.weight.replace(/kg/gi, 'கிலோ').replace(/g/gi, 'கிராம்')
    : defaultPrice.weight;

  return (
    <Link to={`/product/${product.slug}`} className="card group block">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-[#0f1a0f]">
        <img
          src={product.image}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23162216"%3E%3Crect width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="48" fill="%23d4a017" text-anchor="middle" dominant-baseline="middle"%3E🌾%3C/text%3E%3C/svg%3E';
          }}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount && (
            <span className="badge bg-[#d4a017] text-[#0f1a0f] font-bold">
              -{discount}%
            </span>
          )}
          {product.badges.slice(0, 1).map((b) => (
            <span key={b} className="badge badge-gold">
              {isTa && badgeTranslations[b] ? badgeTranslations[b] : b}
            </span>
          ))}
        </div>
        {/* Quick add button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 w-10 h-10 bg-[#d4a017] text-[#0f1a0f] rounded-xl flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 transition-all duration-200 hover:bg-[#fcd34d] shadow-lg shadow-black/40 active:scale-95"
          title="Quick add to cart"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#d4a017] font-semibold uppercase tracking-wider">
            {displayVariety}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-[#fcd34d] fill-current" />
            <span className="text-xs text-gray-400">
              {product.rating} ({product.reviews})
            </span>
          </div>
        </div>

        <h3 className="font-serif font-semibold text-white text-lg mb-1 group-hover:text-[#d4a017] transition-colors">
          {displayName}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-3">{displayDesc}</p>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[#d4a017] font-bold text-xl">
              ₹{defaultPrice.price.toLocaleString()}
            </span>
            {defaultPrice.originalPrice && (
              <span className="text-gray-500 text-sm line-through ml-2">
                ₹{defaultPrice.originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-gray-400 text-xs ml-1">/ {displayWeight}</span>
          </div>
          {product.isWholesaleAvailable && (
            <span className="badge badge-green text-xs">{t('nav.wholesale', 'Wholesale')}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

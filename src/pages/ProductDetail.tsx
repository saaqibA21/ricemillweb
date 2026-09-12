// src/pages/ProductDetail.tsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft, Check, Truck, Shield, Award } from 'lucide-react';
import { getProductBySlug } from '../data/products';
import { useProductsStore } from '../store/productsStore';
import { useCartStore } from '../store/cartStore';
import { PriceOption } from '../types';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const products = useProductsStore((s) => s.products);
  const product = products.find((p) => p.slug === slug) || getProductBySlug(slug || '');
  const addItem = useCartStore((s) => s.addItem);

  const [selectedWeight, setSelectedWeight] = useState<PriceOption>(
    product?.prices[0] || { weight: '1 kg', weightKg: 1, price: 0 }
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  if (!product) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌾</div>
          <h2 className="font-serif text-3xl text-white mb-4">Product not found</h2>
          <Link to="/shop" className="btn-primary">Back to Shop</Link>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    addItem(product, selectedWeight, quantity);
    toast.success(`${product.name} added to cart!`, {
      style: { background: '#1a2e1a', color: '#f0f7f0', border: '1px solid #d4a017' },
      iconTheme: { primary: '#d4a017', secondary: '#0f1a0f' },
    });
  };

  const discount = selectedWeight.originalPrice
    ? Math.round(
        ((selectedWeight.originalPrice - selectedWeight.price) / selectedWeight.originalPrice) * 100
      )
    : null;

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#1a2e1a] mb-4">
              <img
                src={product.images[activeImg] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600" fill="%23162216"%3E%3Crect width="600" height="600"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%23d4a017" text-anchor="middle" dominant-baseline="middle"%3E🌾%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImg === i ? 'border-[#d4a017]' : 'border-[#2d4a2d]'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <span className="text-[#d4a017] font-semibold text-xs sm:text-sm uppercase tracking-widest mb-1.5 block">
              {product.variety}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      s <= Math.floor(product.rating)
                        ? 'text-[#fcd34d] fill-current'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-300 text-xs sm:text-sm">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {product.badges.map((b) => (
                <span key={b} className="badge badge-gold text-xs">
                  {b}
                </span>
              ))}
            </div>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">{product.longDescription}</p>

            {/* Grain specs */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-6">
              {[
                { label: 'Grain Length', value: product.grainLength },
                { label: 'Aroma', value: product.aroma },
                { label: 'Moisture', value: product.moisture },
                { label: 'Cook Time', value: product.cookingTime },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#1a2e1a] rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 border border-[#244224]">
                  <div className="text-[11px] sm:text-xs text-gray-400 mb-0.5">{label}</div>
                  <div className="text-white text-xs sm:text-sm font-medium">{value}</div>
                </div>
              ))}
            </div>

            {/* Best For */}
            <div className="mb-6">
              <p className="text-gray-400 text-xs sm:text-sm mb-2">Best For:</p>
              <div className="flex flex-wrap gap-2">
                {product.bestFor.map((b) => (
                  <span key={b} className="flex items-center gap-1 text-xs text-[#7ec07e] bg-[#1a2e1a] border border-[#2d4a2d] px-3 py-1.5 rounded-full">
                    <Check className="w-3 h-3" /> {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Weight Selector */}
            <div className="mb-6">
              <p className="label text-sm">Select Pack Size</p>
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {product.prices.map((p) => (
                  <button
                    key={p.weight}
                    onClick={() => setSelectedWeight(p)}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all active:scale-95 ${
                      selectedWeight.weight === p.weight
                        ? 'bg-[#d4a017] border-[#d4a017] text-[#0f1a0f] shadow-md shadow-[#d4a017]/20'
                        : 'border-[#2d4a2d] bg-[#142614] text-gray-300 hover:border-[#d4a017]'
                    }`}
                  >
                    {p.weight}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2.5 sm:gap-3">
                <span className="text-[#d4a017] font-bold text-3xl sm:text-4xl">
                  ₹{selectedWeight.price.toLocaleString()}
                </span>
                {selectedWeight.originalPrice && (
                  <span className="text-gray-500 text-lg sm:text-xl line-through">
                    ₹{selectedWeight.originalPrice.toLocaleString()}
                  </span>
                )}
                {discount && (
                  <span className="badge bg-[#d4a017] text-[#0f1a0f] text-xs sm:text-sm font-bold">
                    {discount}% OFF
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Per {selectedWeight.weight} · Incl. all taxes
              </p>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              <div className="flex items-center justify-between sm:justify-start border border-[#2d4a2d] rounded-xl overflow-hidden bg-[#142614] w-full sm:w-auto">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-14 sm:w-12 h-12 flex items-center justify-center text-white hover:bg-[#1a2e1a] active:bg-[#1e3a1e] transition-colors text-2xl"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-14 sm:w-12 text-center text-white font-bold text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-14 sm:w-12 h-12 flex items-center justify-center text-white hover:bg-[#1a2e1a] active:bg-[#1e3a1e] transition-colors text-2xl"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="btn-primary flex-1 justify-center text-base sm:text-lg py-3.5 sm:py-3 shadow-lg shadow-[#d4a017]/10 active:scale-[0.99]"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 border-t border-[#1a2e1a]">
              {[
                { Icon: Truck, text: 'Free delivery above ₹999' },
                { Icon: Shield, text: '100% pure quality' },
                { Icon: Award, text: 'FSSAI certified' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex flex-col items-center text-center gap-1 p-2 rounded-lg bg-[#122212]/50">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4a017]" />
                  <span className="text-gray-400 text-[10px] sm:text-xs leading-tight">{text}</span>
                </div>
              ))}
            </div>

            {/* Wholesale notice */}
            {product.isWholesaleAvailable && (
              <div className="mt-4 bg-[#1a2e1a] border border-[#2d4a2d] rounded-xl p-4">
                <p className="text-[#7ec07e] text-sm font-medium mb-1">
                  ✓ Wholesale pricing available
                </p>
                <p className="text-gray-400 text-xs">
                  Minimum order: {product.minWholesaleQty} kg.{' '}
                  <Link to="/wholesale" className="text-[#d4a017] underline">
                    Get a quote →
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

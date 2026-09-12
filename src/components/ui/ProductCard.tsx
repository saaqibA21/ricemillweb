// src/components/ui/ProductCard.tsx
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const defaultPrice = product.prices[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, defaultPrice, 1);
    toast.success(`${product.name} (${defaultPrice.weight}) added to cart!`, {
      style: { background: '#1a2e1a', color: '#f0f7f0', border: '1px solid #d4a017' },
      iconTheme: { primary: '#d4a017', secondary: '#0f1a0f' },
    });
  };

  const discount = defaultPrice.originalPrice
    ? Math.round(((defaultPrice.originalPrice - defaultPrice.price) / defaultPrice.originalPrice) * 100)
    : null;

  return (
    <Link to={`/product/${product.slug}`} className="card group block">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-[#0f1a0f]">
        <img
          src={product.image}
          alt={product.name}
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
              {b}
            </span>
          ))}
        </div>
        {/* Quick add button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 w-10 h-10 bg-[#d4a017] text-[#0f1a0f] rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 hover:bg-[#fcd34d]"
          title="Quick add to cart"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#d4a017] font-semibold uppercase tracking-wider">
            {product.variety}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-[#fcd34d] fill-current" />
            <span className="text-xs text-gray-400">
              {product.rating} ({product.reviews})
            </span>
          </div>
        </div>

        <h3 className="font-serif font-semibold text-white text-lg mb-1 group-hover:text-[#d4a017] transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-3">{product.description}</p>

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
            <span className="text-gray-400 text-xs ml-1">/ {defaultPrice.weight}</span>
          </div>
          {product.isWholesaleAvailable && (
            <span className="badge badge-green text-xs">Wholesale</span>
          )}
        </div>
      </div>
    </Link>
  );
}

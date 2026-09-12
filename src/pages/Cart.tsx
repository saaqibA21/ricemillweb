// src/pages/Cart.tsx
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const navigate = useNavigate();

  const total = totalPrice();
  const count = totalItems();
  const deliveryCharge = total >= 999 ? 0 : 99;
  const grandTotal = total + deliveryCharge;

  const handleCheckout = () => {
    if (!isLoggedIn) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="font-serif text-3xl text-white mb-3">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Add some premium rice to get started!</p>
          <Link to="/shop" className="btn-primary text-lg px-8 py-4">
            <ShoppingBag className="w-5 h-5" />
            Shop Rice
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-2">Your Cart</h1>
        <p className="text-gray-400 mb-8">{count} item{count !== 1 ? 's' : ''}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const key = `${item.product.id}-${item.selectedWeight.weight}`;
              return (
                <div key={key} className="card p-4 flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#0f1a0f] shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="%23162216"%3E%3Crect width="96" height="96"/%3E%3Ctext x="50%25" y="50%25" font-size="32" fill="%23d4a017" text-anchor="middle" dominant-baseline="middle"%3E🌾%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="font-serif font-semibold text-white hover:text-[#d4a017] transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-[#d4a017] text-sm mt-0.5">{item.selectedWeight.weight}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{item.product.variety}</p>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedWeight.weight,
                              item.quantity - 1
                            )
                          }
                          className="w-7 h-7 rounded-lg bg-[#0f1a0f] border border-[#2d4a2d] flex items-center justify-center text-white hover:border-[#d4a017] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-white font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedWeight.weight,
                              item.quantity + 1
                            )
                          }
                          className="w-7 h-7 rounded-lg bg-[#0f1a0f] border border-[#2d4a2d] flex items-center justify-center text-white hover:border-[#d4a017] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price + Remove */}
                      <div className="flex items-center gap-4">
                        <span className="text-[#d4a017] font-bold text-lg">
                          ₹{(item.selectedWeight.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() =>
                            removeItem(item.product.id, item.selectedWeight.weight)
                          }
                          className="text-gray-500 hover:text-red-400 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-serif font-bold text-white text-xl mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal ({count} items)</span>
                  <span className="text-white">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-[#7ec07e]' : 'text-white'}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-xs text-gray-500">
                    Add ₹{(999 - total).toLocaleString()} more for free delivery
                  </p>
                )}
              </div>

              <div className="border-t border-[#2d4a2d] pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-white">Total</span>
                  <span className="text-[#d4a017]">₹{grandTotal.toLocaleString()}</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">Incl. all taxes</p>
              </div>

              <button onClick={handleCheckout} className="btn-primary w-full justify-center text-lg py-4 mb-4">
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link to="/shop" className="btn-secondary w-full justify-center py-3 text-sm">
                Continue Shopping
              </Link>

              <div className="mt-6 pt-4 border-t border-[#1a2e1a] space-y-2">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="text-[#d4a017]">✓</span> Secure UPI & Card payment
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="text-[#d4a017]">✓</span> COD available on orders ≤ ₹5000
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="text-[#d4a017]">✓</span> Easy 7-day returns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

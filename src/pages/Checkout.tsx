// src/pages/Checkout.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Smartphone, Package, Check, ArrowRight, MapPin } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useOrdersStore } from '../store/ordersStore';
import { Address } from '../types';
import toast from 'react-hot-toast';

type PaymentMethod = 'upi' | 'cod';

const upiApps = [
  { name: 'Google Pay', icon: '🟢', id: 'gpay' },
  { name: 'PhonePe', icon: '🟣', id: 'phonepe' },
  { name: 'Paytm', icon: '🔵', id: 'paytm' },
  { name: 'UPI ID', icon: '🏦', id: 'upi-id' },
];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { placeOrder } = useOrdersStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  const [address, setAddress] = useState<Omit<Address, 'id' | 'isDefault'>>({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const total = totalPrice();
  const deliveryCharge = total >= 999 ? 0 : 99;
  const grandTotal = total + deliveryCharge;

  if (items.length === 0) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="font-serif text-2xl text-white mb-4">Your cart is empty</h2>
          <Link to="/shop" className="btn-primary">Shop Now</Link>
        </div>
      </main>
    );
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.line1 || !address.city || !address.state || !address.pincode) {
      toast.error('Please fill all required address fields');
      return;
    }
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2000));

    const fullAddress: Address = {
      ...address,
      id: `addr-${Date.now()}`,
      isDefault: true,
    };

    const order = placeOrder(items, grandTotal, fullAddress, paymentMethod);
    clearCart();
    setProcessing(false);
    navigate(`/order-success/${order.id}`);
  };

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-8">Checkout</h1>

        {/* Steps indicator */}
        <div className="flex items-center gap-4 mb-10">
          {[
            { key: 'address', label: 'Delivery Address', Icon: MapPin },
            { key: 'payment', label: 'Payment', Icon: CreditCard },
          ].map(({ key, label, Icon }, i) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === key
                    ? 'bg-[#d4a017] text-[#0f1a0f]'
                    : step === 'payment' && key === 'address'
                    ? 'bg-[#1e5c1e] text-[#7ec07e]'
                    : 'bg-[#1a2e1a] text-gray-400'
                }`}
              >
                {step === 'payment' && key === 'address' ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-sm font-medium ${
                  step === key ? 'text-white' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
              {i < 1 && <div className="w-12 h-px bg-[#2d4a2d] ml-2" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Address / Payment Form */}
          <div className="lg:col-span-2">
            {step === 'address' ? (
              <form onSubmit={handleAddressSubmit} className="card p-6 space-y-5">
                <h2 className="font-serif font-bold text-xl text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#d4a017]" />
                  Delivery Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Name *</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      defaultValue={user?.name}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Phone *</label>
                    <input
                      type="tel"
                      placeholder="+91 mobile number"
                      defaultValue={user?.phone ? `+91${user.phone}` : ''}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Address Line 1 *</label>
                  <input
                    type="text"
                    placeholder="House/flat number, street"
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Address Line 2</label>
                  <input
                    type="text"
                    placeholder="Area, landmark (optional)"
                    value={address.line2}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label">City *</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">State *</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Pincode *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6-digit pincode"
                      value={address.pincode}
                      onChange={(e) =>
                        setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '') })
                      }
                      className="input"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full justify-center py-4 text-base">
                  Continue to Payment
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Payment method selector */}
                <div className="card p-6">
                  <h2 className="font-serif font-bold text-xl text-white mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#d4a017]" />
                    Payment Method
                  </h2>

                  <div className="space-y-3 mb-6">
                    {/* UPI Option */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-[#d4a017] bg-[#d4a017]/5'
                          : 'border-[#2d4a2d] hover:border-[#d4a017]/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="accent-[#d4a017]"
                      />
                      <Smartphone className="w-5 h-5 text-[#d4a017]" />
                      <div>
                        <div className="text-white font-medium">UPI Payment</div>
                        <div className="text-gray-400 text-xs">
                          Pay via GPay, PhonePe, Paytm or UPI ID
                        </div>
                      </div>
                    </label>

                    {/* COD Option */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-[#d4a017] bg-[#d4a017]/5'
                          : 'border-[#2d4a2d] hover:border-[#d4a017]/50'
                      } ${grandTotal > 5000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        disabled={grandTotal > 5000}
                        className="accent-[#d4a017]"
                      />
                      <Package className="w-5 h-5 text-[#d4a017]" />
                      <div>
                        <div className="text-white font-medium">Cash on Delivery</div>
                        <div className="text-gray-400 text-xs">
                          {grandTotal > 5000
                            ? 'Not available for orders above ₹5,000'
                            : 'Pay in cash when your order arrives'}
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* UPI app selection */}
                  {paymentMethod === 'upi' && (
                    <div>
                      <p className="label mb-3">Choose UPI App</p>
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {upiApps.map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => setSelectedUpiApp(app.id)}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              selectedUpiApp === app.id
                                ? 'border-[#d4a017] bg-[#d4a017]/10'
                                : 'border-[#2d4a2d] hover:border-[#d4a017]/50'
                            }`}
                          >
                            <div className="text-2xl mb-1">{app.icon}</div>
                            <div className="text-xs text-gray-300">{app.name}</div>
                          </button>
                        ))}
                      </div>

                      {selectedUpiApp === 'upi-id' && (
                        <div>
                          <label className="label">Enter UPI ID</label>
                          <input
                            type="text"
                            placeholder="yourname@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="input"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="btn-primary w-full justify-center py-4 text-lg disabled:opacity-60"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0f1a0f] border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'upi' ? (
                        <Smartphone className="w-5 h-5" />
                      ) : (
                        <Package className="w-5 h-5" />
                      )}
                      {paymentMethod === 'upi'
                        ? `Pay ₹${grandTotal.toLocaleString()} via UPI`
                        : `Confirm COD Order • ₹${grandTotal.toLocaleString()}`}
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  🔐 Payments secured by Razorpay · 256-bit SSL encryption
                </p>
              </form>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24">
              <h3 className="font-serif font-bold text-lg text-white mb-4">
                Order Summary
              </h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedWeight.weight}`}
                    className="flex gap-3 items-center"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#0f1a0f] shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="%23162216"%3E%3Crect width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="%23d4a017" text-anchor="middle" dominant-baseline="middle"%3E🌾%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {item.selectedWeight.weight} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-[#d4a017] text-sm font-bold shrink-0">
                      ₹{(item.selectedWeight.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#2d4a2d] pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-[#7ec07e]' : 'text-white'}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-[#1a2e1a]">
                  <span className="text-white">Total</span>
                  <span className="text-[#d4a017]">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

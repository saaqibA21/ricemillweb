// src/pages/Checkout.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Smartphone, Package, Check, ArrowRight, Building2, MapPin, ChevronLeft } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useOrdersStore } from '../store/ordersStore';
import { Address } from '../types';
import toast from 'react-hot-toast';
import BranchSelector from '../components/checkout/BranchSelector';
import { ParcelBranch } from '../data/parcelBranches';

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

  const [step, setStep] = useState<'branch' | 'payment'>('branch');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  // Parcel pickup state
  const [selectedBranch, setSelectedBranch] = useState<ParcelBranch | null>(null);
  const [receiverName, setReceiverName] = useState(user?.name || '');
  const [receiverPhone, setReceiverPhone] = useState(user?.phone || '');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [receiverEmail, setReceiverEmail] = useState(user?.email || '');

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

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBranch) {
      toast.error('Please select your nearest parcel counter from the list');
      return;
    }
    if (!receiverName.trim()) {
      toast.error('Please enter the receiver name who will collect the parcel');
      return;
    }
    if (!receiverPhone.trim() || receiverPhone.replace(/\D/g, '').length < 10) {
      toast.error('Please provide a valid 10-digit mobile number for parcel arrival notification');
      return;
    }
    if (!receiverEmail.trim() || !receiverEmail.includes('@')) {
      toast.error('Please enter a valid email address for your order confirmation & receipt');
      return;
    }

    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) {
      toast.error('Please select a pickup branch counter first');
      setStep('branch');
      return;
    }

    setProcessing(true);

    const fullAddress: Address = {
      id: `addr-${Date.now()}`,
      label: `${selectedBranch.service} - ${selectedBranch.branchName}`,
      line1: `${selectedBranch.service}: ${selectedBranch.branchName}`,
      line2: selectedBranch.address,
      city: selectedBranch.city,
      state: selectedBranch.state,
      pincode: selectedBranch.digiPin || '000000',
      isDefault: true,
      service: selectedBranch.service,
      branchId: selectedBranch.id,
      branchName: selectedBranch.branchName,
      branchAddress: selectedBranch.address,
      branchPhone: selectedBranch.phone,
      branchDigiPin: selectedBranch.digiPin,
      contactPerson: selectedBranch.contactPerson,
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      receiverEmail: receiverEmail.trim(),
      alternatePhone: alternatePhone.trim() || undefined,
    };

    let serverOrderId: string | undefined;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total: grandTotal,
          paymentMethod,
          address: fullAddress,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          serverOrderId = data.id;
        }
      }
    } catch {
      // In local dev without backend or offline, proceed with local order placement
    }

    const order = placeOrder(items, grandTotal, fullAddress, paymentMethod, serverOrderId);
    clearCart();
    setProcessing(false);
    navigate(`/order-success/${order.id}`);
  };

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-3 sm:mb-4 text-3xl sm:text-4xl">Checkout</h1>
        <p className="text-gray-400 text-sm mb-6 sm:mb-8">
          Heavy rice bag orders are delivered to your nearest transport parcel counter for pickup.
        </p>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 sm:gap-4 mb-8 sm:mb-10">
          {[
            { key: 'branch', label: '1. Parcel Counter & Receiver', Icon: Building2 },
            { key: 'payment', label: '2. Payment & Confirmation', Icon: CreditCard },
          ].map(({ key, label, Icon }, i) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  step === key
                    ? 'bg-[#d4a017] text-[#0f1a0f]'
                    : step === 'payment' && key === 'branch'
                    ? 'bg-[#1e5c1e] text-[#7ec07e]'
                    : 'bg-[#1a2e1a] text-gray-400'
                }`}
              >
                {step === 'payment' && key === 'branch' ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : i + 1}
              </div>
              <span
                className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                  step === key ? 'text-white' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
              {i < 1 && <div className="w-8 sm:w-12 h-px bg-[#2d4a2d] ml-1 sm:ml-2" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left: Branch Selection / Payment Form */}
          <div className="lg:col-span-2">
            {step === 'branch' ? (
              <form onSubmit={handleBranchSubmit} className="space-y-6">
                <BranchSelector
                  selectedBranch={selectedBranch}
                  onSelectBranch={(b) => setSelectedBranch(b)}
                  receiverName={receiverName}
                  setReceiverName={setReceiverName}
                  receiverPhone={receiverPhone}
                  setReceiverPhone={setReceiverPhone}
                  alternatePhone={alternatePhone}
                  setAlternatePhone={setAlternatePhone}
                  receiverEmail={receiverEmail}
                  setReceiverEmail={setReceiverEmail}
                />

                <div className="pt-2">
                  <button type="submit" className="btn-primary w-full justify-center py-4 text-base shadow-lg shadow-[#d4a017]/20">
                    Continue to Payment
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Back to Branch selection button */}
                <button
                  type="button"
                  onClick={() => setStep('branch')}
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-[#d4a017] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Change Pickup Counter or Receiver Details
                </button>

                {/* Selected Counter Summary Badge */}
                {selectedBranch && (
                  <div className="card p-4 sm:p-5 border-l-4 border-l-[#d4a017] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#d4a017]">
                        📦 Dispatched To Counter
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep('branch')}
                        className="text-xs text-[#a7f3d0] hover:underline"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-white font-bold text-base">
                      {selectedBranch.service} — {selectedBranch.branchName}
                    </p>
                    <p className="text-gray-300 text-xs sm:text-sm">{selectedBranch.address}</p>
                    <div className="text-xs text-gray-400 pt-1 border-t border-[#1e331e] flex flex-wrap gap-4">
                      <span>👤 Receiver: <strong className="text-white">{receiverName}</strong></span>
                      <span>📞 Phone: <strong className="text-white">{receiverPhone}</strong></span>
                      {selectedBranch.phone && (
                        <span>🏢 Counter: <strong className="text-[#d4a017]">{selectedBranch.phone}</strong></span>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment method selector */}
                <div className="card p-6">
                  <h2 className="font-serif font-bold text-xl text-white mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#d4a017]" />
                    Select Payment Method
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
                        <div className="text-white font-medium">Instant UPI Payment</div>
                        <div className="text-gray-400 text-xs">
                          Pay instantly via Google Pay, PhonePe, Paytm or UPI ID
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
                        <div className="text-white font-medium">Pay on Counter Collection (COD)</div>
                        <div className="text-gray-400 text-xs">
                          {grandTotal > 5000
                            ? 'Not available for orders above ₹5,000'
                            : 'Pay at the parcel counter when collecting your rice bags'}
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* UPI app selection */}
                  {paymentMethod === 'upi' && (
                    <div>
                      <p className="label mb-3">Choose UPI App</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
                        {upiApps.map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => setSelectedUpiApp(app.id)}
                            className={`p-3 sm:p-3.5 rounded-xl border text-center transition-all active:scale-95 ${
                              selectedUpiApp === app.id
                                ? 'border-[#d4a017] bg-[#d4a017]/10 shadow-md shadow-[#d4a017]/10'
                                : 'border-[#2d4a2d] bg-[#142614] hover:border-[#d4a017]/50'
                            }`}
                          >
                            <div className="text-2xl mb-1">{app.icon}</div>
                            <div className="text-xs font-semibold text-gray-200">{app.name}</div>
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
                  className="btn-primary w-full justify-center py-4 text-lg disabled:opacity-60 shadow-lg shadow-[#d4a017]/20"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0f1a0f] border-t-transparent rounded-full animate-spin" />
                      Booking Parcel Order...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'upi' ? (
                        <Smartphone className="w-5 h-5" />
                      ) : (
                        <Package className="w-5 h-5" />
                      )}
                      {paymentMethod === 'upi'
                        ? `Pay ₹${grandTotal.toLocaleString()} & Confirm Order`
                        : `Confirm Parcel Booking • ₹${grandTotal.toLocaleString()}`}
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  🔐 Safe & Verified • Instant order confirmation & dispatch receipt via email
                </p>
              </form>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24 space-y-4">
              <h3 className="font-serif font-bold text-lg text-white">
                Order Summary
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedWeight.weight}`}
                    className="flex gap-3 items-center"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#0f1a0f] shrink-0 border border-[#233b23]">
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
                  <span className="text-gray-400">Parcel Transport</span>
                  <span className={deliveryCharge === 0 ? 'text-[#7ec07e]' : 'text-white'}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-[#1a2e1a]">
                  <span className="text-white">Total</span>
                  <span className="text-[#d4a017]">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery mode highlight */}
              <div className="p-3 rounded-lg bg-[#0f1a0f] border border-[#233b23] text-xs text-gray-300 space-y-1">
                <p className="font-semibold text-[#d4a017] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Counter Pickup Only:
                </p>
                {selectedBranch ? (
                  <p className="line-clamp-2 text-white">
                    📍 {selectedBranch.service} — {selectedBranch.branchName}
                  </p>
                ) : (
                  <p className="text-gray-400">Select counter on the left</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

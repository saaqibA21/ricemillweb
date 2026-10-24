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
import {
  loadRazorpayScript,
  createBackendRazorpayOrder,
  verifyBackendPaymentSignature,
} from '../utils/razorpay';

type PaymentMethod = 'razorpay' | 'cod';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { placeOrder } = useOrdersStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<'branch' | 'payment'>('branch');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [processing, setProcessing] = useState(false);

  // Parcel pickup state
  const [selectedBranch, setSelectedBranch] = useState<ParcelBranch | null>(null);
  const [receiverName, setReceiverName] = useState(user?.name || '');
  const [receiverPhone, setReceiverPhone] = useState(user?.phone || '');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [receiverEmail, setReceiverEmail] = useState(user?.email || '');

  const total = totalPrice();
  const grandTotal = total;

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
    const cleanPhone = receiverPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Mobile number is mandatory. Please provide a valid 10-digit mobile number for parcel arrival notification');
      return;
    }
    if (receiverEmail.trim() && !receiverEmail.includes('@')) {
      toast.error('Please enter a valid email address or leave it blank');
      return;
    }

    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finalizeOrder = async (
    method: 'razorpay' | 'cod',
    razorpayPaymentId?: string,
    razorpayOrderId?: string
  ) => {
    if (!selectedBranch) return;

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
      razorpayPaymentId,
      razorpayOrderId,
    };

    let serverOrderId: string | undefined;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total: grandTotal,
          paymentMethod: method,
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

    const order = placeOrder(
      items,
      grandTotal,
      fullAddress,
      method,
      serverOrderId
    );
    clearCart();
    setProcessing(false);
    navigate(`/order-success/${order.id}`);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) {
      toast.error('Please select a pickup branch counter first');
      setStep('branch');
      return;
    }

    setProcessing(true);

    // Case 1: Cash on Delivery / Pay on Counter Collection
    if (paymentMethod === 'cod') {
      await finalizeOrder('cod');
      return;
    }

    // Case 2: Razorpay Standard Web Checkout
    try {
      // 1. Ensure Razorpay SDK is available
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // 2. Call backend to create Razorpay Order
      const toastId = toast.loading('Initializing secure Razorpay payment...');
      const razorpayOrder = await createBackendRazorpayOrder(grandTotal, {
        receiverName,
        receiverPhone,
        branch: selectedBranch.branchName,
      });
      toast.dismiss(toastId);

      const razorpayKey = (
        import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Trmq5qikiN9LEm'
      ).replace(/^["']|["']$/g, '').trim();

      // 3. Open Razorpay Checkout modal
      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Hariharan Traders',
        description: `Rice Mill Order — ₹${grandTotal.toLocaleString()}`,
        order_id: razorpayOrder.order_id,
        prefill: {
          name: receiverName,
          contact: receiverPhone,
          email: receiverEmail.trim() || undefined,
        },
        theme: {
          color: '#d4a017',
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast('Payment cancelled');
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyToast = toast.loading('Verifying payment signature...');
            const verification = await verifyBackendPaymentSignature(response);
            toast.dismiss(verifyToast);

            if (verification.verified) {
              toast.success('Payment verified! Finalizing order...');
              await finalizeOrder(
                'razorpay',
                response.razorpay_payment_id,
                response.razorpay_order_id
              );
            } else {
              throw new Error('Payment verification unsuccessful');
            }
          } catch (err: any) {
            console.error('Signature verification error:', err);
            toast.error(err.message || 'Signature mismatch: payment not verified');
            setProcessing(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        console.error('Razorpay payment failed:', resp.error);
        toast.error(`Payment failed: ${resp.error?.description || 'Transaction declined'}`);
        setProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Razorpay initiation error:', err);
      toast.error(err.message || 'Unable to open payment modal. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-3 sm:mb-4 text-3xl sm:text-4xl text-[#1c1917]">Checkout</h1>
        <p className="text-stone-600 text-sm mb-6 sm:mb-8 font-medium">
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
                    ? 'bg-[#d4a017] text-[#1c1917] shadow-sm'
                    : step === 'payment' && key === 'branch'
                    ? 'bg-[#166534] text-white shadow-sm'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {step === 'payment' && key === 'branch' ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" /> : i + 1}
              </div>
              <span
                className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${
                  step === key ? 'text-[#1c1917]' : 'text-stone-500'
                }`}
              >
                {label}
              </span>
              {i < 1 && <div className="w-8 sm:w-12 h-px bg-stone-300 ml-1 sm:ml-2" />}
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
                  <button type="submit" className="btn-primary w-full justify-center py-4 text-base shadow-sm hover:shadow">
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
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-600 hover:text-[#b7860e] font-semibold transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Change Pickup Counter or Receiver Details
                </button>

                {/* Selected Counter Summary Badge */}
                {selectedBranch && (
                  <div className="card p-4 sm:p-5 border-l-4 border-l-[#d4a017] space-y-2 bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider font-bold text-[#b7860e]">
                        📦 Dispatched To Counter
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep('branch')}
                        className="text-xs text-[#166534] font-semibold hover:underline"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-[#1c1917] font-bold text-base">
                      {selectedBranch.service} — {selectedBranch.branchName}
                    </p>
                    <p className="text-stone-600 text-xs sm:text-sm">{selectedBranch.address}</p>
                    <div className="text-xs text-stone-500 pt-1.5 border-t border-[#f0eae1] flex flex-wrap gap-4 font-medium">
                      <span>👤 Receiver: <strong className="text-[#1c1917]">{receiverName}</strong></span>
                      <span>📞 Phone: <strong className="text-[#1c1917] font-mono">{receiverPhone}</strong></span>
                      {selectedBranch.phone && (
                        <span>🏢 Counter: <strong className="text-[#b7860e] font-mono">{selectedBranch.phone}</strong></span>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment method selector */}
                <div className="card p-6 bg-white shadow-sm">
                  <h2 className="font-serif font-bold text-xl text-[#1c1917] mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#d4a017]" />
                    Select Payment Method
                  </h2>

                  <div className="space-y-4 mb-6">
                    {/* Razorpay Online Option */}
                    <label
                      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'razorpay'
                          ? 'border-[#d4a017] bg-[#fefce8] ring-1 ring-[#d4a017] shadow-sm'
                          : 'border-[#e8e2d5] bg-white hover:border-[#d4a017]/70'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="accent-[#d4a017] mt-1 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[#1c1917] font-bold text-base">
                            Online Payment (Razorpay Standard)
                          </span>
                          <span className="text-[10px] bg-[#d4a017] text-[#1c1917] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                            Instant & Verified
                          </span>
                        </div>
                        <p className="text-stone-600 text-xs mb-3">
                          Pay securely via UPI (GPay, PhonePe, Paytm, CRED), Cards, Netbanking & Wallets
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2.5 py-1 rounded bg-[#faf8f5] border border-[#e8e2d5] text-stone-700 font-medium">
                            🟢 Google Pay
                          </span>
                          <span className="text-xs px-2.5 py-1 rounded bg-[#faf8f5] border border-[#e8e2d5] text-stone-700 font-medium">
                            🟣 PhonePe
                          </span>
                          <span className="text-xs px-2.5 py-1 rounded bg-[#faf8f5] border border-[#e8e2d5] text-stone-700 font-medium">
                            🔵 Paytm / UPI
                          </span>
                          <span className="text-xs px-2.5 py-1 rounded bg-[#faf8f5] border border-[#e8e2d5] text-stone-700 font-medium">
                            💳 Debit & Credit Cards
                          </span>
                          <span className="text-xs px-2.5 py-1 rounded bg-[#faf8f5] border border-[#e8e2d5] text-stone-700 font-medium">
                            🏦 Netbanking
                          </span>
                        </div>
                      </div>
                    </label>

                    {/* COD Option */}
                    <label
                      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-[#d4a017] bg-[#fefce8] ring-1 ring-[#d4a017] shadow-sm'
                          : 'border-[#e8e2d5] bg-white hover:border-[#d4a017]/70'
                      } ${grandTotal > 5000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        disabled={grandTotal > 5000}
                        className="accent-[#d4a017] mt-1 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-[#b7860e]" />
                          <span className="text-[#1c1917] font-bold">
                            Pay on Counter Collection (Cash on Delivery)
                          </span>
                        </div>
                        <p className="text-stone-600 text-xs">
                          {grandTotal > 5000
                            ? 'Not available for orders above ₹5,000'
                            : 'Pay in cash at the parcel counter when collecting your rice bags'}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="btn-primary w-full justify-center py-4 text-lg disabled:opacity-60 shadow-sm hover:shadow"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#1c1917] border-t-transparent rounded-full animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'razorpay' ? (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Pay ₹{grandTotal.toLocaleString()} with Razorpay
                        </>
                      ) : (
                        <>
                          <Package className="w-5 h-5" />
                          Confirm Parcel Booking • ₹{grandTotal.toLocaleString()}
                        </>
                      )}
                    </>
                  )}
                </button>

                <p className="text-xs text-stone-500 text-center flex items-center justify-center gap-1.5 font-medium">
                  <span>🔐</span> Payments secured by <strong>Razorpay Standard Checkout</strong> · 256-bit SSL encryption
                </p>
              </form>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24 space-y-4 bg-white shadow-sm">
              <h3 className="font-serif font-bold text-lg text-[#1c1917]">
                Order Summary
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedWeight.weight}`}
                    className="flex gap-3 items-center"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#faf8f5] shrink-0 border border-[#e8e2d5]">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="%23faf8f5"%3E%3Crect width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="%23d4a017" text-anchor="middle" dominant-baseline="middle"%3E🌾%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1c1917] text-sm font-semibold line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-stone-500 text-xs">
                        {item.selectedWeight.weight} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-[#b7860e] text-sm font-bold shrink-0">
                      ₹{(item.selectedWeight.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#f0eae1] pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="text-[#1c1917] font-semibold">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-stone-600">Parcel Transport</span>
                  <span className="badge badge-green text-xs font-semibold">
                    Payable at Counter
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-tight">
                  Transport freight differs by location & weight; payable directly at the parcel counter upon pickup.
                </p>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-[#f0eae1]">
                  <span className="text-[#1c1917]">Total</span>
                  <span className="text-[#b7860e]">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery mode highlight */}
              <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e8e2d5] text-xs text-stone-600 space-y-1">
                <p className="font-bold text-[#b7860e] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Counter Pickup Only:
                </p>
                {selectedBranch ? (
                  <p className="line-clamp-2 text-[#1c1917] font-medium">
                    📍 {selectedBranch.service} — {selectedBranch.branchName}
                  </p>
                ) : (
                  <p className="text-stone-500">Select counter on the left</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

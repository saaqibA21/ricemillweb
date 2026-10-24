// src/pages/OrderSuccess.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock, RefreshCw } from 'lucide-react';
import { useOrdersStore } from '../store/ordersStore';
import { Order } from '../types';

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const orders = useOrdersStore((s) => s.orders);
  const localOrder = orders.find((o) => o.id === orderId);

  const [liveOrder, setLiveOrder] = useState<Order | null>(localOrder || null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchOrderById = useOrdersStore((s) => s.fetchOrderById);

  const loadLiveStatus = async () => {
    if (!orderId) return;
    setIsRefreshing(true);
    try {
      const serverOrder = await fetchOrderById(orderId);
      if (serverOrder) {
        setLiveOrder(serverOrder);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    let isMounted = true;

    const run = async () => {
      const serverOrder = await fetchOrderById(orderId);
      if (serverOrder && isMounted) {
        setLiveOrder(serverOrder);
      }
    };

    run();
    // Poll every 8 seconds for live updates from admin
    const interval = setInterval(run, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderId, fetchOrderById]);

  const order = liveOrder || localOrder;

  if (!order) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-3xl text-[#1c1917] mb-4">Order not found</h2>
          <Link to="/account" className="btn-primary">View Orders</Link>
        </div>
      </main>
    );
  }

  const isDelivered = order.status === 'delivered';
  const isDispatched = ['shipped', 'delivered'].includes(order.status);
  const isPacked = ['processing', 'shipped', 'delivered'].includes(order.status) || order.status !== 'confirmed';

  const statusSteps = [
    { Icon: CheckCircle, label: 'Order Confirmed', done: true },
    { Icon: Package, label: 'Rice Bags Packed', done: isPacked },
    { Icon: Truck, label: 'Transport Dispatched', done: isDispatched },
    { Icon: CheckCircle, label: 'Ready at Counter', done: isDelivered },
  ];

  const serviceName = order.address.service || 'Parcel Counter Pickup';
  const branchName = order.address.branchName || order.address.line1;
  const branchAddr = order.address.branchAddress || order.address.line2 || `${order.address.city}, ${order.address.state}`;
  const receiverName = order.address.receiverName || order.address.label || 'Customer';
  const receiverPhone = order.address.receiverPhone || order.address.pincode;

  return (
    <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#ecfdf5] rounded-full flex items-center justify-center mx-auto mb-5 border border-[#a7f3d0] shadow-sm">
            <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-[#166534]" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1c1917] mb-2">
            {isDelivered ? 'Consignment Ready at Counter! 🎉' : 'Parcel Order Booked!'}
          </h1>
          <p className="text-stone-600 text-sm sm:text-base">
            {isDelivered
              ? 'Your rice bags have arrived and are ready for pickup at the counter 🌾'
              : 'Your rice bags are scheduled for transport booking with Hariharan Traders 🌾'}
          </p>
        </div>

        {/* Order Details Card */}
        <div className="card p-5 sm:p-6 mb-6 bg-white shadow-sm border border-[#e8e2d5]">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div>
              <p className="text-stone-500 text-xs uppercase tracking-wider mb-1 font-semibold">Order ID</p>
              <p className="text-[#b7860e] font-bold font-mono text-base sm:text-lg">{order.id}</p>
            </div>
            <div>
              <p className="text-stone-500 text-xs uppercase tracking-wider mb-1 font-semibold">Payment</p>
              <p className="text-[#1c1917] font-semibold capitalize text-sm sm:text-base">
                {order.paymentMethod === 'cod' ? '💵 Pay at Counter (COD)' : '✓ Paid via Razorpay'}
              </p>
            </div>
            <div>
              <p className="text-stone-500 text-xs uppercase tracking-wider mb-1 font-semibold">Total Amount</p>
              <p className="text-[#1c1917] font-bold text-lg sm:text-xl">₹{order.total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-stone-500 text-xs uppercase tracking-wider mb-1 font-semibold">
                <Clock className="w-3 h-3 inline mr-1" />
                Est. Dispatch
              </p>
              <p className="text-[#1c1917] font-medium text-xs sm:text-sm">
                {isDelivered ? 'Arrived at Destination' : '2–4 business days'}
              </p>
            </div>
          </div>

          {/* Parcel Pickup Counter Box */}
          <div className="bg-[#fefce8] rounded-xl p-4 sm:p-5 mb-6 border border-[#d4a017]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-bold text-[#b7860e]">
                📦 Designated Pickup Counter
              </span>
              <span className="badge badge-gold font-bold">
                No Home Delivery
              </span>
            </div>
            <p className="text-[#1c1917] font-bold text-base">{serviceName} — {branchName}</p>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">{branchAddr}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#f0eae1] text-xs text-stone-600 font-medium">
              {order.address.branchPhone && (
                <p>
                  🏢 Counter Contact:{' '}
                  <a href={`tel:${order.address.branchPhone}`} className="text-[#b7860e] font-bold hover:underline">
                    {order.address.branchPhone}
                  </a>
                </p>
              )}
              {order.address.branchDigiPin && (
                <p>
                  📍 Digi-PIN: <strong className="text-[#1c1917] font-mono">{order.address.branchDigiPin}</strong>
                </p>
              )}
              {receiverName && (
                <p>
                  👤 Consignee: <strong className="text-[#1c1917]">{receiverName}</strong>
                </p>
              )}
              {receiverPhone && (
                <p>
                  📞 Contact: <strong className="text-[#1c1917] font-mono">+91 {receiverPhone}</strong>
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#f0eae1] text-xs text-stone-600">
              ℹ️ <strong>Collection Process:</strong> Once your consignment arrives at the counter, the parcel office will call/SMS you. Bring this Order ID (<span className="font-mono font-bold text-[#b7860e]">{order.id}</span>) and your mobile number to pick up your bags.
            </div>
          </div>

          {/* Order Status Timeline with Live Status Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <p className="text-stone-500 text-xs uppercase tracking-wider font-semibold">Transport Status</p>
                <button
                  onClick={loadLiveStatus}
                  disabled={isRefreshing}
                  className="text-stone-400 hover:text-[#b7860e] transition-colors p-1 rounded-lg"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#b7860e]' : ''}`} />
                </button>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isDelivered
                    ? 'bg-green-100 text-[#166534] border border-green-300'
                    : isDispatched
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                ● {isDelivered ? 'Ready for Pickup / Delivered' : order.status}
              </span>
            </div>

            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-4 right-4 h-1 bg-stone-200 -z-0 rounded-full" />
              <div
                className="absolute top-4 left-4 h-1 bg-[#166534] -z-0 rounded-full transition-all duration-500"
                style={{
                  width: isDelivered ? '92%' : isDispatched ? '62%' : isPacked ? '32%' : '0%',
                }}
              />
              {statusSteps.map(({ Icon, label, done }) => (
                <div key={label} className="relative flex flex-col items-center gap-2 flex-1 z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                      done
                        ? 'bg-[#166534] border-[#166534] text-white shadow-md'
                        : 'bg-white border-stone-300 text-stone-400'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <p
                    className={`text-[11px] text-center leading-tight max-w-[85px] font-semibold ${
                      done ? 'text-[#166534]' : 'text-stone-400'
                    }`}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Items Summary */}
        <div className="card p-6 mb-8 bg-white shadow-sm border border-[#e8e2d5]">
          <h3 className="font-serif font-bold text-[#1c1917] mb-4">Items Ordered</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedWeight.weight}`}
                className="flex justify-between items-center"
              >
                <div>
                  <p className="text-[#1c1917] text-sm font-semibold">{item.product.name}</p>
                  <p className="text-stone-500 text-xs">
                    {item.selectedWeight.weight} × {item.quantity}
                  </p>
                </div>
                <span className="text-[#b7860e] font-bold">
                  ₹{(item.selectedWeight.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps Card */}
        <div className="card p-5 mb-8 bg-white shadow-sm border border-[#e8e2d5]">
          <h3 className="font-serif font-bold text-[#1c1917] mb-2">Transport Delivery Steps</h3>
          <ol className="text-stone-600 text-xs sm:text-sm space-y-1.5 list-decimal list-inside font-medium">
            <li>Your order is sent to the mill for quality bag packing.</li>
            <li>Hariharan Traders books the consignment with the parcel transport service.</li>
            <li>You will receive an SMS/WhatsApp with the lorry waybill number.</li>
            <li>Visit the counter, pay the nominal freight charge, and collect your rice bags.</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/shop" className="btn-primary text-center">
            Continue Shopping
          </Link>
          <Link to="/account" className="btn-secondary text-center">
            View All Orders
          </Link>
        </div>
      </div>
    </main>
  );
}

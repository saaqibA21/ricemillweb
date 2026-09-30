// src/pages/OrderSuccess.tsx
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock, ShoppingBag } from 'lucide-react';
import { useOrdersStore } from '../store/ordersStore';

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const orders = useOrdersStore((s) => s.orders);
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-3xl text-white mb-4">Order not found</h2>
          <Link to="/account" className="btn-primary">View Orders</Link>
        </div>
      </main>
    );
  }

  const statusSteps = [
    { Icon: CheckCircle, label: 'Order Confirmed', done: true },
    { Icon: Package, label: 'Rice Bags Packed', done: order.status !== 'confirmed' },
    { Icon: Truck, label: 'Transport Dispatched', done: ['shipped', 'delivered'].includes(order.status) },
    { Icon: CheckCircle, label: 'Ready at Counter', done: order.status === 'delivered' },
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
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#1e5c1e]/30 rounded-full flex items-center justify-center mx-auto mb-5 border border-[#7ec07e]/30">
            <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-[#7ec07e]" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">Parcel Order Booked!</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Your rice bags are scheduled for transport booking with Hariharan Traders 🌾
          </p>
        </div>

        {/* Order Details Card */}
        <div className="card p-5 sm:p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Order ID</p>
              <p className="text-[#d4a017] font-bold font-mono text-base sm:text-lg">{order.id}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Payment</p>
              <p className="text-white font-semibold capitalize text-sm sm:text-base">
                {order.paymentMethod === 'cod' ? '💵 Pay at Counter (COD)' : '✓ Paid via Razorpay'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-white font-bold text-lg sm:text-xl">₹{order.total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                <Clock className="w-3 h-3 inline mr-1" />
                Est. Dispatch
              </p>
              <p className="text-white font-medium text-xs sm:text-sm">2–4 business days</p>
            </div>
          </div>

          {/* Parcel Pickup Counter Box */}
          <div className="bg-[#0f1a0f] rounded-xl p-4 sm:p-5 mb-6 border border-[#2d4a2d]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-bold text-[#d4a017]">
                📦 Designated Pickup Counter
              </span>
              <span className="text-[11px] bg-[#1e5c1e] text-[#a7f3d0] px-2 py-0.5 rounded font-medium">
                No Home Delivery
              </span>
            </div>
            <p className="text-white font-bold text-base">{serviceName} — {branchName}</p>
            <p className="text-gray-300 text-xs sm:text-sm mt-1">{branchAddr}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#1a2e1a] text-xs text-gray-400">
              {order.address.branchPhone && (
                <p>
                  🏢 Counter Contact:{' '}
                  <a href={`tel:${order.address.branchPhone}`} className="text-[#d4a017] font-semibold hover:underline">
                    {order.address.branchPhone}
                  </a>
                </p>
              )}
              {order.address.branchDigiPin && (
                <p>
                  📍 Digi-PIN: <strong className="text-white font-mono">{order.address.branchDigiPin}</strong>
                </p>
              )}
              {order.address.receiverName && (
                <p>
                  👤 Receiver: <strong className="text-white">{order.address.receiverName}</strong>
                </p>
              )}
              {order.address.receiverPhone && (
                <p>
                  📞 Phone for SMS: <strong className="text-white">{order.address.receiverPhone}</strong>
                </p>
              )}
            </div>

            <div className="mt-3 p-2.5 rounded bg-[#162416] border border-[#234223] text-xs text-[#a7f3d0]">
              ℹ️ <strong>Collection Process:</strong> Once your consignment arrives at the counter, the parcel office will call/SMS you. Bring this Order ID (<span className="font-mono font-bold text-white">{order.id}</span>) and your mobile number to pick up your bags.
            </div>
          </div>

          {/* Order Status Timeline */}
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-4">Transport Status</p>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-4 right-4 h-px bg-[#2d4a2d]" />
              {statusSteps.map(({ Icon, label, done }) => (
                <div key={label} className="relative flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                      done ? 'bg-[#1e5c1e] text-[#7ec07e]' : 'bg-[#1a2e1a] text-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-gray-400 text-center leading-tight max-w-[85px]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Items Summary */}
        <div className="card p-6 mb-8">
          <h3 className="font-serif font-semibold text-white mb-4">Items Ordered</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedWeight.weight}`}
                className="flex justify-between items-center"
              >
                <div>
                  <p className="text-white text-sm font-medium">{item.product.name}</p>
                  <p className="text-gray-400 text-xs">
                    {item.selectedWeight.weight} × {item.quantity}
                  </p>
                </div>
                <span className="text-[#d4a017] font-semibold">
                  ₹{(item.selectedWeight.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/account" className="btn-secondary flex-1 justify-center py-3">
            Track Order
          </Link>
          <Link to="/shop" className="btn-primary flex-1 justify-center py-3">
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          Order confirmation sent to your registered phone number.
          For support: <a href="tel:+917810990099" className="text-[#d4a017]">+91 78109 90099</a>
        </p>
      </div>
    </main>
  );
}

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
    { Icon: Package, label: 'Being Packed', done: order.status !== 'confirmed' },
    { Icon: Truck, label: 'Out for Delivery', done: ['shipped', 'delivered'].includes(order.status) },
    { Icon: CheckCircle, label: 'Delivered', done: order.status === 'delivered' },
  ];

  return (
    <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-[#1e5c1e]/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-14 h-14 text-[#7ec07e]" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-white mb-2">Order Placed!</h1>
          <p className="text-gray-400 text-lg">
            Thank you for shopping with Hariharan Traders 🌾
          </p>
        </div>

        {/* Order Details Card */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Order ID</p>
              <p className="text-[#d4a017] font-bold font-mono text-lg">{order.id}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Payment</p>
              <p className="text-white font-semibold capitalize">
                {order.paymentMethod === 'upi' ? '✓ UPI Paid' : '💵 Cash on Delivery'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Paid</p>
              <p className="text-white font-bold text-xl">₹{order.total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                <Clock className="w-3 h-3 inline mr-1" />
                Est. Delivery
              </p>
              <p className="text-white font-medium text-sm">{order.estimatedDelivery}</p>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-[#0f1a0f] rounded-xl p-4 mb-6">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Delivering to</p>
            <p className="text-white text-sm">
              {order.address.line1}
              {order.address.line2 && `, ${order.address.line2}`}
            </p>
            <p className="text-white text-sm">
              {order.address.city}, {order.address.state} — {order.address.pincode}
            </p>
          </div>

          {/* Order Status Timeline */}
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-4">Order Status</p>
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
                  <p className="text-xs text-gray-400 text-center leading-tight max-w-[80px]">
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
          For support: <a href="tel:+919876543210" className="text-[#d4a017]">+91 98765 43210</a>
        </p>
      </div>
    </main>
  );
}

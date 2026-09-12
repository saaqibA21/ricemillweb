// src/pages/Account.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Package, LogOut, ChevronRight, Clock, CheckCircle, Truck, XCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useOrdersStore } from '../store/ordersStore';

const statusConfig: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  confirmed: { label: 'Confirmed', color: 'text-[#7ec07e]', Icon: CheckCircle },
  processing: { label: 'Processing', color: 'text-[#fcd34d]', Icon: Clock },
  shipped: { label: 'Shipped', color: 'text-[#60a5fa]', Icon: Truck },
  delivered: { label: 'Delivered', color: 'text-[#7ec07e]', Icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-400', Icon: XCircle },
  pending: { label: 'Pending', color: 'text-gray-400', Icon: Clock },
};

export default function Account() {
  const { user, logout, isLoggedIn } = useAuthStore();
  const { orders } = useOrdersStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  if (!isLoggedIn) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="font-serif text-3xl text-white mb-4">Please login</h2>
          <Link to="/login" className="btn-primary">Login / Sign Up</Link>
        </div>
      </main>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-white">
              Hello, {user?.name || 'Friend'} 👋
            </h1>
            <p className="text-gray-400 mt-1">+91 {user?.phone}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors border border-red-400/30 px-4 py-2 rounded-lg hover:bg-red-400/10"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1a2e1a] p-1 rounded-xl mb-8 w-fit">
          {[
            { key: 'orders', label: 'My Orders', Icon: Package },
            { key: 'profile', label: 'Profile', Icon: User },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'orders' | 'profile')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-[#d4a017] text-[#0f1a0f]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="font-serif text-2xl text-white mb-3">No orders yet</h3>
                <p className="text-gray-400 mb-6">Your order history will appear here.</p>
                <Link to="/shop" className="btn-primary">Shop Now</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusInfo =
                    statusConfig[order.status] || statusConfig['pending'];
                  const { Icon: StatusIcon, label, color } = statusInfo;

                  return (
                    <div key={order.id} className="card p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-[#d4a017] font-bold font-mono">{order.id}</p>
                          <p className="text-gray-400 text-sm mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`flex items-center gap-1.5 text-sm font-semibold ${color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {label}
                          </span>
                          <span className="text-white font-bold text-lg">
                            ₹{order.total.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item) => (
                          <div
                            key={`${item.product.id}-${item.selectedWeight.weight}`}
                            className="flex items-center gap-2 bg-[#0f1a0f] rounded-lg px-3 py-1.5"
                          >
                            <span className="text-sm text-white">{item.product.name}</span>
                            <span className="text-xs text-gray-400">
                              {item.selectedWeight.weight} × {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1a2e1a]">
                        <span className="text-xs text-gray-400">
                          Payment:{' '}
                          <span className="text-white capitalize">
                            {order.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}
                          </span>
                        </span>
                        <Link
                          to={`/order-success/${order.id}`}
                          className="flex items-center gap-1 text-[#d4a017] text-sm hover:underline"
                        >
                          View Details <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card p-6 max-w-lg">
            <h3 className="font-serif font-bold text-xl text-white mb-6">Profile Details</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Mobile Number</label>
                <div className="flex">
                  <span className="flex items-center px-4 bg-[#0f1a0f] border border-[#2d4a2d] border-r-0 rounded-l-lg text-gray-400 text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    defaultValue={user?.phone}
                    readOnly
                    className="input rounded-l-none bg-[#0f1a0f] cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Phone number cannot be changed (used for login)
                </p>
              </div>
              <div>
                <label className="label">Email (optional)</label>
                <input type="email" placeholder="your@email.com" className="input" />
              </div>
              <button className="btn-primary w-full justify-center py-3">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

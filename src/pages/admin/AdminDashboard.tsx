// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  RefreshCw,
  LogOut,
  Search,
  MessageSquare,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
  product: { name: string };
  selectedWeight: { weight: string; price: number };
  quantity: number;
}

interface OrderRecord {
  id: string;
  items: OrderItem[];
  total: number | string;
  status: string;
  payment_method: string;
  payment_status: string;
  address: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  created_at: string;
  estimated_delivery?: string;
}

interface FeedbackRecord {
  id: string;
  name: string;
  phone?: string;
  email: string;
  subject?: string;
  message: string;
  created_at: string;
}

interface ExportRecord {
  id: string;
  company_name?: string;
  contact_name: string;
  phone: string;
  email: string;
  country: string;
  products?: string;
  quantity?: string;
  message?: string;
  status: string;
  created_at: string;
}

interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrdersCount: number;
  confirmedOrdersCount: number;
  deliveredOrdersCount: number;
  upiCount: number;
  upiTotal: number;
  codCount: number;
  codTotal: number;
  pendingPaymentsCount: number;
  pendingPaymentTotal: number;
  paidPaymentsCount: number;
  paidPaymentTotal: number;
  feedbacksCount: number;
  exportRequestsCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [exportRequests, setExportRequests] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'feedbacks' | 'export'>('orders');

  const [orderSearch, setOrderSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');

  const fetchData = async () => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/data', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load admin data');

      setStats(data.stats);
      setOrders(data.orders || []);
      setFeedbacks(data.feedbacks || []);
      setExportRequests(data.exportRequests || []);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error fetching dashboard data';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    toast.success('Signed out');
    navigate('/admin/login');
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string, newPaymentStatus?: string) => {
    setUpdatingOrderId(id);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          status: newStatus,
          paymentStatus: newPaymentStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      toast.success(`Order ${id} updated to ${newStatus}`);
      fetchData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Update failed';
      toast.error(errorMsg);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderSearch) {
        const q = orderSearch.toLowerCase();
        const idMatch = o.id.toLowerCase().includes(q);
        const nameMatch = o.address?.fullName?.toLowerCase().includes(q);
        const phoneMatch = o.address?.phone?.includes(q);
        if (!idMatch && !nameMatch && !phoneMatch) return false;
      }
      if (paymentMethodFilter !== 'all' && o.payment_method !== paymentMethodFilter) return false;
      if (paymentStatusFilter !== 'all' && o.payment_status !== paymentStatusFilter) return false;
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
      return true;
    });
  }, [orders, orderSearch, paymentMethodFilter, paymentStatusFilter, orderStatusFilter]);

  if (!token) return null;

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#091109] text-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1b2e1b] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-[#d4a017]/20 border border-[#d4a017]/40 text-[#d4a017] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Management Portal
              </span>
              <span className="text-gray-400 text-xs">Live Database Connected</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
              Hariharan Traders Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 bg-[#122412] hover:bg-[#1a331a] text-gray-300 px-4 py-2 rounded-xl text-sm border border-[#234023] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-[#d4a017] ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 px-4 py-2 rounded-xl text-sm border border-red-800/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* KPI Metric Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#112211] border border-[#1e3d1e] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Sales</span>
                <div className="w-9 h-9 rounded-xl bg-[#d4a017]/10 flex items-center justify-center text-[#d4a017]">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
              <div className="font-serif text-3xl font-bold text-white mt-2">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                {stats.totalOrders} total orders placed
              </div>
            </div>

            <div className="bg-[#112211] border border-[#1e3d1e] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Payment Channels</span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between text-xs">
                <div>
                  <span className="text-gray-400 block">UPI / Online</span>
                  <span className="text-base font-bold text-white">₹{stats.upiTotal.toLocaleString('en-IN')}</span>
                  <span className="text-gray-400 ml-1">({stats.upiCount})</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block">Cash on Delivery</span>
                  <span className="text-base font-bold text-white">₹{stats.codTotal.toLocaleString('en-IN')}</span>
                  <span className="text-gray-400 ml-1">({stats.codCount})</span>
                </div>
              </div>
            </div>

            <div className="bg-[#112211] border border-[#1e3d1e] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Collection Status</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between text-xs">
                <div>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Received
                  </span>
                  <span className="text-base font-bold text-emerald-400">₹{stats.paidPaymentTotal.toLocaleString('en-IN')}</span>
                  <span className="text-gray-400 ml-1">({stats.paidPaymentsCount})</span>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 flex items-center justify-end gap-1">
                    <Clock className="w-3.5 h-3.5" /> Pending (COD)
                  </span>
                  <span className="text-base font-bold text-amber-400">₹{stats.pendingPaymentTotal.toLocaleString('en-IN')}</span>
                  <span className="text-gray-400 ml-1">({stats.pendingPaymentsCount})</span>
                </div>
              </div>
            </div>

            <div className="bg-[#112211] border border-[#1e3d1e] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Inquiries & Leads</span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Feedback</span>
                  <span className="text-2xl font-bold text-white">{stats.feedbacksCount}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Wholesale Leads</span>
                  <span className="text-2xl font-bold text-[#d4a017]">{stats.exportRequestsCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1f381f] gap-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-[#d4a017] text-[#d4a017]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'feedbacks'
                ? 'border-[#d4a017] text-[#d4a017]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Customer Feedbacks ({feedbacks.length})
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-[#d4a017] text-[#d4a017]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            Wholesale & Export Requests ({exportRequests.length})
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-[#0f1e0f] border border-[#1a331a] p-4 rounded-2xl flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-[#0a150a] border border-[#1e381e] rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#d4a017]"
                />
              </div>

              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="bg-[#0a150a] border border-[#1e381e] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#d4a017]"
              >
                <option value="all">All Payment Methods</option>
                <option value="upi">UPI / Online</option>
                <option value="cod">Cash on Delivery</option>
              </select>

              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="bg-[#0a150a] border border-[#1e381e] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#d4a017]"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-[#0a150a] border border-[#1e381e] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#d4a017]"
              >
                <option value="all">All Order Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-[#101d10] border border-[#1b331b] rounded-2xl p-12 text-center text-gray-400">
                <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-300">No orders found</p>
                <p className="text-sm mt-1">Orders placed on checkout will automatically appear here in real-time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((o) => {
                  const isExpanded = expandedOrderId === o.id;
                  const isUpdating = updatingOrderId === o.id;

                  return (
                    <div
                      key={o.id}
                      className="bg-[#102010] border border-[#1c381c] hover:border-[#274f27] rounded-2xl p-4 sm:p-5 transition-all shadow-md"
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-sm font-bold text-[#f5d061]">{o.id}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(o.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>

                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                o.status === 'delivered'
                                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                                  : o.status === 'shipped'
                                  ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                                  : 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                              }`}
                            >
                              {o.status}
                            </span>

                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                o.payment_status === 'paid'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                              }`}
                            >
                              {o.payment_method.toUpperCase()} • {o.payment_status}
                            </span>
                          </div>

                          <div className="mt-2 text-sm text-gray-200 font-medium">
                            {o.address?.fullName || 'Customer'}
                            {o.address?.phone && (
                              <span className="text-gray-400 ml-2 font-normal font-mono text-xs">
                                📞 {o.address.phone}
                              </span>
                            )}
                            <span className="text-gray-400 ml-3 text-xs">
                              📍 {o.address?.city}, {o.address?.state} - {o.address?.pincode}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-[#1c361c] pt-3 md:pt-0">
                          <div className="text-left md:text-right">
                            <span className="text-xs text-gray-400 block">Total</span>
                            <span className="font-serif font-bold text-xl text-white">
                              ₹{Number(o.total).toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {o.status !== 'delivered' && (
                              <button
                                onClick={() =>
                                  handleUpdateOrderStatus(
                                    o.id,
                                    o.status === 'confirmed' ? 'shipped' : 'delivered',
                                    o.payment_method === 'cod' && o.status === 'shipped' ? 'paid' : undefined
                                  )
                                }
                                disabled={isUpdating}
                                className="bg-[#1a381a] hover:bg-[#234c23] text-xs text-[#e5b32f] border border-[#2d5c2d] px-3 py-1.5 rounded-xl transition-colors"
                              >
                                {o.status === 'confirmed' ? 'Mark Shipped 🚚' : 'Mark Delivered ✅'}
                              </button>
                            )}

                            {o.payment_status === 'pending' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(o.id, o.status, 'paid')}
                                disabled={isUpdating}
                                className="bg-emerald-900/40 hover:bg-emerald-900/70 text-xs text-emerald-300 border border-emerald-700/50 px-2.5 py-1.5 rounded-xl transition-colors"
                              >
                                Mark Paid
                              </button>
                            )}

                            <button
                              onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                              title="View details"
                            >
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[#1b361b] grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div>
                            <h4 className="font-semibold text-xs text-[#d4a017] uppercase tracking-wider mb-2">
                              Ordered Items ({Array.isArray(o.items) ? o.items.length : 0})
                            </h4>
                            <div className="space-y-2 bg-[#0c170c] p-3 rounded-xl border border-[#172c17]">
                              {Array.isArray(o.items) &&
                                o.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs">
                                    <span className="text-gray-200">
                                      {item.product?.name || 'Rice Variety'} &nbsp;
                                      <span className="text-gray-400">({item.selectedWeight?.weight})</span>
                                    </span>
                                    <span className="font-mono text-gray-300">
                                      {item.quantity} × ₹{item.selectedWeight?.price} = ₹
                                      {item.quantity * (item.selectedWeight?.price || 0)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-xs text-[#d4a017] uppercase tracking-wider mb-2">
                              Shipping & Contact Info
                            </h4>
                            <div className="bg-[#0c170c] p-3 rounded-xl border border-[#172c17] text-xs space-y-1 text-gray-300 leading-relaxed">
                              <p className="font-semibold text-white">{o.address?.fullName}</p>
                              <p>{o.address?.line1}</p>
                              {o.address?.line2 && <p>{o.address.line2}</p>}
                              <p>
                                {o.address?.city}, {o.address?.state} — {o.address?.pincode}
                              </p>
                              <div className="pt-2 flex items-center gap-3">
                                {o.address?.phone && (
                                  <a
                                    href={`tel:${o.address.phone}`}
                                    className="text-[#d4a017] hover:underline flex items-center gap-1"
                                  >
                                    <Phone className="w-3.5 h-3.5" /> Call Customer
                                  </a>
                                )}
                                {o.address?.phone && (
                                  <a
                                    href={`https://wa.me/91${o.address.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-400 hover:underline flex items-center gap-1"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FEEDBACKS */}
        {activeTab === 'feedbacks' && (
          <div className="space-y-4">
            {feedbacks.length === 0 ? (
              <div className="bg-[#101d10] border border-[#1b331b] rounded-2xl p-12 text-center text-gray-400">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-300">No feedbacks received yet</p>
                <p className="text-sm mt-1">Messages sent through the Contact Us form will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbacks.map((f) => (
                  <div key={f.id} className="bg-[#102010] border border-[#1c381c] rounded-2xl p-5 shadow-md space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-white text-base">{f.name}</h3>
                        <p className="text-xs text-[#d4a017]">{f.subject || 'General Inquiry'}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(f.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 bg-[#0b140b] p-3 rounded-xl border border-[#172b17] leading-relaxed">
                      "{f.message}"
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-[#182f18]">
                      {f.email && (
                        <a href={`mailto:${f.email}`} className="text-blue-400 hover:underline flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> {f.email}
                        </a>
                      )}
                      {f.phone && (
                        <a href={`tel:${f.phone}`} className="text-emerald-400 hover:underline flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> {f.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WHOLESALE & EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            {exportRequests.length === 0 ? (
              <div className="bg-[#101d10] border border-[#1b331b] rounded-2xl p-12 text-center text-gray-400">
                <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-300">No export or wholesale inquiries yet</p>
                <p className="text-sm mt-1">Bulk business inquiries submitted on /wholesale and /export will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportRequests.map((r) => (
                  <div key={r.id} className="bg-[#102010] border border-[#1c381c] rounded-2xl p-5 shadow-md space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">
                          {r.country || 'India'}
                        </span>
                        <h3 className="font-bold text-white text-base mt-0.5">
                          {r.company_name ? `${r.company_name} (${r.contact_name})` : r.contact_name}
                        </h3>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#0b140b] p-3 rounded-xl border border-[#172b17]">
                      <div>
                        <span className="text-gray-400 block">Products Requested</span>
                        <span className="font-semibold text-white">{r.products || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Target Quantity</span>
                        <span className="font-semibold text-[#d4a017]">{r.quantity || 'Not specified'}</span>
                      </div>
                    </div>

                    {r.message && (
                      <p className="text-xs text-gray-300 leading-relaxed italic">
                        "{r.message}"
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#182f18] text-xs">
                      <div className="flex items-center gap-3">
                        <a href={`tel:${r.phone}`} className="text-emerald-400 hover:underline flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" /> {r.phone}
                        </a>
                        <a href={`mailto:${r.email}`} className="text-blue-400 hover:underline flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" /> {r.email}
                        </a>
                      </div>

                      <a
                        href={`https://wa.me/${r.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 px-3 py-1 rounded-lg flex items-center gap-1 border border-[#25D366]/30 font-medium"
                      >
                        Contact on WhatsApp <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

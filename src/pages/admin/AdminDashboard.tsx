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
  Package,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Image as ImageIcon,
  X,
  Save,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Product, PriceOption } from '../../types';
import { useProductsStore } from '../../store/productsStore';
import {
  compressImageFile,
  compressImageDataUrl,
  getDataUrlSizeBytes,
  formatFileSize,
} from '../../utils/imageCompressor';

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

const emptyProduct: Product = {
  id: '',
  name: '',
  nameTa: '',
  slug: '',
  variety: 'Basmati',
  varietyTa: 'பாஸ்மதி',
  description: '',
  descriptionTa: '',
  longDescription: '',
  longDescriptionTa: '',
  image: '/assets/rice-bowl.jpg',
  images: ['/assets/rice-bowl.jpg'],
  grainLength: '8.0mm',
  aroma: 'Natural',
  moisture: '≤12.5%',
  cookingTime: '18 min',
  bestFor: ['Daily Cooking', 'Special Meals'],
  badges: ['Premium Quality'],
  prices: [
    { weight: '1 kg', weightKg: 1, price: 90, originalPrice: 100 },
    { weight: '5 kg', weightKg: 5, price: 430, originalPrice: 480 },
    { weight: '25 kg', weightKg: 25, price: 2100, originalPrice: 2350 },
  ],
  stock: 100,
  rating: 5.0,
  reviews: 12,
  isWholesaleAvailable: true,
  minWholesaleQty: 50,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [exportRequests, setExportRequests] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'feedbacks' | 'export'>('orders');

  // Products management state
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [imageUploadTab, setImageUploadTab] = useState<'upload' | 'url'>('upload');
  const [compressingImage, setCompressingImage] = useState(false);

  const [orderSearch, setOrderSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);

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

  const fetchAdminProducts = async () => {
    try {
      const res = await fetch('/api/admin/products', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAdminProducts(data);
          return;
        }
      }
    } catch (err) {
      console.warn('Could not fetch products from admin endpoint:', err);
    }
    // Fallback to store products
    setAdminProducts(useProductsStore.getState().products);
  };

  useEffect(() => {
    fetchData();
    fetchAdminProducts();
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

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send test email');
      toast.success(data.message || 'Test email sent successfully! Check your inbox.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send test email';
      toast.error(msg);
    } finally {
      setTestingEmail(false);
    }
  };

  // Product CRUD Handlers
  const handleOpenAddProduct = () => {
    setIsNewProduct(true);
    setEditingProduct({
      ...emptyProduct,
      id: `rm-${Date.now()}`,
    });
  };

  const handleOpenEditProduct = (prod: Product) => {
    setIsNewProduct(false);
    setEditingProduct({ ...prod });
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    // Reset input so user can re-select if needed
    e.target.value = '';

    if (file.size > 30 * 1024 * 1024) {
      toast.error('Image size must be less than 30MB');
      return;
    }

    setCompressingImage(true);
    const toastId = toast.loading('Auto-compressing image...');

    try {
      const res = await compressImageFile(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.82,
        maxSizeBytes: 600 * 1024,
      });

      setEditingProduct((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          image: res.dataUrl,
          images: [res.dataUrl, ...(prev.images?.slice(1) || [])],
        };
      });

      const orig = formatFileSize(res.originalSizeBytes);
      const comp = formatFileSize(res.compressedSizeBytes);
      toast.success(`Image auto-compressed: ${orig} → ${comp}!`, { id: toastId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error compressing image';
      toast.error(msg, { id: toastId });
    } finally {
      setCompressingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    setSavingProduct(true);
    try {
      let productToSave = { ...editingProduct };

      // Pre-save safety auto-compression:
      // If image is a raw data URL > 600KB, auto-compress to avoid Vercel 413 payload limit
      if (
        productToSave.image &&
        productToSave.image.startsWith('data:image/') &&
        getDataUrlSizeBytes(productToSave.image) > 600 * 1024
      ) {
        toast.loading('Auto-compressing image before saving...', { id: 'pre-save-compress' });
        try {
          const res = await compressImageDataUrl(productToSave.image, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.8,
            maxSizeBytes: 500 * 1024,
          });
          productToSave.image = res.dataUrl;
          productToSave.images = [res.dataUrl, ...(productToSave.images?.slice(1) || [])];
        } catch {
          // Continue if pre-save compression fails
        } finally {
          toast.dismiss('pre-save-compress');
        }
      }

      const method = isNewProduct ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/products', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productToSave),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      toast.success(isNewProduct ? 'New product created!' : 'Product updated successfully!');
      setEditingProduct(null);
      await fetchAdminProducts();
      await useProductsStore.getState().fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving product';
      toast.error(msg);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');

      toast.success(`Product "${name}" deleted`);
      await fetchAdminProducts();
      await useProductsStore.getState().fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting product';
      toast.error(msg);
    }
  };

  const handleAddPriceTier = () => {
    if (!editingProduct) return;
    const newTier: PriceOption = {
      weight: '10 kg',
      weightKg: 10,
      price: 850,
      originalPrice: 950,
    };
    setEditingProduct({
      ...editingProduct,
      prices: [...editingProduct.prices, newTier],
    });
  };

  const handleRemovePriceTier = (index: number) => {
    if (!editingProduct) return;
    if (editingProduct.prices.length <= 1) {
      toast.error('Product must have at least one pack size/price');
      return;
    }
    const updated = editingProduct.prices.filter((_, i) => i !== index);
    setEditingProduct({
      ...editingProduct,
      prices: updated,
    });
  };

  const handlePriceChange = (index: number, field: keyof PriceOption, val: string | number) => {
    if (!editingProduct) return;
    const updated = [...editingProduct.prices];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    setEditingProduct({
      ...editingProduct,
      prices: updated,
    });
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

  const filteredAdminProducts = useMemo(() => {
    return adminProducts.filter((p) => {
      if (!productSearch) return true;
      const q = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.variety.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    });
  }, [adminProducts, productSearch]);

  if (!token) return null;

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#faf8f5] text-[#1c1917]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e8e2d5] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-[#fefce8] border border-[#d4a017] text-[#926b09] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                Management Portal
              </span>
              <span className="text-stone-500 text-xs font-medium">Live Database Connected</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1c1917] mt-1.5">
              Hariharan Traders Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTestEmail}
              disabled={testingEmail}
              className="flex items-center gap-2 bg-white hover:bg-[#faf8f5] text-stone-700 px-4 py-2.5 rounded-xl text-sm border border-[#e8e2d5] font-semibold transition-colors disabled:opacity-50 shadow-sm"
              title="Verify SMTP configuration by sending a test email"
            >
              <Mail className={`w-4 h-4 text-[#b7860e] ${testingEmail ? 'animate-bounce' : ''}`} />
              {testingEmail ? 'Sending Test...' : 'Test SMTP'}
            </button>
            <button
              onClick={() => {
                fetchData();
                fetchAdminProducts();
              }}
              disabled={loading}
              className="flex items-center gap-2 bg-white hover:bg-[#faf8f5] text-stone-700 px-4 py-2.5 rounded-xl text-sm border border-[#e8e2d5] font-semibold transition-colors disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 text-[#b7860e] ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2.5 rounded-xl text-sm border border-red-200 font-semibold transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* KPI Metric Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-[#e8e2d5] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">Total Sales</span>
                <div className="w-9 h-9 rounded-xl bg-[#fefce8] border border-[#fde68a] flex items-center justify-center text-[#b7860e]">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
              <div className="font-serif text-3xl font-bold text-[#1c1917] mt-2">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </div>
              <div className="mt-2 text-xs text-stone-500 font-medium">
                {stats.totalOrders} total orders placed
              </div>
            </div>

            <div className="bg-white border border-[#e8e2d5] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">Payment Channels</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between text-xs">
                <div>
                  <span className="text-stone-500 block">UPI / Online</span>
                  <span className="text-base font-bold text-[#1c1917]">₹{stats.upiTotal.toLocaleString('en-IN')}</span>
                  <span className="text-stone-400 ml-1">({stats.upiCount})</span>
                </div>
                <div className="text-right">
                  <span className="text-stone-500 block">Cash on Delivery</span>
                  <span className="text-base font-bold text-[#1c1917]">₹{stats.codTotal.toLocaleString('en-IN')}</span>
                  <span className="text-stone-400 ml-1">({stats.codCount})</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e8e2d5] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">Collection Status</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between text-xs">
                <div>
                  <span className="text-[#166534] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Received
                  </span>
                  <span className="text-base font-bold text-[#166534]">₹{stats.paidPaymentTotal.toLocaleString('en-IN')}</span>
                  <span className="text-stone-400 ml-1">({stats.paidPaymentsCount})</span>
                </div>
                <div className="text-right">
                  <span className="text-amber-700 flex items-center justify-end gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> Pending (COD)
                  </span>
                  <span className="text-base font-bold text-amber-700">₹{stats.pendingPaymentTotal.toLocaleString('en-IN')}</span>
                  <span className="text-stone-400 ml-1">({stats.pendingPaymentsCount})</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e8e2d5] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">Inquiries & Leads</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-stone-500 block font-medium">Customer Messages</span>
                  <span className="text-2xl font-bold text-[#1c1917]">{stats.feedbacksCount}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-500 block font-medium">Wholesale Leads</span>
                  <span className="text-2xl font-bold text-[#b7860e]">{stats.exportRequestsCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e8e2d5] gap-4 sm:gap-6 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-touch">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 sm:pb-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'orders'
                ? 'border-[#d4a017] text-[#b7860e]'
                : 'border-transparent text-stone-500 hover:text-[#1c1917]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Orders &amp; Payments ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 sm:pb-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'products'
                ? 'border-[#d4a017] text-[#b7860e]'
                : 'border-transparent text-stone-500 hover:text-[#1c1917]'
            }`}
          >
            <Package className="w-4 h-4" />
            Products &amp; Inventory ({adminProducts.length})
          </button>

          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`pb-3 sm:pb-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'feedbacks'
                ? 'border-[#d4a017] text-[#b7860e]'
                : 'border-transparent text-stone-500 hover:text-[#1c1917]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Customer Feedbacks ({feedbacks.length})
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 sm:pb-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'export'
                ? 'border-[#d4a017] text-[#b7860e]'
                : 'border-transparent text-stone-500 hover:text-[#1c1917]'
            }`}
          >
            <Globe className="w-4 h-4" />
            Wholesale &amp; Export Inquiries ({exportRequests.length})
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#e8e2d5] p-4 rounded-2xl flex flex-wrap items-center gap-4 shadow-sm">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-[#faf8f5] border border-[#d6cfc3] rounded-xl pl-9 pr-4 py-2 text-sm text-[#1c1917] focus:outline-none focus:border-[#d4a017]"
                />
              </div>

              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="bg-white border border-[#d6cfc3] rounded-xl px-3 py-2 text-[#1c1917] text-xs font-medium focus:outline-none focus:border-[#d4a017]"
              >
                <option value="all">All Payment Methods</option>
                <option value="razorpay">Razorpay Online</option>
                <option value="cod">Cash on Delivery</option>
              </select>

              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="bg-white border border-[#d6cfc3] rounded-xl px-3 py-2 text-[#1c1917] text-xs font-medium focus:outline-none focus:border-[#d4a017]"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-white border border-[#d6cfc3] rounded-xl px-3 py-2 text-[#1c1917] text-xs font-medium focus:outline-none focus:border-[#d4a017]"
              >
                <option value="all">All Order Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white border border-[#e8e2d5] rounded-2xl p-12 text-center text-stone-500 shadow-sm">
                <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                <p className="text-lg font-bold text-[#1c1917]">No orders found</p>
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
                      className="bg-white border border-[#e8e2d5] hover:border-[#d4a017] rounded-2xl p-4 sm:p-5 transition-all shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-sm font-bold text-[#b7860e]">{o.id}</span>
                            <span className="text-xs text-stone-500">
                              {new Date(o.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>

                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                o.status === 'delivered'
                                  ? 'bg-[#ecfdf5] text-[#166534] border border-[#a7f3d0]'
                                  : o.status === 'shipped'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {o.status}
                            </span>

                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                o.payment_status === 'paid'
                                  ? 'bg-[#ecfdf5] text-[#166534] border border-[#a7f3d0]'
                                  : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                              }`}
                            >
                              {o.payment_method.toUpperCase()} • {o.payment_status}
                            </span>
                          </div>

                          <div className="mt-2 text-sm text-[#1c1917] font-semibold">
                            {o.address?.fullName || 'Customer'}
                            {o.address?.phone && (
                              <span className="text-stone-500 ml-2 font-normal font-mono text-xs">
                                📞 {o.address.phone}
                              </span>
                            )}
                            <span className="text-stone-500 ml-3 text-xs font-normal">
                              📍 {o.address?.city}, {o.address?.state} - {o.address?.pincode}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-[#f0eae1] pt-3 md:pt-0">
                          <div className="text-left md:text-right">
                            <span className="text-xs text-stone-500 block font-medium">Total</span>
                            <span className="font-serif font-bold text-xl text-[#1c1917]">
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
                                className="bg-[#fefce8] hover:bg-[#fef08a] text-xs text-[#926b09] border border-[#d4a017] px-3 py-1.5 rounded-xl font-bold transition-colors shadow-sm"
                              >
                                {o.status === 'confirmed' ? 'Mark Shipped 🚚' : 'Mark Delivered ✅'}
                              </button>
                            )}

                            {o.payment_status === 'pending' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(o.id, o.status, 'paid')}
                                disabled={isUpdating}
                                className="bg-[#ecfdf5] hover:bg-[#d1fae5] text-xs text-[#166534] border border-[#a7f3d0] px-2.5 py-1.5 rounded-xl font-bold transition-colors shadow-sm"
                              >
                                Mark Paid
                              </button>
                            )}

                            <button
                              onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                              className="p-1.5 text-stone-500 hover:text-[#1c1917] rounded-lg hover:bg-stone-100 transition-colors"
                              title="View details"
                            >
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[#f0eae1] grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div>
                            <h4 className="font-bold text-xs text-[#b7860e] uppercase tracking-wider mb-2">
                              Ordered Items ({Array.isArray(o.items) ? o.items.length : 0})
                            </h4>
                            <div className="space-y-2 bg-[#faf8f5] p-3 rounded-xl border border-[#e8e2d5]">
                              {Array.isArray(o.items) &&
                                o.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs">
                                    <span className="text-[#1c1917] font-medium">
                                      {item.product?.name || 'Rice Variety'} &nbsp;
                                      <span className="text-stone-500">({item.selectedWeight?.weight})</span>
                                    </span>
                                    <span className="font-mono text-stone-700 font-semibold">
                                      {item.quantity} × ₹{item.selectedWeight?.price} = ₹
                                      {item.quantity * (item.selectedWeight?.price || 0)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold text-xs text-[#b7860e] uppercase tracking-wider mb-2">
                              Pickup &amp; Receiver Info
                            </h4>
                            <div className="bg-[#faf8f5] p-3 rounded-xl border border-[#e8e2d5] text-xs space-y-1 text-stone-700 leading-relaxed font-medium">
                              <p className="font-bold text-[#1c1917]">{o.address?.fullName}</p>
                              <p>{o.address?.line1}</p>
                              {o.address?.line2 && <p>{o.address.line2}</p>}
                              <p>
                                {o.address?.city}, {o.address?.state} — {o.address?.pincode}
                              </p>
                              <div className="pt-2 flex items-center gap-3">
                                {o.address?.phone && (
                                  <a
                                    href={`tel:${o.address.phone}`}
                                    className="text-[#b7860e] font-bold hover:underline flex items-center gap-1"
                                  >
                                    <Phone className="w-3.5 h-3.5" /> Call Customer
                                  </a>
                                )}
                                {o.address?.phone && (
                                  <a
                                    href={`https://wa.me/91${o.address.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#166534] font-bold hover:underline flex items-center gap-1"
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

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Products Action Bar */}
            <div className="bg-white border border-[#e8e2d5] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search products by name, variety, description..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-[#faf8f5] border border-[#d6cfc3] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1c1917] focus:outline-none focus:border-[#d4a017]"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-500 font-semibold">
                  {filteredAdminProducts.length} Products in Catalog
                </span>
                <button
                  onClick={handleOpenAddProduct}
                  className="btn-primary py-2.5 px-4 text-xs font-bold rounded-xl shadow-sm"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Add New Product
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAdminProducts.map((p) => {
                const minPrice = Math.min(...p.prices.map((pr) => pr.price));
                const maxPrice = Math.max(...p.prices.map((pr) => pr.price));

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-[#e8e2d5] hover:border-[#d4a017] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image & Badges */}
                      <div className="relative aspect-[16/10] bg-[#faf8f5] overflow-hidden border-b border-[#f0eae1]">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250" fill="%23faf8f5"%3E%3Crect width="400" height="250"/%3E%3Ctext x="50%25" y="50%25" font-size="40" fill="%23d4a017" text-anchor="middle" dominant-baseline="middle"%3E🌾%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                          <span className="badge badge-gold font-bold shadow-sm">
                            {p.variety}
                          </span>
                          {p.badges?.slice(0, 1).map((b) => (
                            <span key={b} className="badge bg-white/90 text-[#1c1917] border border-[#e8e2d5] font-semibold text-[10px]">
                              {b}
                            </span>
                          ))}
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-md font-mono">
                          Stock: {p.stock || 100} bags
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif font-bold text-lg text-[#1c1917] line-clamp-1">
                            {p.name}
                          </h3>
                        </div>
                        {p.nameTa && (
                          <p className="text-xs text-stone-500 font-medium">{p.nameTa}</p>
                        )}
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>

                        {/* Price range & pack sizes */}
                        <div className="pt-2 border-t border-[#f0eae1]">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs text-stone-500 font-medium">Price Range:</span>
                            <span className="text-sm font-bold text-[#b7860e]">
                              ₹{minPrice.toLocaleString()} – ₹{maxPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {p.prices.map((pr) => (
                              <span
                                key={pr.weight}
                                className="text-[10px] bg-[#faf8f5] text-stone-700 px-2 py-0.5 rounded-md border border-[#e8e2d5] font-medium"
                              >
                                {pr.weight}: ₹{pr.price}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0 border-t border-[#f0eae1] flex items-center justify-between gap-2 mt-3">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#fefce8] hover:bg-[#fef08a] text-[#926b09] border border-[#d4a017] py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit Product &amp; Image
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: FEEDBACKS */}
        {activeTab === 'feedbacks' && (
          <div className="space-y-4">
            {feedbacks.length === 0 ? (
              <div className="bg-white border border-[#e8e2d5] rounded-2xl p-12 text-center text-stone-500 shadow-sm">
                <MessageSquare className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                <p className="text-lg font-bold text-[#1c1917]">No feedbacks received yet</p>
                <p className="text-sm mt-1">Messages sent through the Contact Us form will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbacks.map((f) => (
                  <div key={f.id} className="bg-white border border-[#e8e2d5] rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-[#1c1917] text-base">{f.name}</h3>
                        <p className="text-xs text-[#b7860e] font-semibold">{f.subject || 'General Inquiry'}</p>
                      </div>
                      <span className="text-xs text-stone-400 font-medium">
                        {new Date(f.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <p className="text-sm text-stone-700 bg-[#faf8f5] p-3 rounded-xl border border-[#e8e2d5] leading-relaxed">
                      "{f.message}"
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-[#f0eae1] font-medium">
                      {f.email && (
                        <a href={`mailto:${f.email}`} className="text-blue-600 hover:underline flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> {f.email}
                        </a>
                      )}
                      {f.phone && (
                        <a href={`tel:${f.phone}`} className="text-[#166534] hover:underline flex items-center gap-1.5 font-bold">
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

        {/* TAB 4: WHOLESALE & EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            {exportRequests.length === 0 ? (
              <div className="bg-white border border-[#e8e2d5] rounded-2xl p-12 text-center text-stone-500 shadow-sm">
                <Globe className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                <p className="text-lg font-bold text-[#1c1917]">No export or wholesale inquiries yet</p>
                <p className="text-sm mt-1">Bulk business inquiries submitted on /wholesale and /export will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportRequests.map((r) => (
                  <div key={r.id} className="bg-white border border-[#e8e2d5] rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-purple-700 font-bold uppercase tracking-wider">
                          {r.country || 'India'}
                        </span>
                        <h3 className="font-bold text-[#1c1917] text-base mt-0.5">
                          {r.company_name ? `${r.company_name} (${r.contact_name})` : r.contact_name}
                        </h3>
                      </div>
                      <span className="text-xs text-stone-400 font-medium">
                        {new Date(r.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#faf8f5] p-3 rounded-xl border border-[#e8e2d5]">
                      <div>
                        <span className="text-stone-500 block font-medium">Products Requested</span>
                        <span className="font-bold text-[#1c1917]">{r.products || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block font-medium">Target Quantity</span>
                        <span className="font-bold text-[#b7860e]">{r.quantity || 'Not specified'}</span>
                      </div>
                    </div>

                    {r.message && (
                      <p className="text-xs text-stone-700 leading-relaxed italic bg-[#faf8f5] p-3 rounded-xl border border-[#e8e2d5]">
                        "{r.message}"
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#f0eae1] text-xs font-semibold">
                      <div className="flex items-center gap-3">
                        <a href={`tel:${r.phone}`} className="text-[#166534] hover:underline flex items-center gap-1 font-bold">
                          <Phone className="w-3.5 h-3.5" /> {r.phone}
                        </a>
                        <a href={`mailto:${r.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" /> {r.email}
                        </a>
                      </div>

                      <a
                        href={`https://wa.me/${r.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#25D366]/15 text-[#15803d] hover:bg-[#25D366]/25 px-3 py-1.5 rounded-xl flex items-center gap-1 border border-[#25D366]/40 font-bold transition-all shadow-sm"
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

      {/* EDIT / ADD PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#e8e2d5] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#f0eae1] pb-4">
              <div>
                <span className="badge badge-gold font-bold text-xs uppercase mb-1">
                  {isNewProduct ? 'Add Catalog Item' : 'Update Existing Product'}
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#1c1917]">
                  {isNewProduct ? 'Create New Rice Product' : `Edit ${editingProduct.name}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="space-y-5">
              {/* Image Manager Section */}
              <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e2d5] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label mb-0 text-sm font-bold flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#b7860e]" /> Product Image
                  </label>
                  <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-[#e8e2d5]">
                    <button
                      type="button"
                      onClick={() => setImageUploadTab('upload')}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                        imageUploadTab === 'upload'
                          ? 'bg-[#d4a017] text-[#1c1917] shadow-sm'
                          : 'text-stone-600 hover:text-[#1c1917]'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadTab('url')}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                        imageUploadTab === 'url'
                          ? 'bg-[#d4a017] text-[#1c1917] shadow-sm'
                          : 'text-stone-600 hover:text-[#1c1917]'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Preview Box */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border border-[#e8e2d5] shadow-sm relative">
                      <img
                        src={editingProduct.image}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="%23faf8f5"%3E%3Crect width="96" height="96"/%3E%3Ctext x="50%25" y="50%25" font-size="28" fill="%23d4a017" text-anchor="middle" dominant-baseline="middle"%3E🌾%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    {editingProduct.image && editingProduct.image.startsWith('data:image/') && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        ⚡ {formatFileSize(getDataUrlSizeBytes(editingProduct.image))}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 w-full">
                    {imageUploadTab === 'upload' ? (
                      <div className="space-y-1">
                        <label className={`flex flex-col items-center justify-center border-2 border-dashed ${
                          compressingImage
                            ? 'border-amber-400 bg-amber-50/60 cursor-wait'
                            : 'border-[#d4a017] hover:border-[#b7860e] bg-white cursor-pointer'
                        } rounded-xl p-3 transition-colors shadow-sm`}>
                          {compressingImage ? (
                            <>
                              <RefreshCw className="w-5 h-5 text-[#b7860e] mb-1 animate-spin" />
                              <span className="text-xs font-bold text-[#1c1917]">
                                Auto-compressing image...
                              </span>
                              <span className="text-[10px] text-stone-500">
                                Optimizing quality & resolution
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-[#b7860e] mb-1" />
                              <span className="text-xs font-bold text-[#1c1917]">
                                Click to select an image from your device
                              </span>
                              <span className="text-[10px] text-stone-500">
                                ⚡ Auto-compresses camera photos (JPG, PNG, WebP up to 30MB)
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={compressingImage}
                            onChange={handleImageFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <input
                          type="url"
                          placeholder="https://example.com/product-image.jpg"
                          value={editingProduct.image}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              image: e.target.value,
                              images: [e.target.value],
                            })
                          }
                          className="input bg-white text-xs py-2.5"
                        />
                        <p className="text-[10px] text-stone-500">Direct link to image file</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g. Royal Bullet Basmati"
                    className="input bg-white"
                  />
                </div>

                <div>
                  <label className="label">Product Name (Tamil)</label>
                  <input
                    type="text"
                    value={editingProduct.nameTa || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nameTa: e.target.value })}
                    placeholder="e.g. ராயல் புல்லட் அரிசி"
                    className="input bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Variety / Category *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.variety}
                    onChange={(e) => setEditingProduct({ ...editingProduct, variety: e.target.value })}
                    placeholder="Basmati, Ponni, Sona Masoori, etc."
                    className="input bg-white"
                  />
                </div>

                <div>
                  <label className="label">Stock Available (Bags) *</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stock || 100}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="input bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="label">Short Description *</label>
                <textarea
                  rows={2}
                  required
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Catchy 1-2 sentence description..."
                  className="input bg-white text-sm"
                />
              </div>

              {/* Pack Sizes & Prices Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="label mb-0">Pack Sizes &amp; Prices (Weight Variants) *</label>
                  <button
                    type="button"
                    onClick={handleAddPriceTier}
                    className="text-xs text-[#b7860e] font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Size
                  </button>
                </div>

                <div className="space-y-2">
                  {editingProduct.prices.map((pr, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-[#faf8f5] p-2.5 rounded-xl border border-[#e8e2d5]"
                    >
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="e.g. 5 kg"
                          value={pr.weight}
                          onChange={(e) => handlePriceChange(idx, 'weight', e.target.value)}
                          className="input bg-white text-xs py-1.5 px-2.5 font-semibold"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Kg"
                          value={pr.weightKg}
                          onChange={(e) => handlePriceChange(idx, 'weightKg', Number(e.target.value))}
                          className="input bg-white text-xs py-1.5 px-2.5 font-mono"
                        />
                      </div>
                      <div className="col-span-3">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-stone-400">₹</span>
                          <input
                            type="number"
                            placeholder="Price"
                            value={pr.price}
                            onChange={(e) => handlePriceChange(idx, 'price', Number(e.target.value))}
                            className="input bg-white text-xs py-1.5 pl-5 pr-2 font-bold font-mono"
                          />
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-stone-400">₹</span>
                          <input
                            type="number"
                            placeholder="MRP"
                            value={pr.originalPrice || ''}
                            onChange={(e) =>
                              handlePriceChange(idx, 'originalPrice', e.target.value ? Number(e.target.value) : 0)
                            }
                            className="input bg-white text-xs py-1.5 pl-5 pr-2 font-mono text-stone-500"
                          />
                        </div>
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemovePriceTier(idx)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove tier"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grain Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-600 mb-1 block">Grain Length</label>
                  <input
                    type="text"
                    value={editingProduct.grainLength || '8.0mm'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, grainLength: e.target.value })}
                    className="input bg-white text-xs py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600 mb-1 block">Aroma</label>
                  <input
                    type="text"
                    value={editingProduct.aroma || 'Natural'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, aroma: e.target.value })}
                    className="input bg-white text-xs py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600 mb-1 block">Moisture</label>
                  <input
                    type="text"
                    value={editingProduct.moisture || '≤12.5%'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, moisture: e.target.value })}
                    className="input bg-white text-xs py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600 mb-1 block">Cook Time</label>
                  <input
                    type="text"
                    value={editingProduct.cookingTime || '18 min'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, cookingTime: e.target.value })}
                    className="input bg-white text-xs py-2"
                  />
                </div>
              </div>

              {/* Badges / Highlights */}
              <div>
                <label className="label">Badges (comma-separated)</label>
                <input
                  type="text"
                  value={editingProduct.badges?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      badges: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Premium, Aged 12M, FSSAI Certified, 100% Sortex"
                  className="input bg-white text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#f0eae1] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#e8e2d5] text-stone-600 font-semibold text-sm hover:bg-[#faf8f5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="btn-primary py-2.5 px-6 text-sm font-bold shadow-sm hover:shadow"
                >
                  {savingProduct ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

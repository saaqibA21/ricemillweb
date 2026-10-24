// src/pages/admin/AdminLogin.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', data.user.username);
      toast.success('Welcome to Admin Portal!', {
        style: { background: '#ffffff', color: '#1c1917', border: '1px solid #d4a017' },
      });
      navigate('/admin');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      toast.error(errorMsg, {
        style: { background: '#ffffff', color: '#b91c1c', border: '1px solid #f87171' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-16 flex items-center justify-center px-4 bg-[#faf8f5]">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-[#e8e2d5] rounded-3xl p-8 sm:p-10 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#fefce8] border border-[#d4a017] flex items-center justify-center mx-auto mb-4 text-[#b7860e] shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1c1917] mb-1">
              Admin Portal
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm tracking-wider uppercase font-semibold">
              Hariharan Traders • Management
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                Admin ID / Username
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-white border border-[#d6cfc3] rounded-xl pl-11 pr-4 py-3 text-[#1c1917] text-sm focus:outline-none focus:border-[#d4a017] focus:ring-1 focus:ring-[#d4a017] transition-colors shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-[#d6cfc3] rounded-xl pl-11 pr-11 py-3 text-[#1c1917] text-sm focus:outline-none focus:border-[#d4a017] focus:ring-1 focus:ring-[#d4a017] transition-colors shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1c1917] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-sm tracking-wide shadow-sm hover:shadow"
            >
              {loading ? (
                'Verifying credentials...'
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Help Hint */}
          <div className="mt-6 pt-5 border-t border-[#f0eae1] text-center">
            <p className="text-stone-500 text-xs leading-relaxed font-medium">
              Default ID: <span className="text-[#b7860e] font-mono font-bold">admin</span> &nbsp;|&nbsp; Password: <span className="text-[#b7860e] font-mono font-bold">admin@hariharan1981</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

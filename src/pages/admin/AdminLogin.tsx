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
        style: { background: '#1a2e1a', color: '#f0f7f0', border: '1px solid #d4a017' },
      });
      navigate('/admin');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      toast.error(errorMsg, {
        style: { background: '#2e1a1a', color: '#f7f0f0', border: '1px solid #e04a4a' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-16 flex items-center justify-center px-4 bg-[#0a140a]">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#112011]/90 border border-[#d4a017]/30 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4a017]/20 to-[#d4a017]/5 border border-[#d4a017]/40 flex items-center justify-center mx-auto mb-4 text-[#d4a017] shadow-[0_0_20px_rgba(212,160,23,0.2)]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-1">
              Admin Portal
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm tracking-wider uppercase">
              Hariharan Traders • Management
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Admin ID / Username
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-[#0a150a] border border-[#1e3a1e] rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4a017] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0a150a] border border-[#1e3a1e] rounded-xl pl-11 pr-11 py-3 text-white text-sm focus:outline-none focus:border-[#d4a017] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#d4a017] to-[#b8860b] hover:from-[#e5b32f] hover:to-[#c49214] text-[#0f1a0f] font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-50 text-sm tracking-wide"
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
          <div className="mt-6 pt-5 border-t border-[#1e3a1e] text-center">
            <p className="text-gray-400 text-xs leading-relaxed">
              Default ID: <span className="text-[#d4a017] font-mono">admin</span> &nbsp;|&nbsp; Password: <span className="text-[#d4a017] font-mono">admin@hariharan1981</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

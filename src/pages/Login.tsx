// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Phone, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { User } from '../types';
import toast from 'react-hot-toast';

export default function Login() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    // Simulate OTP send (replace with real API call)
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep('otp');
    toast.success(`OTP sent to +91 ${phone}`, {
      style: { background: '#ffffff', color: '#1c1917', border: '1px solid #d4a017' },
    });
    // For demo: OTP is 123456
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    // Demo: accept 123456 as valid OTP
    if (otp !== '123456') {
      setLoading(false);
      toast.error('Invalid OTP. (Demo: use 123456)');
      return;
    }

    const user: User = {
      id: `user-${Date.now()}`,
      name: name || 'Rice Lover',
      phone,
      addresses: [],
    };
    login(user);
    setLoading(false);
    toast.success(`Welcome, ${user.name}! 🌾`, {
      style: { background: '#ffffff', color: '#1c1917', border: '1px solid #d4a017' },
    });
    navigate(redirect);
  };

  return (
    <main className="pt-16 pb-20 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <img
            src="/assets/logo.jpeg"
            alt="Hariharan Traders"
            className="w-20 h-20 rounded-full object-cover ring-2 ring-[#d4a017] mx-auto mb-4"
          />
          <h1 className="font-serif font-bold text-3xl text-[#1c1917] mb-1">Hariharan Traders</h1>
          <p className="text-[#b7860e] text-xs font-bold tracking-widest uppercase">Rice Mill • Management</p>
        </div>

        <div className="card p-8 bg-white shadow-lg">
          {step === 'phone' ? (
            <>
              <h2 className="font-serif font-bold text-2xl text-[#1c1917] mb-2">
                Login / Sign Up
              </h2>
              <p className="text-stone-500 text-sm mb-8 font-medium">
                We'll send a one-time password to your mobile number.
              </p>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="label">Mobile Number</label>
                  <div className="flex">
                    <span className="flex items-center px-4 bg-[#faf8f5] border border-[#d6cfc3] border-r-0 rounded-l-xl text-stone-600 text-sm font-semibold">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="78109 90099"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="input rounded-l-none bg-white font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60 shadow-sm hover:shadow"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Phone className="w-5 h-5" />
                      Send OTP
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('phone')}
                className="text-stone-500 hover:text-[#1c1917] text-sm mb-6 flex items-center gap-1 font-semibold transition-colors"
              >
                ← Change number
              </button>
              <h2 className="font-serif font-bold text-2xl text-[#1c1917] mb-2">Enter OTP</h2>
              <p className="text-stone-500 text-sm mb-2">
                Sent to <span className="text-[#1c1917] font-bold">+91 {phone}</span>
              </p>
              <p className="text-[#d4a017] text-xs mb-8 bg-[#d4a017]/10 border border-[#d4a017]/20 rounded-lg px-3 py-2">
                🔐 Demo mode: Use OTP <strong>123456</strong> to login
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="label">6-Digit OTP</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="input text-center text-2xl tracking-[0.5em] font-bold"
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify & Login
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full text-center text-[#d4a017] text-sm hover:underline"
                >
                  Resend OTP
                </button>
              </form>
            </>
          )}

          <p className="text-xs text-gray-500 text-center mt-6">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-[#d4a017] hover:underline">
              Terms
            </Link>{' '}
            &{' '}
            <Link to="/privacy" className="text-[#d4a017] hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

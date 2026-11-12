// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Phone, ArrowRight, RefreshCw, KeyRound, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { User } from '../types';
import toast from 'react-hot-toast';

export default function Login() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const generateAndDispatchOtp = (targetPhone: string) => {
    // Generate a secure 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtp('');

    // Deliver on website via high-visibility toast notification
    toast.success(
      `🌾 Verification OTP: ${code} (Sent to website for +91 ${targetPhone})`,
      {
        duration: 10000,
        style: {
          background: '#ffffff',
          color: '#1c1917',
          border: '2px solid #d4a017',
          fontWeight: '600',
        },
      }
    );
    return code;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    generateAndDispatchOtp(phone);
    setStep('otp');
  };

  const handleResendOtp = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    generateAndDispatchOtp(phone);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    // Verify against the on-website generated OTP
    if (otp !== generatedOtp) {
      setLoading(false);
      toast.error('Invalid OTP. Please enter the verification code generated above.');
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

        {/* Card */}
        <div className="card p-8 sm:p-10 bg-white shadow-xl border border-[#e8e2d5]">
          {step === 'phone' ? (
            <>
              <h2 className="font-serif font-bold text-2xl text-[#1c1917] mb-2">Welcome</h2>
              <p className="text-stone-500 text-sm mb-8">
                Enter your mobile number to receive your OTP code directly here.
              </p>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="label">Mobile Number</label>
                  <div className="flex rounded-xl border border-[#d6cfc3] focus-within:border-[#d4a017] focus-within:ring-1 focus-within:ring-[#d4a017] bg-white transition-all shadow-sm overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3.5 bg-stone-50 border-r border-[#d6cfc3] text-stone-600 font-bold text-sm select-none shrink-0">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-transparent px-4 py-3 text-[#1c1917] placeholder-stone-400 focus:outline-none tracking-wider font-medium text-base"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {isNewUser && (
                  <div>
                    <label className="label">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="newUser"
                    checked={isNewUser}
                    onChange={(e) => setIsNewUser(e.target.checked)}
                    className="accent-[#d4a017] rounded"
                  />
                  <label htmlFor="newUser" className="text-xs text-stone-500 cursor-pointer">
                    I am a new customer
                  </label>
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
              <h2 className="font-serif font-bold text-2xl text-[#1c1917] mb-1">Enter OTP</h2>
              <p className="text-stone-500 text-sm mb-4">
                Mobile: <span className="text-[#1c1917] font-bold">+91 {phone}</span>
              </p>

              {/* On-Website Generated OTP Banner */}
              <div className="mb-6 p-4 rounded-2xl bg-[#fefce8] border-2 border-dashed border-[#d4a017] text-center shadow-sm">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fef9c3] text-[#926b09] text-[11px] font-bold uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  OTP Generated on Website
                </div>
                <p className="text-xs text-stone-600 mb-2">
                  Your 6-digit verification code is:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-3xl font-extrabold text-[#b7860e] tracking-[0.25em] bg-white px-4 py-1.5 rounded-xl border border-[#d4a017]/40 shadow-inner">
                    {generatedOtp}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtp(generatedOtp);
                      toast.success('OTP auto-filled!');
                    }}
                    className="px-3.5 py-2 bg-[#d4a017] hover:bg-[#b7860e] text-[#1c1917] font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1"
                    title="Click to auto-fill this OTP"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Auto-fill
                  </button>
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  Click <strong>Auto-fill</strong> or type the code below to login instantly.
                </p>
              </div>

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
                  className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60 shadow-sm hover:shadow"
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
                  disabled={loading}
                  onClick={handleResendOtp}
                  className="w-full text-center text-[#d4a017] hover:text-[#b7860e] text-sm font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              </form>
            </>
          )}

          <p className="text-xs text-gray-500 text-center mt-6">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-[#d4a017] hover:underline">
              Terms & Conditions
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

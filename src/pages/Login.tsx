// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Phone, ArrowRight, RefreshCw, Lock, Check, ShieldCheck, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { User } from '../types';
import toast from 'react-hot-toast';

// Storage helpers for user passcodes
function getStoredPasscode(phone: string): string | null {
  try {
    const raw = localStorage.getItem('ht_user_passcodes');
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[phone]?.passcode || null;
  } catch {
    return null;
  }
}

function getStoredUserName(phone: string): string | null {
  try {
    const raw = localStorage.getItem('ht_user_passcodes');
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[phone]?.name || null;
  } catch {
    return null;
  }
}

function saveUserPasscode(phone: string, passcode: string, name?: string) {
  try {
    const raw = localStorage.getItem('ht_user_passcodes');
    const map = raw ? JSON.parse(raw) : {};
    map[phone] = {
      passcode,
      name: name || map[phone]?.name || 'Rice Lover',
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('ht_user_passcodes', JSON.stringify(map));
  } catch (err) {
    console.error('Error saving passcode:', err);
  }
}

type LoginStep = 'phone' | 'otp' | 'set_passcode' | 'enter_passcode';

export default function Login() {
  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
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

  // Step 1: Submit Mobile Number
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);

    // Check if this number already has a registered 4-digit passcode
    const existingPasscode = getStoredPasscode(phone);
    if (existingPasscode && !isNewUser) {
      // Pre-fill existing user name if saved
      const savedName = getStoredUserName(phone);
      if (savedName) setName(savedName);
      setPasscode('');
      setStep('enter_passcode');
      return;
    }

    // Otherwise, generate OTP and guide user to verify and set a passcode
    generateAndDispatchOtp(phone);
    setStep('otp');
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    generateAndDispatchOtp(phone);
  };

  // Step 2: Verify OTP -> Proceed to Set 4-Digit Passcode
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    // Verify against the on-website generated OTP
    if (otp !== generatedOtp) {
      setLoading(false);
      toast.error('Invalid OTP. Please enter the verification code generated above.');
      return;
    }

    setLoading(false);
    setPasscode('');
    setConfirmPasscode('');
    toast.success('Mobile verified! Now please set your 4-digit passcode.', {
      style: { background: '#ffffff', color: '#1c1917', border: '1px solid #d4a017' },
    });
    setStep('set_passcode');
  };

  // Step 3: Set 4-Digit Passcode -> Finalize Login
  const handleSetPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length !== 4 || !/^\d{4}$/.test(passcode)) {
      toast.error('Passcode must be exactly 4 digits');
      return;
    }
    if (passcode !== confirmPasscode) {
      toast.error('Passcodes do not match. Please verify.');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    // Save passcode permanently for this phone number
    const finalName = name.trim() || getStoredUserName(phone) || 'Rice Lover';
    saveUserPasscode(phone, passcode, finalName);

    const user: User = {
      id: `user-${Date.now()}`,
      name: finalName,
      phone,
      addresses: [],
    };
    login(user);
    setLoading(false);

    toast.success(`Passcode saved! Welcome, ${user.name}! 🌾`, {
      style: { background: '#ffffff', color: '#1c1917', border: '1px solid #d4a017' },
    });
    navigate(redirect);
  };

  // Step 4: Login with Existing 4-Digit Passcode
  const handleLoginWithPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length !== 4) {
      toast.error('Enter your 4-digit passcode');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const savedPasscode = getStoredPasscode(phone);
    if (!savedPasscode || passcode !== savedPasscode) {
      setLoading(false);
      toast.error('Incorrect passcode. Please try again or login with OTP.');
      return;
    }

    const savedName = name.trim() || getStoredUserName(phone) || 'Rice Lover';
    const user: User = {
      id: `user-${Date.now()}`,
      name: savedName,
      phone,
      addresses: [],
    };
    login(user);
    setLoading(false);

    toast.success(`Welcome back, ${user.name}! 🌾`, {
      style: { background: '#ffffff', color: '#1c1917', border: '1px solid #d4a017' },
    });
    navigate(redirect);
  };

  // Switch to OTP login / reset flow
  const handleSwitchToOtp = () => {
    generateAndDispatchOtp(phone);
    setStep('otp');
  };

  return (
    <main className="pt-16 pb-20 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <img
            src="/assets/logo.jpeg"
            alt="Hariharan Traders"
            className="w-20 h-20 rounded-full object-cover ring-2 ring-[#d4a017] mx-auto mb-3"
          />
          <h1 className="font-serif font-bold text-3xl text-[#1c1917] mb-1">Hariharan Traders</h1>
          <p className="text-[#b7860e] text-xs font-bold tracking-widest uppercase">Rice Mill • Customer Portal</p>
        </div>

        {/* Card */}
        <div className="card p-7 sm:p-9 bg-white shadow-xl border border-[#e8e2d5] rounded-3xl">
          {/* ================= STEP 1: PHONE ================= */}
          {step === 'phone' && (
            <>
              <h2 className="font-serif font-bold text-2xl text-[#1c1917] mb-1">Customer Login</h2>
              <p className="text-stone-500 text-xs sm:text-sm mb-6 leading-relaxed">
                Enter your mobile number to sign in with your 4-digit passcode or verify with OTP.
              </p>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
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

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600">
                    <input
                      type="checkbox"
                      id="newUser"
                      checked={isNewUser}
                      onChange={(e) => setIsNewUser(e.target.checked)}
                      className="accent-[#d4a017] rounded w-3.5 h-3.5"
                    />
                    <span>First time customer</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60 shadow-sm hover:shadow mt-2"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ================= STEP 2: ENTER OTP ================= */}
          {step === 'otp' && (
            <>
              <button
                onClick={() => setStep('phone')}
                className="text-stone-500 hover:text-[#1c1917] text-xs sm:text-sm mb-4 flex items-center gap-1 font-semibold transition-colors"
              >
                ← Change number
              </button>
              <h2 className="font-serif font-bold text-2xl text-[#1c1917] mb-1">Verify Mobile</h2>
              <p className="text-stone-500 text-xs sm:text-sm mb-4">
                Mobile: <span className="text-[#1c1917] font-bold">+91 {phone}</span>
              </p>

              {/* On-Website Generated OTP Banner */}
              <div className="mb-5 p-4 rounded-2xl bg-[#fefce8] border-2 border-dashed border-[#d4a017] text-center shadow-sm">
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
                  Click <strong>Auto-fill</strong> or type the code below to proceed to passcode setup.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                  className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60 shadow-sm hover:shadow"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify OTP
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResendOtp}
                  className="w-full text-center text-[#d4a017] hover:text-[#b7860e] text-xs font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              </form>
            </>
          )}

          {/* ================= STEP 3: SET 4-DIGIT PASSCODE ================= */}
          {step === 'set_passcode' && (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#fefce8] border border-[#d4a017] flex items-center justify-center text-[#b7860e] mb-3 shadow-sm">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="font-serif font-bold text-2xl text-[#1c1917] mb-1">Set 4-Digit Passcode</h2>
              <p className="text-stone-500 text-xs sm:text-sm mb-5 leading-relaxed">
                Set a secret 4-digit PIN for <span className="font-bold text-[#1c1917]">+91 {phone}</span>. Next time, you can login instantly with just your number and this passcode!
              </p>

              <form onSubmit={handleSetPasscode} className="space-y-4">
                <div>
                  <label className="label">Create 4-Digit Passcode</label>
                  <div className="relative">
                    <input
                      type={showPasscode ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="• • • •"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                      className="input text-center text-2xl tracking-[0.6em] font-bold pr-11"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                      title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                    >
                      {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">Confirm 4-Digit Passcode</label>
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="• • • •"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value.replace(/\D/g, ''))}
                    className="input text-center text-2xl tracking-[0.6em] font-bold"
                    required
                  />
                </div>

                {!name && (
                  <div>
                    <label className="label">Your Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60 shadow-sm hover:shadow mt-2"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Save Passcode & Login
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ================= STEP 4: ENTER 4-DIGIT PASSCODE (RETURNING USER) ================= */}
          {step === 'enter_passcode' && (
            <>
              <button
                onClick={() => setStep('phone')}
                className="text-stone-500 hover:text-[#1c1917] text-xs sm:text-sm mb-4 flex items-center gap-1 font-semibold transition-colors"
              >
                ← Change number
              </button>

              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-5 h-5 text-[#b7860e]" />
                <h2 className="font-serif font-bold text-2xl text-[#1c1917]">Enter Passcode</h2>
              </div>
              <p className="text-stone-500 text-xs sm:text-sm mb-5">
                Welcome back{name ? `, ${name}` : ''}! Enter your 4-digit PIN for <span className="font-bold text-[#1c1917]">+91 {phone}</span>.
              </p>

              <form onSubmit={handleLoginWithPasscode} className="space-y-4">
                <div>
                  <label className="label">4-Digit Passcode</label>
                  <div className="relative">
                    <input
                      type={showPasscode ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="• • • •"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                      className="input text-center text-3xl tracking-[0.6em] font-bold pr-11"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                      title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                    >
                      {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60 shadow-sm hover:shadow"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleSwitchToOtp}
                    className="text-[#d4a017] hover:text-[#b7860e] text-xs font-semibold hover:underline"
                  >
                    Forgot Passcode? Login with OTP instead
                  </button>
                </div>
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

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Cannot connect to the server. Please ensure the backend is running.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      
      if (data.otp) {
        setOtp(data.otp);
        setSuccessMsg(`Verification code: ${data.otp}`);
      } else {
        setSuccessMsg(`Verification code sent to ${email.trim()}`);
      }
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setSuccessMsg(null);
    setResending(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend OTP');

      if (data.otp) {
        setOtp(data.otp);
        setSuccessMsg(`New OTP: ${data.otp}`);
      } else {
        setSuccessMsg(`New OTP sent to ${email.trim()}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);

    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'User';

      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: email.trim(),
          password,
          otp: otp.trim(),
        }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Cannot connect to the server. If deployed, ensure the backend API is running and configured correctly.");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store user info and token in localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-6 z-10 my-8"
      >
        <div className="glass-panel p-10 relative">
          {/* Logo Area */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)] mb-4">
              <span className="text-black font-bold text-3xl">E</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Join EmoTradeLog</h1>
            <p className="text-sm text-gray-400 mt-1">Create your trading journal</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 text-sm">
              <CheckCircle size={18} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={step === 1 ? handleSendOtp : handleRegister} className="space-y-5">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="email"
                      placeholder="trader@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1 block">Must be at least 6 characters</span>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  type="button"
                  className="w-full btn-gold flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Sending OTP Code...' : 'Send Verification OTP'} <ArrowRight size={18} />
                </button>
              </>
            ) : (
              <>
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300">
                  Enter the 6-digit verification code sent to <strong className="text-yellow-400">{email}</strong>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Verification Code (OTP)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-lg tracking-widest font-mono focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full btn-gold flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Creating Account...' : 'Verify & Create Account'} <ArrowRight size={18} />
                </button>

                <div className="flex items-center justify-between mt-3 text-xs">
                  <button
                    onClick={() => { setStep(1); setError(null); }}
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    &larr; Change Details
                  </button>

                  <button
                    onClick={handleResendOtp}
                    disabled={resending}
                    type="button"
                    className="text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                    {resending ? 'Resending...' : 'Resend Code'}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-yellow-500 hover:text-yellow-400 font-semibold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

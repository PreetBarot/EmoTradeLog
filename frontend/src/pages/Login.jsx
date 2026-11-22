import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, CheckCircle, X, KeyRound } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp + new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState(null);
  const [forgotSuccess, setForgotSuccess] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Cannot connect to the server. If deployed, ensure the backend API is running and configured correctly.");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user info and token
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotEmail.trim() || !/^\S+@\S+\.\S+$/.test(forgotEmail.trim())) {
      setForgotError('Please enter a valid email address');
      return;
    }

    setForgotLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reset code');

      if (data.otp) {
        setForgotOtp(data.otp);
        setForgotSuccess(`Reset OTP code: ${data.otp}`);
      } else {
        setForgotSuccess(`Reset OTP code sent to ${forgotEmail.trim()}`);
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotOtp.trim()) {
      setForgotError('Please enter the OTP code sent to your email');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters');
      return;
    }

    setForgotLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');

      setForgotSuccess('Password reset successfully! You can now log in.');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotOtp('');
        setNewPassword('');
        setForgotSuccess(null);
        setEmail(forgotEmail.trim());
      }, 1500);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-6 z-10"
      >
        <div className="glass-panel p-10 relative">
          {/* Logo Area */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)] mb-4">
              <span className="text-black font-bold text-3xl">E</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">EmoTradeLog</h1>
            <p className="text-sm text-gray-400 mt-1">Welcome back, trader</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotError(null);
                    setForgotSuccess(null);
                    setForgotStep(1);
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full btn-gold flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer">
              {loading ? 'Authenticating...' : 'Access Terminal'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-yellow-500 hover:text-yellow-400 font-semibold transition-colors">
              Apply Now
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl p-6 relative shadow-2xl text-white"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Reset Password</h3>
                  <p className="text-xs text-gray-400">
                    {forgotStep === 1
                      ? 'Enter your email to receive a password reset OTP'
                      : `Enter the code sent to ${forgotEmail}`}
                  </p>
                </div>
              </div>

              {forgotError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded-xl mb-4 flex items-center gap-2 text-xs">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-3 py-2 rounded-xl mb-4 flex items-center gap-2 text-xs">
                  <CheckCircle size={16} className="shrink-0" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleSendForgotOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="email"
                        placeholder="trader@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all text-sm"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    disabled={forgotLoading}
                    type="submit"
                    className="w-full btn-gold py-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
                  >
                    {forgotLoading ? 'Sending Reset Code...' : 'Send Reset Code'} <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Reset OTP Code</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-base tracking-widest font-mono focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="New Password (min 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all text-sm"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setForgotStep(1); setForgotError(null); }}
                      className="w-1/3 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      disabled={forgotLoading}
                      type="submit"
                      className="w-2/3 btn-gold py-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
                    >
                      {forgotLoading ? 'Updating...' : 'Set New Password'} <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { GraduationCap, ShieldCheck, KeyRound, Mail, Lock, ArrowRight, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface HRLoginPageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const HRLoginPage: React.FC<HRLoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingUserToken, setPendingUserToken] = useState<{ token: string; user: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email, password);
      // Prompt 2FA verification step
      setPendingUserToken({ token: res.token, user: res.user });
      setOtpStep(true);
    } catch (err: any) {
      setError(err.message || 'Invalid HR credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.verify2FA(otpCode || '123456');
      if (pendingUserToken) {
        login(pendingUserToken.token, pendingUserToken.user);
        onNavigate('admin-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login Handler
  const quickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('admin123');
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(demoEmail, 'admin123');
      login(res.token, res.user);
      onNavigate('admin-dashboard');
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fadeIn pb-24">
      <div className="glass-panel p-8 rounded-3xl border border-amber-500/40 shadow-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 space-y-6">
        
        {/* Brand Icon Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/20 mx-auto">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-heading font-extrabold text-white">HR Admin Portal</h2>
            <p className="text-xs text-slate-400 mt-1">Rathinam Group Recruitment Management System</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {!otpStep ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Authorized Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@rathinam.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-lg flex items-center justify-center space-x-2 transition-all"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to HR Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4 text-center">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
              <KeyRound className="w-5 h-5 mx-auto mb-1 text-amber-400" />
              <span>Two-Factor Authentication (2FA) Required. Enter 6-digit OTP sent to your registered device. (Demo code: <strong>123456</strong>)</span>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                className="w-full py-3 text-center text-2xl tracking-widest font-mono rounded-xl glass-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg"
            >
              <span>Verify & Continue</span>
            </button>
          </form>
        )}

        {/* Quick Demo Preset Logins */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Quick Demo Login Presets
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => quickLogin('admin@rathinam.in')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-slate-200"
            >
              <p className="font-bold text-amber-400">Super Admin</p>
              <p className="text-[10px] text-slate-400">All Organizations</p>
            </button>

            <button
              onClick={() => quickLogin('hr.rgu@rathinam.in')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-slate-200"
            >
              <p className="font-bold text-blue-400">RGU HR Admin</p>
              <p className="text-[10px] text-slate-400">RGU Scoped</p>
            </button>

            <button
              onClick={() => quickLogin('hr.rtc@rathinam.in')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-slate-200"
            >
              <p className="font-bold text-emerald-400">RTC HR Admin</p>
              <p className="text-[10px] text-slate-400">RTC Scoped</p>
            </button>

            <button
              onClick={() => quickLogin('hr.pharmacy@rathinam.in')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-slate-200"
            >
              <p className="font-bold text-yellow-400">Pharmacy HR</p>
              <p className="text-[10px] text-slate-400">Pharmacy Scoped</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

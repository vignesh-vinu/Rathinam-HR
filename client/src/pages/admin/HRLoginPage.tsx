import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Mail, Lock, ArrowRight } from 'lucide-react';
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


  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fadeIn pb-24">
      <div className="glass-panel p-8 rounded-3xl border border-sky-200 shadow-xl bg-white space-y-6">
        
        {/* Brand Icon Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white p-2 border border-sky-200 shadow-lg shadow-sky-500/10 mx-auto flex items-center justify-center">
            <img src="/rathinam_logo.png" alt="Rathinam Group Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <img src="/rathinam_hr_brand.png" alt="Rathinam HR" className="h-5 w-auto object-contain mx-auto mt-1" />
            <h2 className="text-sm font-heading font-extrabold text-sky-700 tracking-wider uppercase pt-1">Admin Portal</h2>
            <p className="text-xs text-slate-500">Rathinam Group Recruitment Management System</p>
          </div>
        </div>

        {/* Security Notice Banner */}
        <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Restricted Portal: Access restricted to authorized Rathinam HR Administrators only.</span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {!otpStep ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Authorized Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-sky-600 absolute left-3.5 top-3" />
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-sky-600 absolute left-3.5 top-3" />
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
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm shadow-md shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to HR Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4 text-center">
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-800">
              <KeyRound className="w-5 h-5 mx-auto mb-1 text-sky-600" />
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
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg"
            >
              <span>Verify & Continue</span>
            </button>
          </form>
        )}


      </div>
    </div>
  );
};


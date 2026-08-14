import React, { useState, useEffect } from 'react';
import { GraduationCap, Bell, User, LogOut, Menu, X, Search, ChevronRight, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenNotifications }) => {
  const { user, logout, selectedOrgFilter, setSelectedOrgFilter } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.getNotifications(selectedOrgFilter).then(res => {
        setUnreadCount(res.unreadCount || 0);
      }).catch(err => console.error(err));
    }
  }, [user, selectedOrgFilter]);

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onNavigate('landing')}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Rathinam<span className="text-amber-400">HR</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Smart Recruitment & Applicant System
              </p>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'landing' 
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate('apply-selector')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'apply-selector' || currentView === 'apply-form'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Careers / Apply
            </button>

            <button
              onClick={() => onNavigate('track')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'track' 
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Track Application
            </button>
          </div>

          {/* Admin User / Login Action */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
                
                {/* HR Dashboard Navigation */}
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>HR Dashboard</span>
                </button>

                {/* Notifications Bell */}
                <button
                  onClick={onOpenNotifications}
                  className="relative p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors border border-slate-700"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-slate-950 font-extrabold text-[11px] rounded-full flex items-center justify-center animate-pulse shadow-md shadow-amber-500/30">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* User Avatar Dropdown */}
                <div className="flex items-center space-x-3 bg-slate-900/90 py-1.5 px-3 rounded-xl border border-slate-800">
                  <img 
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-amber-400/50"
                  />
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold text-slate-200 truncate max-w-[120px]">{user.name}</p>
                    <p className="text-[10px] text-amber-400 font-semibold">{user.role.replace('_', ' ')}</p>
                  </div>
                  <button 
                    onClick={logout}
                    className="text-slate-400 hover:text-rose-400 p-1 rounded-md transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ) : (
              <button
                onClick={() => onNavigate('admin-login')}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>HR Admin Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-lg bg-slate-800 text-slate-300"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 py-4 space-y-3 animate-fadeIn">
          <button
            onClick={() => { onNavigate('landing'); setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800 font-medium"
          >
            Home
          </button>
          <button
            onClick={() => { onNavigate('apply-selector'); setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800 font-medium"
          >
            Apply Online
          </button>
          <button
            onClick={() => { onNavigate('track'); setMobileMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800 font-medium"
          >
            Track Application
          </button>

          {user ? (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={() => { onNavigate('admin-dashboard'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-amber-500/10 text-amber-400 font-bold"
              >
                <span>HR Admin Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout ({user.name})</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => { onNavigate('admin-login'); setMobileMenuOpen(false); }}
              className="w-full text-center px-4 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm"
            >
              HR Admin Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

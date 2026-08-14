import React, { useEffect, useState } from 'react';
import { X, Bell, Check, CheckCheck, Clock, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { NotificationItem } from '../types';
import { api } from '../services/api';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApplication?: (appId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, onSelectApplication }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel border-l border-slate-800 bg-slate-950 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-white text-base">HR Notifications</h3>
                <p className="text-xs text-slate-400">Real-time candidate activity feed</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                title="Mark all as read"
              >
                Mark all read
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-300">No new notifications</p>
                <p className="text-xs text-slate-500 mt-1">All application events are up to date.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.isRead) handleMarkRead(item.id);
                    if (onSelectApplication) {
                      onSelectApplication(item.applicationId);
                      onClose();
                    }
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    item.isRead 
                      ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80' 
                      : 'bg-slate-900 border-amber-500/40 hover:border-amber-500 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {item.organizationId}
                      </span>
                      <span className="text-xs font-bold text-slate-200">{item.title}</span>
                    </div>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mt-2 font-medium">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </span>
                    <span className="text-amber-400 font-semibold flex items-center space-x-0.5">
                      <span>View App ({item.applicationId})</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 text-center text-xs text-slate-500">
            Click any notification to jump directly to candidate record.
          </div>
        </div>
      </div>
    </div>
  );
};

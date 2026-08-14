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
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel border-l border-sky-100 bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-sky-100 flex items-center justify-between bg-sky-50/80">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center">
                <Bell className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-base">HR Notifications</h3>
                <p className="text-xs text-slate-500">Real-time candidate activity feed</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-sky-700 hover:text-sky-800 px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 transition-colors"
                title="Mark all as read"
              >
                Mark all read
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-sky-100"
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
                <Bell className="w-10 h-10 text-sky-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">No new notifications</p>
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
                      ? 'bg-slate-50 border-sky-100 hover:bg-sky-50/50' 
                      : 'bg-sky-50/60 border-sky-300 hover:border-sky-500 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-sky-100 text-sky-700 border border-sky-200">
                        {item.organizationId}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{item.title}</span>
                    </div>
                    {!item.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600 flex-shrink-0"></span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-2 font-medium">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 pt-2 border-t border-sky-100">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </span>
                    <span className="text-sky-600 font-semibold flex items-center space-x-0.5">
                      <span>View App ({item.applicationId})</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-sky-100 bg-sky-50/50 text-center text-xs text-slate-500">
            Click any notification to jump directly to candidate record.
          </div>
        </div>
      </div>
    </div>
  );
};

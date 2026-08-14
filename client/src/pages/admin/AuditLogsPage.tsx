import React, { useEffect, useState } from 'react';
import { Shield, Clock, User, ChevronLeft } from 'lucide-react';
import { api } from '../../services/api';
import { AuditLogItem } from '../../types';

interface AuditLogsPageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const AuditLogsPage: React.FC<AuditLogsPageProps> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs().then(data => {
      setLogs(data.auditLogs || []);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn pb-24">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => onNavigate('admin-dashboard')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 text-xs font-bold border border-slate-800 mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-heading font-extrabold text-white">
            System Audit Trail
          </h1>
          <p className="text-xs text-slate-400">
            Immutable log of all HR administrative actions, status updates, and deletions.
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        {loading ? (
          <p className="py-8 text-center text-xs text-slate-400 animate-pulse">Loading audit trail...</p>
        ) : logs.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-500">No audit logs recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-amber-400">{log.user}</span>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-200">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center space-x-1 flex-shrink-0 ml-4">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

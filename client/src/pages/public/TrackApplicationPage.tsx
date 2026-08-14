import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, Clock, AlertCircle, Calendar, ArrowRight, Building, FileText } from 'lucide-react';
import { api } from '../../services/api';

interface TrackApplicationPageProps {
  initialAppId?: string;
  onNavigate: (view: string, param?: any) => void;
}

export const TrackApplicationPage: React.FC<TrackApplicationPageProps> = ({ initialAppId, onNavigate }) => {
  const [appId, setAppId] = useState(initialAppId || '');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    if (initialAppId) {
      handleSearch(initialAppId);
    }
  }, [initialAppId]);

  const handleSearch = async (searchId?: string) => {
    const targetId = searchId || appId;
    if (!targetId.trim()) {
      setError('Please enter your Application ID (e.g. RHR-2026-000001)');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.trackApplication(targetId.trim(), identifier.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Application not found. Please check your ID and mobile/email.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'NEW': return 1;
      case 'UNDER REVIEW': return 2;
      case 'SHORTLISTED': return 3;
      case 'INTERVIEW SCHEDULED': return 4;
      case 'INTERVIEW COMPLETED': return 4;
      case 'SELECTED': return 5;
      case 'REJECTED': return 5;
      default: return 1;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-fadeIn pb-24">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-widest bg-sky-100 text-sky-700 border border-sky-300 rounded-full">
          Candidate Portal
        </span>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900">
          Track Application Status
        </h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto font-medium">
          Enter your Application ID to view your real-time recruitment progression.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-200 shadow-xl shadow-sky-500/5 space-y-4 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Application ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. RHR-2026-000001"
              value={appId}
              onChange={e => setAppId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm font-mono uppercase tracking-wider"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Registered Mobile / Email (Optional Verification)
            </label>
            <input
              type="text"
              placeholder="Mobile number or Email"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
        >
          <Search className="w-5 h-5" />
          <span>{loading ? 'Searching...' : 'Track Application'}</span>
        </button>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* TRACKING RESULT DISPLAY */}
      {result && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-300 shadow-2xl space-y-8 animate-fadeIn">
          
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-sky-100 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 text-xs font-extrabold rounded bg-sky-100 text-sky-800 border border-sky-200">
                  {result.organizationId}
                </span>
                <span className="font-mono text-sm font-bold text-slate-600">
                  {result.applicationId}
                </span>
              </div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mt-2">
                {result.applicantName}
              </h2>
              <p className="text-xs text-sky-700 font-semibold">{result.positionApplied}</p>
            </div>

            <div className="text-right">
              <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider inline-block ${
                result.status === 'SELECTED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                result.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                result.status === 'SHORTLISTED' ? 'bg-sky-100 text-sky-800 border border-sky-300' :
                'bg-sky-100 text-sky-800 border border-sky-300'
              }`}>
                {result.status}
              </span>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                Submitted on {new Date(result.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* VISUAL TIMELINE STEPPER */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Recruitment Progression Timeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { title: 'Submitted', statusKey: 1 },
                { title: 'Received', statusKey: 1 },
                { title: 'Under Review', statusKey: 2 },
                { title: 'Interview', statusKey: 4 },
                { title: 'Decision', statusKey: 5 }
              ].map((step, idx) => {
                const currentStepIdx = getStatusStepIndex(result.status);
                const isPassed = currentStepIdx >= step.statusKey;
                return (
                  <div key={idx} className={`p-4 rounded-xl border text-center transition-all ${
                    isPassed 
                      ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center mx-auto mb-2 ${
                      isPassed ? 'bg-sky-600 text-white shadow-md shadow-sky-500/25' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <p className="text-xs font-bold">{step.title}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Activity Logs */}
          {result.history && result.history.length > 0 && (
            <div className="pt-4 border-t border-sky-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Status Event History
              </h4>
              <div className="space-y-2">
                {result.history.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-sky-50/60 border border-sky-200 text-xs flex items-start justify-between">
                    <div>
                      <span className="font-bold text-sky-700">{item.toStatus}</span>
                      <p className="text-slate-700 mt-0.5">{item.remarks}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 flex-shrink-0 ml-4">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

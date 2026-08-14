import React, { useEffect } from 'react';
import { CheckCircle2, Copy, FileText, Search, ArrowRight, Download, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Application } from '../../types';

interface SuccessPageProps {
  applicationId: string;
  application?: Application;
  onNavigate: (view: string, param?: any) => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({ applicationId, application, onNavigate }) => {
  
  useEffect(() => {
    // Trigger festive celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(applicationId);
    alert(`Application ID ${applicationId} copied to clipboard!`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 animate-fadeIn">
      
      <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-widest">
          Submission Confirmed
        </span>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white">
          Application Submitted Successfully!
        </h1>
        <p className="text-slate-300 text-sm max-w-lg mx-auto">
          Thank you for applying to Rathinam Group. Your application has been logged into our recruitment system and notified to HR Admin.
        </p>
      </div>

      {/* Application ID Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 max-w-lg mx-auto shadow-2xl space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Your Unique Application ID
        </p>
        <div className="flex items-center justify-center space-x-3 bg-slate-950 py-3 px-5 rounded-2xl border border-slate-800">
          <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-wider text-white">
            {applicationId}
          </span>
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
            title="Copy ID"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          Save or note down this Application ID. You will need it to track your recruitment status online.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={() => onNavigate('track', { searchId: applicationId })}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg"
        >
          <Search className="w-4 h-4" />
          <span>Track Application Status</span>
        </button>

        <button
          onClick={() => onNavigate('landing')}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 flex items-center justify-center space-x-2"
        >
          <span>Back to Home</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

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
      
      <div className="w-20 h-20 rounded-full bg-sky-100 border-2 border-sky-400 text-sky-600 flex items-center justify-center mx-auto shadow-xl shadow-sky-500/20">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold uppercase tracking-widest">
          Submission Confirmed
        </span>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900">
          Application Submitted Successfully!
        </h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto">
          Thank you for applying to Rathinam Group. Your application has been logged into our recruitment system and notified to HR Admin.
        </p>
      </div>

      {/* Application ID Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-300 bg-gradient-to-r from-sky-50 via-white to-sky-100 max-w-lg mx-auto shadow-xl space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-sky-800">
          Your Unique Application ID
        </p>
        <div className="flex items-center justify-center space-x-3 bg-white py-3 px-5 rounded-2xl border border-sky-200 shadow-inner">
          <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-wider text-sky-900">
            {applicationId}
          </span>
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors border border-sky-300"
            title="Copy ID"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">
          Save or note down this Application ID. You will need it to track your recruitment status online.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={() => onNavigate('track', { searchId: applicationId })}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
        >
          <Search className="w-4 h-4" />
          <span>Track Application Status</span>
        </button>

        <button
          onClick={() => onNavigate('landing')}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-sky-50 text-slate-700 font-bold text-sm border border-sky-200 flex items-center justify-center space-x-2 shadow-sm"
        >
          <span>Back to Home</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

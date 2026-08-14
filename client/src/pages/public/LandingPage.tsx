import React from 'react';
import { 
  GraduationCap, ArrowRight, ShieldCheck, Search, Sparkles, 
  Building2, FileText, CheckCircle2, Award, Users, Clock, Upload, 
  HelpCircle, ChevronRight, Compass, ArrowUpRight, Check, Landmark, Cpu, Pill
} from 'lucide-react';
import { OrgCards } from '../../components/OrgCards';
import { OrganizationId } from '../../types';

interface LandingPageProps {
  onNavigate: (view: string, param?: any) => void;
  onSelectOrg: (orgId: OrganizationId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectOrg }) => {
  return (
    <div className="space-y-16 pb-20 animate-fadeIn">
      
      {/* STITCH HERO SECTION WITH CAMPUS OVERLAY */}
      <section className="relative w-full min-h-[580px] sm:min-h-[640px] flex items-center justify-center px-4 sm:px-8 rounded-3xl overflow-hidden glass-panel border border-slate-800 my-4 bg-slate-950">
        
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0 opacity-45">
          <div 
            className="bg-cover bg-center w-full h-full transform scale-105 transition-transform duration-1000"
            style={{ 
              backgroundImage: `url('/rathinam_campus.jpg')` 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950 z-10" />
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center text-center space-y-6 py-12">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-widest uppercase shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join The Excellence • Rathinam Group</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight">
            Rathinam HR – <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">Career Application</span> Portal
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-sans leading-relaxed">
            Build Your Future with Rathinam. Explore opportunities across our premier institutions and take the next step in your professional journey with our streamlined recruitment portal.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('apply-selector')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-3 transition-all hover:scale-105 active:scale-95"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('track')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700/80 flex items-center justify-center space-x-2 transition-all hover:border-amber-400/50"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span>Track Application</span>
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-800/80 text-center">
              <p className="text-2xl font-extrabold text-white font-heading">3+</p>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Institutions</p>
            </div>
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-800/80 text-center">
              <p className="text-2xl font-extrabold text-amber-400 font-heading">100%</p>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Digital Workflow</p>
            </div>
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-800/80 text-center">
              <p className="text-2xl font-extrabold text-emerald-400 font-heading">Fast</p>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">HR Screening</p>
            </div>
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-800/80 text-center">
              <p className="text-2xl font-extrabold text-cyan-400 font-heading">24/7</p>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Status Tracker</p>
            </div>
          </div>

        </div>
      </section>

      {/* BENTO GRID ORGANIZATION SELECTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            Choose Your Institution
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Select the organization you wish to apply for and discover tailored career opportunities.
          </p>
        </div>

        <OrgCards onSelectOrg={onSelectOrg} />
      </section>

      {/* 7-STEP APPLICATION JOURNEY TIMELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
              The Application Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-3">
              Transparent 7-Step Recruitment Process
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              A clear, guided workflow from online registration to candidate selection.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { step: '01', title: 'Select Org', desc: 'Choose institution', icon: Building2, color: 'text-amber-400' },
              { step: '02', title: 'Complete App', desc: 'Personal details', icon: FileText, color: 'text-amber-400' },
              { step: '03', title: 'Upload Docs', desc: 'Attach files & CV', icon: Upload, color: 'text-amber-400' },
              { step: '04', title: 'Submit', desc: 'Finalize entry', icon: CheckCircle2, color: 'text-amber-400' },
              { step: '05', title: 'Review', desc: 'HR screening', icon: Users, color: 'text-amber-400' },
              { step: '06', title: 'Interview', desc: 'Meet the team', icon: Clock, color: 'text-amber-400' },
              { step: '07', title: 'Selection', desc: 'Welcome aboard', icon: Award, color: 'text-emerald-400' }
            ].map((st, idx) => {
              const IconC = st.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-2 group hover:border-amber-400/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <IconC className={`w-5 h-5 ${st.color}`} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{st.step}</span>
                    <h4 className="text-xs font-bold text-slate-100">{st.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* TRACKER CALLOUT CARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md">
              Real-Time Status Tracker
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
              Already Submitted Your Application?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Track your live recruitment progress, interview schedule, and selection status with your Application ID.
            </p>
          </div>

          <button
            onClick={() => onNavigate('track')}
            className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center space-x-2 whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            <span>Open Candidate Tracker</span>
          </button>
        </div>
      </section>

    </div>
  );
};


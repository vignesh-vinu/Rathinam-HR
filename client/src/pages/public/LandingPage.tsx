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
      <section className="relative w-full min-h-[580px] sm:min-h-[640px] flex items-center justify-center px-4 sm:px-8 rounded-3xl overflow-hidden glass-panel border border-slate-200/80 my-4 bg-white/70 shadow-lg">
        
        {/* Background Image with Light Gradient Overlay */}
        <div className="absolute inset-0 z-0 opacity-25">
          <div 
            className="bg-cover bg-center w-full h-full transform scale-105 transition-transform duration-1000"
            style={{ 
              backgroundImage: `url('/rathinam_campus.jpg')` 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/75 to-slate-50 z-10" />
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center text-center space-y-6 py-12">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-widest uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Join The Excellence • Rathinam Group</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-heading font-extrabold text-slate-900 tracking-tight leading-tight">
            Rathinam HR – <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">Career Application</span> Portal
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-sans leading-relaxed font-normal">
            Build Your Future with Rathinam. Explore opportunities across our premium institutions and take the next step in your professional journey with our streamlined application process.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('apply-selector')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center space-x-3 transition-all hover:scale-105 active:scale-95"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('track')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm flex items-center justify-center space-x-2 transition-all hover:border-orange-400"
            >
              <Search className="w-4 h-4 text-orange-600" />
              <span>Track Application</span>
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 text-center bg-white/80">
              <p className="text-2xl font-extrabold text-slate-900 font-heading">3+</p>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Institutions</p>
            </div>
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 text-center bg-white/80">
              <p className="text-2xl font-extrabold text-orange-600 font-heading">100%</p>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Digital Workflow</p>
            </div>
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 text-center bg-white/80">
              <p className="text-2xl font-extrabold text-emerald-600 font-heading">Fast</p>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">HR Screening</p>
            </div>
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 text-center bg-white/80">
              <p className="text-2xl font-extrabold text-blue-600 font-heading">24/7</p>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Status Tracker</p>
            </div>
          </div>

        </div>
      </section>

      {/* BENTO GRID ORGANIZATION SELECTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
            Choose Your Institution
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Select the organization you wish to apply for and discover tailored career opportunities.
          </p>
        </div>

        <OrgCards onSelectOrg={onSelectOrg} />
      </section>

      {/* 7-STEP APPLICATION JOURNEY TIMELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200 space-y-8 bg-white/80 shadow-md">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              The Application Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mt-3">
              Transparent 7-Step Recruitment Process
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              A clear, guided workflow from online registration to candidate selection.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { step: '01', title: 'Select Org', desc: 'Choose institution', icon: Building2, color: 'text-orange-600' },
              { step: '02', title: 'Complete App', desc: 'Personal details', icon: FileText, color: 'text-orange-600' },
              { step: '03', title: 'Upload Docs', desc: 'Attach files & CV', icon: Upload, color: 'text-orange-600' },
              { step: '04', title: 'Submit', desc: 'Finalize entry', icon: CheckCircle2, color: 'text-orange-600' },
              { step: '05', title: 'Review', desc: 'HR screening', icon: Users, color: 'text-orange-600' },
              { step: '06', title: 'Interview', desc: 'Meet the team', icon: Clock, color: 'text-orange-600' },
              { step: '07', title: 'Selection', desc: 'Welcome aboard', icon: Award, color: 'text-emerald-600' }
            ].map((st, idx) => {
              const IconC = st.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 group hover:border-orange-400 hover:bg-orange-50/50 transition-colors shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-inner">
                    <IconC className={`w-5 h-5 ${st.color}`} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{st.step}</span>
                    <h4 className="text-xs font-bold text-slate-800">{st.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* TRACKER CALLOUT CARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-md">
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
            className="px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-extrabold text-xs shadow-lg transition-all flex items-center space-x-2 whitespace-nowrap hover:scale-105"
          >
            <Search className="w-4 h-4" />
            <span>Open Candidate Tracker</span>
          </button>
        </div>
      </section>

    </div>
  );
};


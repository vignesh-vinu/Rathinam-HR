import React from 'react';
import { GraduationCap, Cpu, Pill, ArrowRight, Building, Award, Users, CheckCircle2 } from 'lucide-react';
import { OrganizationId } from '../types';

interface OrgCardsProps {
  onSelectOrg: (orgId: OrganizationId) => void;
}

export const OrgCards: React.FC<OrgCardsProps> = ({ onSelectOrg }) => {
  const organizations = [
    {
      id: 'RGU' as OrganizationId,
      name: 'RGU',
      fullName: 'Rathinam Global (Deemed to be University)',
      subtitle: 'Excellence in Higher Education & Research',
      description: 'Premier university offering undergraduate, postgraduate, and doctoral programs across arts, science, commerce, and advanced technology.',
      icon: GraduationCap,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      accentGlow: 'group-hover:border-blue-500/50 group-hover:shadow-blue-500/10',
      btnBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500',
      stats: '12+ Faculties • 45+ Programs'
    },
    {
      id: 'RTC' as OrganizationId,
      name: 'RTC',
      fullName: 'Rathinam Technical Campus',
      subtitle: 'Engineering, Technology & Innovation Hub',
      description: 'AICTE approved & NAAC accredited engineering campus offering cutting-edge programs in CS, AI, ECE, Robotics, and Mechanical Engineering.',
      icon: Cpu,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      accentGlow: 'group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/10',
      btnBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
      stats: 'NAAC A+ Accredited • NBA Certified'
    },
    {
      id: 'RPHARM' as OrganizationId,
      name: 'RPHARM',
      fullName: 'Rathinam Pharmacy',
      subtitle: 'Pharmaceutical Sciences & Healthcare',
      description: 'PCI approved institution delivering top-tier B.Pharm, M.Pharm, and Pharm.D education with state-of-the-art research laboratories.',
      icon: Pill,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      accentGlow: 'group-hover:border-amber-500/50 group-hover:shadow-amber-500/10',
      btnBg: 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500',
      stats: 'PCI Approved • Advanced R&D Lab'
    }
  ];

  return (
    <div className="py-8">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-widest bg-orange-50 text-orange-700 border border-orange-200 rounded-full">
          Step 1: Select Institution
        </span>
        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 mt-3 tracking-tight">
          Choose Your Target Organization
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-2 font-normal">
          Select the Rathinam institution where you wish to apply. Your selection will automatically customize the application routing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {organizations.map((org) => {
          const IconComp = org.icon;
          return (
            <div
              key={org.id}
              onClick={() => onSelectOrg(org.id)}
              className="group glass-panel rounded-2xl p-8 relative cursor-pointer border border-slate-200/80 bg-white/80 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Header Badge & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <IconComp className="w-7 h-7 text-orange-600" />
                  </div>
                  <span className="px-3 py-1 text-xs font-extrabold tracking-wider border rounded-full bg-slate-100 text-slate-700 border-slate-200">
                    {org.name}
                  </span>
                </div>

                {/* Org Titles */}
                <h3 className="text-xl font-heading font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {org.fullName}
                </h3>
                <p className="text-xs font-semibold text-orange-600 mt-1 mb-3">
                  {org.subtitle}
                </p>
                <p className="text-slate-600 text-xs leading-relaxed mb-6 font-normal">
                  {org.description}
                </p>
              </div>

              <div>
                {/* Micro Stats */}
                <div className="py-3 px-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-6 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center space-x-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{org.stats}</span>
                  </span>
                </div>

                {/* Apply Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOrg(org.id);
                  }}
                  className="w-full py-3.5 px-5 rounded-xl font-bold text-sm text-white bg-orange-600 hover:bg-orange-500 flex items-center justify-center space-x-2 shadow-md shadow-orange-500/20 transition-all group-hover:shadow-lg"
                >
                  <span>Apply to {org.name}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

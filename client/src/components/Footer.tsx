import React from 'react';
import { GraduationCap, Mail, Phone, MapPin, Globe, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="glass-panel border-t border-slate-800/80 bg-slate-950/90 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <span className="font-heading text-lg font-bold text-white">
                Rathinam<span className="text-amber-400">HR</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official Smart Recruitment & Applicant Management Platform for Rathinam Group of Institutions, Coimbatore, Tamil Nadu.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Institutions */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-heading">Institutions</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="hover:text-white transition-colors cursor-pointer">Rathinam Global (Deemed to be University) (RGU)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Rathinam Technical Campus (RTC)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Rathinam College of Pharmacy</li>
              <li className="hover:text-white transition-colors cursor-pointer">Rathinam International School</li>
            </ul>
          </div>

          {/* Candidate Tools */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-heading">Applicant Portal</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="hover:text-white transition-colors cursor-pointer">Online Application Form</li>
              <li className="hover:text-white transition-colors cursor-pointer">Track Application Status</li>
              <li className="hover:text-white transition-colors cursor-pointer">PDF Field Mapping Standards</li>
              <li className="hover:text-white transition-colors cursor-pointer">Resume Generator</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-heading">HR Contact</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Rathinam Techzone Campus, Eachanari, Coimbatore - 641021</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>+91 422 4040900 / HR Desk</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>careers@rathinam.in</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>www.rathinamgroup.edu.in</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Rathinam Group. All Rights Reserved. Confidential HR Recruitment System.</p>
          <p className="flex items-center space-x-1 mt-2 md:mt-0">
            <span>Built with precision & elegance for Rathinam Group</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

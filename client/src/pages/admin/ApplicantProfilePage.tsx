import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, GraduationCap, Briefcase, Award, Languages, 
  Users, FileText, CheckCircle2, ChevronLeft, Download, Printer, Edit, 
  MessageSquare, Clock, ShieldCheck, Sparkles, Building, Eye, Plus
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Application, StatusHistory, HRNote, PersonalDetails, ContactDetails, FinancialDetails } from '../../types';

interface ApplicantProfilePageProps {
  applicationId: string;
  onNavigate: (view: string, param?: any) => void;
}

export const ApplicantProfilePage: React.FC<ApplicantProfilePageProps> = ({ applicationId, onNavigate }) => {
  const { user } = useAuth();
  
  const [app, setApp] = useState<Application | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [notes, setNotes] = useState<HRNote[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'resume' | 'documents' | 'timeline' | 'notes'>('overview');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // HR Admin Candidate Edit State (CRUD Edit)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingEdits, setSavingEdits] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const openEditModal = () => {
    if (!app) return;
    setEditFormData({
      positionApplied: app.positionApplied || '',
      organizationId: app.organizationId || 'RGU',
      personalDetails: { ...app.personalDetails },
      contactDetails: { ...app.contactDetails },
      financialDetails: { ...app.financialDetails },
      certifications: app.certifications || ''
    });
    setShowEditModal(true);
  };

  const handleSaveHREdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;
    setSavingEdits(true);
    try {
      const fn = editFormData.personalDetails?.firstName || '';
      const mn = editFormData.personalDetails?.middleName || '';
      const ln = editFormData.personalDetails?.lastName || '';
      const fullName = `${fn} ${mn} ${ln}`.replace(/\s+/g, ' ').trim().toUpperCase();

      const payload = {
        ...editFormData,
        personalDetails: {
          ...editFormData.personalDetails,
          fullName
        },
        updatedBy: user?.name || 'HR Admin'
      };

      await api.updateApplication(app.id, payload);
      setShowEditModal(false);
      setSuccessToast('Candidate application details updated and saved successfully!');
      setTimeout(() => setSuccessToast(null), 4000);
      fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to save candidate updates');
    } finally {
      setSavingEdits(false);
    }
  };

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getApplicationById(applicationId);
      setApp(data.application);
      setHistory(data.statusHistory || []);
      setNotes(data.hrNotes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      fetchDetails();
    }
  }, [applicationId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !app) return;
    setAddingNote(true);
    try {
      await api.addHRNote(app.id, newNoteContent, user?.name || 'HR Admin');
      setNewNoteContent('');
      fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handlePrintResume = () => {
    setActiveTab('resume');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-400 animate-pulse">
        Loading applicant profile & generated resume...
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-400 space-y-4">
        <p className="text-lg font-bold text-white">Application record not found.</p>
        <button
          onClick={() => onNavigate('admin-dashboard')}
          className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
        >
          Return to HR Dashboard
        </button>
      </div>
    );
  }

  const p = app.personalDetails || ({} as PersonalDetails);
  const c = app.contactDetails || ({} as ContactDetails);
  const f = app.financialDetails || ({} as FinancialDetails);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn pb-24">
      
      {/* Top Navigation & Action Buttons (Hidden on Print) */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('admin-dashboard')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Applications Table</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openEditModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Candidate Details</span>
          </button>

          <button
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'resume' ? 'bg-slate-700 text-amber-400 border border-amber-400/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-1" />
            <span>View Data Sheet PDF</span>
          </button>

          <button
            onClick={handlePrintResume}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Print Data Sheet PDF (2-Page)</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>HR Notes ({notes.length})</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        </div>
      )}

      {/* HEADER CANDIDATE BANNER */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 no-print">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center space-x-5">
            <img
              src={p.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={p.firstName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 text-xs font-extrabold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {app.organizationId}
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">
                  {app.applicationId}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-1">
                {p.firstName} {p.middleName} {p.lastName}
              </h1>
              <p className="text-sm font-semibold text-amber-400 mt-0.5">
                {app.positionApplied}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {c.email} • {c.mobile} • {c.city}, {c.state}
              </p>
            </div>
          </div>

          <div className="text-center md:text-right space-y-2">
            <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider inline-block ${
              app.status === 'SELECTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
              app.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
              app.status === 'SHORTLISTED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
              'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}>
              Status: {app.status}
            </span>
            <p className="text-xs font-bold text-slate-300">
              Submitted: <span className="text-amber-400 font-mono">{app.submissionDate || new Date(app.submittedAt).toLocaleDateString()}</span> at <span className="text-amber-400 font-mono">{app.submissionTime || new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          </div>

        </div>
      </div>

      {/* NAVIGATION TABS (No-print) */}
      <div className="no-print flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Full Overview', icon: User },
          { id: 'resume', label: 'Executive Resume View', icon: FileText },
          { id: 'documents', label: `Documents (${app.documents?.length || 0})`, icon: Award },
          { id: 'timeline', label: `Timeline History (${history.length})`, icon: Clock },
          { id: 'notes', label: `Internal HR Remarks (${notes.length})`, icon: MessageSquare }
        ].map(tab => {
          const IconC = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <IconC className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Personal & Contact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Personal & Bio Details</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-300">
                <p><strong>Full Name:</strong> {p.fullName}</p>
                <p><strong>DOB / Age:</strong> {p.dob} ({p.age} Years)</p>
                <p><strong>Gender / Marital Status:</strong> {p.gender} / {p.maritalStatus}</p>
                <p><strong>Nationality / Category:</strong> {p.nationality} ({p.category})</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Contact & Communication</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-300">
                <p><strong>Email ID:</strong> {c.email}</p>
                <p><strong>Mobile / Alt Phone:</strong> {c.mobile} / {c.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {c.address}, {c.city}, {c.state} - {c.pincode}</p>
              </div>
            </div>

          </div>

          {/* Education Table */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>Educational Qualifications (Latest First)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-300">
                    <th className="py-2.5 px-3">Degree</th>
                    <th className="py-2.5 px-3">Institution & Board</th>
                    <th className="py-2.5 px-3">Division</th>
                    <th className="py-2.5 px-3">Specialization</th>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3">Percentage/CGPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(app.educationDetails || []).map((edu, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-bold text-slate-200">{edu.degree}</td>
                      <td className="py-2.5 px-3 text-slate-300">{edu.institution} ({edu.boardUniversity})</td>
                      <td className="py-2.5 px-3 text-slate-400">{edu.division}</td>
                      <td className="py-2.5 px-3 text-slate-300">{edu.majorSubjects}</td>
                      <td className="py-2.5 px-3 font-mono text-amber-400">{edu.yearOfPassing}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">{edu.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Work Experience Table */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span>Professional Experience</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-300">
                    <th className="py-2.5 px-3">Organization</th>
                    <th className="py-2.5 px-3">Designation</th>
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3">Gross PA (₹)</th>
                    <th className="py-2.5 px-3">Reason for Leaving</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(app.experienceDetails || []).map((exp, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-bold text-slate-200">{exp.organization}</td>
                      <td className="py-2.5 px-3 text-amber-300">{exp.designation}</td>
                      <td className="py-2.5 px-3 text-slate-400">{exp.periodFrom} to {exp.periodTo}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-200">₹{exp.grossAnnualSalary}</td>
                      <td className="py-2.5 px-3 text-slate-400">{exp.reasonForLeaving}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: OFFICIAL RATHINAM Candidate Personal Data Sheet PDF VIEW */}
      {activeTab === 'resume' && (
        <div className="resume-container bg-white text-black p-6 sm:p-10 font-sans shadow-2xl rounded-2xl max-w-4xl mx-auto space-y-8">
          
          {/* ==================== PAGE 1 ==================== */}
          <div className="space-y-4 print-page">
            
            {/* Header: Rathinam Logo + Title + Passport Photo Box */}
            <div className="flex items-start justify-between border-b-2 border-black pb-3">
              <div className="flex-1 text-center pl-28">
                {/* Rathinam Colored Logo */}
                <div className="inline-flex flex-col items-center">
                  <div className="flex items-center space-x-1 mb-1">
                    <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-emerald-500 -mt-2 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 border-sky-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    </div>
                  </div>
                  <span className="font-extrabold text-lg tracking-widest text-black uppercase font-heading">
                    RATHINAM
                  </span>
                </div>
                <h1 className="text-lg font-bold text-black underline uppercase mt-1">
                  Candidate Personal Data Sheet
                </h1>
              </div>

              {/* Passport Size Photo Box on Top Right */}
              <div className="w-[105px] h-[130px] border-2 border-black p-0.5 flex flex-col items-center justify-center bg-slate-50 text-center flex-shrink-0 ml-4">
                {p.photoUrl ? (
                  <img src={p.photoUrl} alt="Candidate Photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-[10px] font-bold text-slate-500 uppercase leading-tight px-1">
                    Affix Candidate Passport Size Photo
                  </div>
                )}
              </div>
            </div>

            {/* Date / Time / Source Box */}
            <div className="border border-black grid grid-cols-3 text-xs divide-x divide-black font-semibold">
              <div className="p-2">Date : <span className="font-normal">{app.submissionDate || new Date(app.submittedAt).toLocaleDateString()}</span></div>
              <div className="p-2">Time : <span className="font-normal">{app.submissionTime || new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
              <div className="p-2">Source : <span className="font-normal">{app.source || 'Career Portal'}</span></div>
            </div>

            {/* Personal Details Form Lines */}
            <div className="space-y-2.5 text-xs font-semibold leading-relaxed pt-1">
              <div className="border-b border-black/30 pb-1">
                <span>Position Applied for : </span>
                <span className="font-normal underline underline-offset-4">{app.positionApplied}</span>
              </div>

              <div className="border-b border-black/30 pb-1 flex items-baseline justify-between flex-wrap gap-2">
                <span>Name (In Block Letters) : <span className="font-bold uppercase text-sm">{p.firstName || ''}</span> <span className="text-[10px] font-normal text-slate-500">(First Name)</span></span>
                <span><span className="font-bold uppercase text-sm">{p.middleName || '-'}</span> <span className="text-[10px] font-normal text-slate-500">(Middle Name)</span></span>
                <span><span className="font-bold uppercase text-sm">{p.lastName || ''}</span> <span className="text-[10px] font-normal text-slate-500">(Last Name)</span></span>
              </div>

              <div className="border-b border-black/30 pb-1">
                <span>Contact Address : </span>
                <span className="font-normal">{c.address}, {c.city}, {c.state}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-black/30 pb-1">
                <div>Pin code : <span className="font-normal">{c.pincode}</span></div>
                <div>e – Mail id : <span className="font-normal">{c.email}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-black/30 pb-1">
                <div>Phone : <span className="font-normal">{c.phone || 'N/A'}</span></div>
                <div>Mobile : <span className="font-normal">{c.mobile}</span></div>
              </div>

              <div className="grid grid-cols-4 gap-2 border-b border-black/30 pb-1">
                <div>Date of Birth: <span className="font-normal">{p.dob}</span></div>
                <div>Age : <span className="font-normal">{p.age} Yrs</span></div>
                <div>Gender : <span className="font-normal">{p.gender}</span></div>
                <div>Marital Status : <span className="font-normal">{p.maritalStatus}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-black/30 pb-1">
                <div>Current Gross (Per Annum) : <span className="font-normal">₹{f.currentSalary || 'N/A'}</span></div>
                <div>Expected Gross (Per Annum) : <span className="font-normal">₹{f.expectedSalary || 'N/A'}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-black/30 pb-1">
                <div>Current Company Notice Period : <span className="font-normal">{f.noticePeriod || 'Immediate'}</span></div>
                <div>Total years of Experience : <span className="font-normal">{f.totalExperienceYears || '0'} Years</span></div>
              </div>
            </div>

            {/* Educational Qualifications Table */}
            <div className="pt-2 space-y-1">
              <h3 className="text-xs font-bold text-black uppercase">Educational Qualifications:</h3>
              <table className="w-full text-center text-[11px] border-collapse border border-black">
                <thead>
                  <tr className="border-b border-black bg-slate-100 font-bold">
                    <th className="border-r border-black p-1.5">Degree (from latest)</th>
                    <th className="border-r border-black p-1.5">Division</th>
                    <th className="border-r border-black p-1.5">College</th>
                    <th className="border-r border-black p-1.5">Name of Board/University</th>
                    <th className="border-r border-black p-1.5">Credit Points / % of Marks</th>
                    <th className="border-r border-black p-1.5">Major Subjects</th>
                    <th className="p-1.5">Year of Passing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {(app.educationDetails || []).map((edu, idx) => (
                    <tr key={idx}>
                      <td className="border-r border-black p-1.5 font-bold">{edu.degree}</td>
                      <td className="border-r border-black p-1.5">{edu.division}</td>
                      <td className="border-r border-black p-1.5">{edu.institution}</td>
                      <td className="border-r border-black p-1.5">{edu.boardUniversity}</td>
                      <td className="border-r border-black p-1.5 font-semibold">{edu.percentage}</td>
                      <td className="border-r border-black p-1.5">{edu.majorSubjects}</td>
                      <td className="p-1.5 font-mono">{edu.yearOfPassing}</td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - (app.educationDetails?.length || 0)) }).map((_, i) => (
                    <tr key={`empty-edu-${i}`}>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="p-2">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Work Experience Table */}
            <div className="pt-2 space-y-1">
              <h3 className="text-xs font-bold text-black uppercase">Work Experience (Starting from present Organization)</h3>
              <table className="w-full text-center text-[11px] border-collapse border border-black">
                <thead>
                  <tr className="border-b border-black bg-slate-100 font-bold">
                    <th className="border-r border-black p-1" rowSpan={2}>Name of Organization</th>
                    <th className="border-r border-black p-1" rowSpan={2}>Designation</th>
                    <th className="border-r border-black p-1" colSpan={2}>Period</th>
                    <th className="border-r border-black p-1" rowSpan={2}>Gross Salary PM</th>
                    <th className="border-r border-black p-1" rowSpan={2}>Annual CTC</th>
                    <th className="p-1" rowSpan={2}>Reason for Leaving</th>
                  </tr>
                  <tr className="border-b border-black bg-slate-100 font-bold">
                    <th className="border-r border-black p-1 text-[10px]">From</th>
                    <th className="border-r border-black p-1 text-[10px]">To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {(app.experienceDetails || []).map((exp, idx) => (
                    <tr key={idx}>
                      <td className="border-r border-black p-1.5 font-bold">{exp.organization}</td>
                      <td className="border-r border-black p-1.5">{exp.designation}</td>
                      <td className="border-r border-black p-1 text-[10px] font-mono">{exp.periodFrom}</td>
                      <td className="border-r border-black p-1 text-[10px] font-mono">{exp.periodTo}</td>
                      <td className="border-r border-black p-1.5 font-mono">{exp.ctcPerMonth ? `₹${exp.ctcPerMonth}` : '-'}</td>
                      <td className="border-r border-black p-1.5 font-mono">₹{exp.grossAnnualSalary}</td>
                      <td className="p-1.5">{exp.reasonForLeaving}</td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - (app.experienceDetails?.length || 0)) }).map((_, i) => (
                    <tr key={`empty-exp-${i}`}>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="p-2">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-b border-black/30 pb-1 text-xs font-semibold pt-1">
              Career Break If any: <span className="font-normal">{app.experienceDetails?.[0]?.careerBreak || 'None'}</span>
            </div>

            {/* Page 1 Footer */}
            <div className="pt-3 text-[10px] text-slate-600 font-semibold flex justify-between border-t border-black/20">
              <span>Doc Ref: RGI/HR/FR 001 Rev:02 - Date of Issue: 01-06-2025</span>
              <span>Page 1 of 2</span>
            </div>
          </div>

          {/* ==================== PAGE BREAK ==================== */}
          <div className="page-break my-8 border-b-2 border-dashed border-slate-300 no-print" />

          {/* ==================== PAGE 2 ==================== */}
          <div className="space-y-4 print-page pt-4">
            
            {/* Header: Rathinam Logo Page 2 */}
            <div className="text-center border-b-2 border-black pb-3">
              <div className="inline-flex flex-col items-center">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-500 -mt-2 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-sky-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  </div>
                </div>
                <span className="font-extrabold text-base tracking-widest text-black uppercase font-heading">
                  RATHINAM
                </span>
              </div>
            </div>

            {/* Certifications */}
            <div className="border-b border-black/30 pb-1 text-xs font-semibold">
              Certifications if Any? (E.g.: Oracle, Java, Network etc. ) : <span className="font-normal">{app.certifications || 'None listed'}</span>
            </div>

            {/* Languages Known Grid */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-black uppercase">Language Known:</h3>
              <table className="w-full text-center text-[11px] border-collapse border border-black">
                <thead>
                  <tr className="border-b border-black bg-slate-100 font-bold">
                    <th className="border-r border-black p-1">S. No.</th>
                    <th className="border-r border-black p-1">Language</th>
                    <th className="border-r border-black p-1 text-[10px]">R &nbsp; W &nbsp; S &nbsp; U</th>
                    <th className="border-r border-black p-1">S. No.</th>
                    <th className="border-r border-black p-1">Language</th>
                    <th className="p-1 text-[10px]">R &nbsp; W &nbsp; S &nbsp; U</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {(app.languagesKnown || []).map((lang, idx) => (
                    <tr key={idx}>
                      <td className="border-r border-black p-1">{idx + 1}</td>
                      <td className="border-r border-black p-1 font-semibold">{lang.language}</td>
                      <td className="border-r border-black p-1 font-mono text-[10px]">
                        {lang.read ? '☑' : '☐'} &nbsp; {lang.write ? '☑' : '☐'} &nbsp; {lang.speak ? '☑' : '☐'} &nbsp; {lang.understand ? '☑' : '☐'}
                      </td>
                      <td className="border-r border-black p-1">-</td>
                      <td className="border-r border-black p-1">-</td>
                      <td className="p-1 font-mono text-[10px]">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Family Details Table */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-black uppercase">*Family Details:</h3>
              <table className="w-full text-center text-[11px] border-collapse border border-black">
                <thead>
                  <tr className="border-b border-black bg-slate-100 font-bold">
                    <th className="border-r border-black p-1">S. No.</th>
                    <th className="border-r border-black p-1">Name</th>
                    <th className="border-r border-black p-1">Age</th>
                    <th className="border-r border-black p-1">Relationship</th>
                    <th className="border-r border-black p-1">Occupation</th>
                    <th className="border-r border-black p-1">Dependent / Not</th>
                    <th className="p-1">Contact No</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {(app.familyDetails || []).map((fam, idx) => (
                    <tr key={idx}>
                      <td className="border-r border-black p-1">{idx + 1}</td>
                      <td className="border-r border-black p-1 font-semibold">{fam.name}</td>
                      <td className="border-r border-black p-1">{fam.age}</td>
                      <td className="border-r border-black p-1">{fam.relationship}</td>
                      <td className="border-r border-black p-1">{fam.occupation}</td>
                      <td className="border-r border-black p-1">{fam.dependent ? 'Dependent' : 'Not Dependent'}</td>
                      <td className="p-1 font-mono">{fam.contactNo}</td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - (app.familyDetails?.length || 0)) }).map((_, i) => (
                    <tr key={`empty-fam-${i}`}>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="p-2">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Questionnaire */}
            <div className="space-y-1.5 text-xs font-semibold">
              <div className="border-b border-black/30 pb-1">
                Are you willing to work on Sundays? Yes / No : <span className="font-normal">{app.additionalInfo?.workSundays || 'Yes'}</span>
              </div>
              <div className="border-b border-black/30 pb-1">
                Joining time required: <span className="font-normal">{app.additionalInfo?.joiningTimeRequired || '30 Days'}</span>
              </div>
              <div className="border-b border-black/30 pb-1">
                Is there any litigation pending against you filed by (a) Any relative (b) Otherwise? If Yes, Please provide details: <span className="font-normal">{app.additionalInfo?.litigationDetails || 'None'}</span>
              </div>
            </div>

            {/* References Table */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-black uppercase">References (From your current Organization):</h3>
              <table className="w-full text-center text-[11px] border-collapse border border-black">
                <thead>
                  <tr className="border-b border-black bg-slate-100 font-bold">
                    <th className="border-r border-black p-1">S. No.</th>
                    <th className="border-r border-black p-1">Name</th>
                    <th className="border-r border-black p-1">Designation</th>
                    <th className="border-r border-black p-1">Mobile</th>
                    <th className="p-1">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {(app.references || []).map((ref, idx) => (
                    <tr key={idx}>
                      <td className="border-r border-black p-1">{idx + 1}</td>
                      <td className="border-r border-black p-1 font-semibold">{ref.name}</td>
                      <td className="border-r border-black p-1">{ref.designation}</td>
                      <td className="border-r border-black p-1 font-mono">{ref.mobile}</td>
                      <td className="p-1 font-mono">{ref.phone || 'N/A'}</td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, 2 - (app.references?.length || 0)) }).map((_, i) => (
                    <tr key={`empty-ref-${i}`}>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="border-r border-black p-2">&nbsp;</td>
                      <td className="p-2">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Solemn Declaration */}
            <div className="pt-4 space-y-6">
              <p className="text-xs font-bold text-black border-b border-black pb-2">
                I hereby solemnly declare that all the details furnished above are true to the best of my knowledge
              </p>
              
              <div className="grid grid-cols-3 text-xs font-bold pt-4 text-center">
                <div>Date : <span className="font-normal underline">{app.declarationDate || new Date().toISOString().split('T')[0]}</span></div>
                <div>Place : <span className="font-normal underline">{app.declarationPlace || 'Coimbatore'}</span></div>
                <div>Signature : <span className="font-normal italic">_________________</span></div>
              </div>
            </div>

            {/* Page 2 Footer */}
            <div className="pt-4 text-[10px] text-slate-600 font-semibold flex justify-between border-t border-black/20">
              <span>Doc Ref: RGI/HR/FR 001 Rev:02 - Date of Issue: 01-06-2025</span>
              <span>Page 2 of 2</span>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: DOCUMENTS ATTACHMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Uploaded Applicant Documents ({(app.documents || []).length})</span>
            </h3>

            {(app.documents || []).length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-300">No documents uploaded</p>
                <p className="text-[11px] text-slate-500 mt-1">Candidate has not attached any files to this application.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(app.documents || []).map((doc) => (
                  <div key={doc.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between hover:border-amber-400/40 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-100 truncate max-w-[200px]">{doc.name}</p>
                        <p className="text-[10px] text-slate-400">{doc.type} • {doc.size}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </a>
                      <a
                        href={doc.url}
                        download={doc.name}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: TIMELINE HISTORY */}
      {activeTab === 'timeline' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Application Activity & Status History ({history.length})</span>
            </h3>

            {history.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">No status history recorded yet.</p>
            ) : (
              <div className="space-y-4 relative pl-4 border-l-2 border-slate-800">
                {history.map((item, idx) => (
                  <div key={item.id || idx} className="relative group">
                    <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-slate-950" />
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-400">{item.toStatus}</span>
                        <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1">{item.remarks}</p>
                      <p className="text-[10px] text-slate-400 pt-1">Changed by: <strong className="text-slate-300">{item.updatedBy}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: HR INTERNAL REMARKS */}
      {activeTab === 'notes' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
              Add Internal HR Note
            </h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={3}
                required
                placeholder="Write confidential internal remarks..."
                value={newNoteContent}
                onChange={e => setNewNoteContent(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
              <button
                type="submit"
                disabled={addingNote}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Add Confidential Note
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Notes Log ({notes.length})
            </h4>
            {notes.map(note => (
              <div key={note.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between font-bold text-amber-400">
                  <span>{note.author}</span>
                  <span className="text-[10px] text-slate-400">{new Date(note.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-slate-200 mt-1">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HR CANDIDATE EDIT MODAL (CRUD Edit Access) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <form onSubmit={handleSaveHREdits} className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-amber-500/40 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-heading font-extrabold text-white flex items-center space-x-2">
                  <Edit className="w-5 h-5 text-amber-400" />
                  <span>Edit Candidate Submitted Application</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Correct any errors or mistakes made during candidate submission.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Position & Org */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Target Organization</label>
                <select
                  value={editFormData.organizationId || 'RGU'}
                  onChange={e => setEditFormData({ ...editFormData, organizationId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="RGU" className="bg-white text-slate-900">RGU (University)</option>
                  <option value="RTC" className="bg-white text-slate-900">RTC (Technical Campus)</option>
                  <option value="RPHARM" className="bg-white text-slate-900">Rathinam Pharmacy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Position Applied For</label>
                <input
                  type="text"
                  required
                  value={editFormData.positionApplied || ''}
                  onChange={e => setEditFormData({ ...editFormData, positionApplied: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            {/* Candidate Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.personalDetails?.firstName || ''}
                  onChange={e => setEditFormData({
                    ...editFormData,
                    personalDetails: { ...editFormData.personalDetails, firstName: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={editFormData.personalDetails?.middleName || ''}
                  onChange={e => setEditFormData({
                    ...editFormData,
                    personalDetails: { ...editFormData.personalDetails, middleName: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.personalDetails?.lastName || ''}
                  onChange={e => setEditFormData({
                    ...editFormData,
                    personalDetails: { ...editFormData.personalDetails, lastName: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs uppercase"
                />
              </div>
            </div>

            {/* DOB & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={editFormData.personalDetails?.dob || ''}
                  onChange={e => setEditFormData({
                    ...editFormData,
                    personalDetails: { ...editFormData.personalDetails, dob: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Gender</label>
                <select
                  value={editFormData.personalDetails?.gender || 'Male'}
                  onChange={e => setEditFormData({
                    ...editFormData,
                    personalDetails: { ...editFormData.personalDetails, gender: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="Male" className="bg-white text-slate-900">Male</option>
                  <option value="Female" className="bg-white text-slate-900">Female</option>
                  <option value="Other" className="bg-white text-slate-900">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Marital Status</label>
                <select
                  value={editFormData.personalDetails?.maritalStatus || 'Single'}
                  onChange={e => setEditFormData({
                    ...editFormData,
                    personalDetails: { ...editFormData.personalDetails, maritalStatus: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="Single" className="bg-white text-slate-900">Single</option>
                  <option value="Married" className="bg-white text-slate-900">Married</option>
                </select>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Address</label>
                <input
                  type="text"
                  value={editFormData.contactDetails?.address || ''}
                  onChange={e => setEditFormData({
                    ...editFormData,
                    contactDetails: { ...editFormData.contactDetails, address: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={editFormData.contactDetails?.pincode || ''}
                    onChange={e => setEditFormData({
                      ...editFormData,
                      contactDetails: { ...editFormData.contactDetails, pincode: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={editFormData.contactDetails?.city || ''}
                    onChange={e => setEditFormData({
                      ...editFormData,
                      contactDetails: { ...editFormData.contactDetails, city: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    value={editFormData.contactDetails?.state || ''}
                    onChange={e => setEditFormData({
                      ...editFormData,
                      contactDetails: { ...editFormData.contactDetails, state: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mobile No</label>
                  <input
                    type="text"
                    required
                    value={editFormData.contactDetails?.mobile || ''}
                    onChange={e => setEditFormData({
                      ...editFormData,
                      contactDetails: { ...editFormData.contactDetails, mobile: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdits}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg flex items-center space-x-2"
              >
                <span>💾 Save Candidate Changes</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

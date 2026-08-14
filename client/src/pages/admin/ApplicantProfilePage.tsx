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
            <span>View Resume</span>
          </button>

          <button
            onClick={handlePrintResume}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Resume PDF</span>
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
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950">
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

      {/* TAB 2: DYNAMIC EXECUTIVE RESUME VIEW */}
      {activeTab === 'resume' && (
        <div className="resume-container p-8 rounded-3xl bg-white text-slate-900 shadow-2xl space-y-8 font-sans">
          
          {/* Executive Resume Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6">
            <div>
              <h1 className="text-3xl font-heading font-extrabold uppercase tracking-tight text-slate-900">
                {p.firstName} {p.middleName} {p.lastName}
              </h1>
              <p className="text-base font-bold text-amber-700 mt-1">
                {app.positionApplied}
              </p>
              <p className="text-xs text-slate-600 mt-2">
                ✉ {c.email} | 📞 {c.mobile} | 📍 {c.city}, {c.state} - {c.pincode}
              </p>
            </div>
            
            <div className="text-right">
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-300 ml-auto mb-2">
                <img src={p.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} alt="Photo" className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                ID: {app.applicationId} ({app.organizationId})
              </span>
            </div>
          </div>

          {/* Academic Credentials */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
              Educational Qualifications
            </h2>
            <div className="space-y-3 text-xs">
              {(app.educationDetails || []).map((edu, idx) => (
                <div key={idx} className="flex justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{edu.degree} – <span className="font-normal text-slate-700">{edu.institution} ({edu.boardUniversity})</span></p>
                    <p className="text-slate-600 text-[11px]">Specialization: {edu.majorSubjects} | Division: {edu.division}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{edu.percentage}</span>
                    <p className="text-slate-500 text-[11px]">{edu.yearOfPassing}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
              Professional Work Experience
            </h2>
            <div className="space-y-4 text-xs">
              {(app.experienceDetails || []).map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{exp.designation} at {exp.organization}</span>
                    <span>{exp.periodFrom} – {exp.periodTo}</span>
                  </div>
                  <p className="text-slate-700 text-[11px]">Gross Annual Salary: ₹{exp.grossAnnualSalary} | Reason for leaving: {exp.reasonForLeaving}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications & Languages */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Certifications
              </h2>
              <p className="text-slate-700">{app.certifications || 'None listed'}</p>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Languages Known
              </h2>
              <p className="text-slate-700">
                {(app.languagesKnown || []).map(l => l.language).join(', ')}
              </p>
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
                  <option value="RGU" className="bg-slate-900">RGU (University)</option>
                  <option value="RTC" className="bg-slate-900">RTC (Technical Campus)</option>
                  <option value="RPHARM" className="bg-slate-900">Rathinam Pharmacy</option>
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
                  <option value="Male" className="bg-slate-900">Male</option>
                  <option value="Female" className="bg-slate-900">Female</option>
                  <option value="Other" className="bg-slate-900">Other</option>
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
                  <option value="Single" className="bg-slate-900">Single</option>
                  <option value="Married" className="bg-slate-900">Married</option>
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

import React, { useState, useEffect } from 'react';
import { 
  Users, Building, FileText, CheckCircle2, Clock, XCircle, Filter, 
  Search, Plus, Download, Printer, Edit, Trash2, Eye, ChevronDown, 
  ChevronRight, RefreshCw, Shield, ArrowUpRight, FileSpreadsheet, 
  BarChart3, Sparkles, MapPin, Award, Layers, HelpCircle, CheckSquare, Square
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Application, OrganizationId, ApplicationStatus } from '../../types';

interface HRDashboardPageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const HRDashboardPage: React.FC<HRDashboardPageProps> = ({ onNavigate }) => {
  const { user, selectedOrgFilter, setSelectedOrgFilter, canAccessOrg } = useAuth();
  
  const [metrics, setMetrics] = useState<any>({
    totalApplications: 0,
    newApplications: 0,
    underReview: 0,
    shortlisted: 0,
    interviewScheduled: 0,
    selected: 0,
    rejected: 0,
    onHold: 0
  });
  const [orgBreakdown, setOrgBreakdown] = useState<any>({ RGU: 0, RTC: 0, RPHARM: 0 });
  const [statusDist, setStatusDist] = useState<any[]>([]);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [qualFilter, setQualFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Selection & Bulk State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ApplicationStatus>('SHORTLISTED');
  const [statusRemarks, setStatusRemarks] = useState('');

  // Single Item Action Modals
  const [activeItemForStatus, setActiveItemForStatus] = useState<Application | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Application | null>(null);
  const [showManualCreateModal, setShowManualCreateModal] = useState(false);

  // Manual Create Form State
  const [newApplicant, setNewApplicant] = useState({
    organizationId: 'RGU' as OrganizationId,
    positionApplied: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    qualification: 'Ph.D.'
  });

  const fetchAnalytics = async () => {
    try {
      const data = await api.getDashboardAnalytics(selectedOrgFilter);
      setMetrics(data.metrics || {});
      setOrgBreakdown(data.organizationBreakdown || {});
      setStatusDist(data.statusDistribution || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchApplicationsList = async () => {
    setLoading(true);
    try {
      const data = await api.getApplications({
        organizationId: selectedOrgFilter,
        status: statusFilter,
        search: searchQuery,
        qualification: qualFilter,
        dateFilter: dateFilter,
        page: currentPage,
        limit: 15
      });
      setApplications(data.applications || []);
      setTotalCount(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchApplicationsList();
  }, [selectedOrgFilter, statusFilter, searchQuery, qualFilter, dateFilter, currentPage]);

  // Checkbox Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.map(a => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Status Change Submission
  const handleSingleStatusChange = async () => {
    if (!activeItemForStatus) return;
    try {
      await api.updateStatus(activeItemForStatus.id, targetStatus, statusRemarks, user?.name || 'HR Admin');
      setActiveItemForStatus(null);
      setStatusRemarks('');
      fetchAnalytics();
      fetchApplicationsList();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Soft Delete Submission
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteApplication(itemToDelete.id, user?.name || 'HR Admin');
      setItemToDelete(null);
      fetchAnalytics();
      fetchApplicationsList();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  // Bulk Status Update
  const handleBulkStatusSubmit = async () => {
    if (selectedIds.length === 0) return;
    try {
      await api.bulkAction('STATUS_CHANGE', selectedIds, targetStatus, statusRemarks);
      setBulkStatusModalOpen(false);
      setSelectedIds([]);
      setStatusRemarks('');
      fetchAnalytics();
      fetchApplicationsList();
    } catch (err: any) {
      alert(err.message || 'Bulk status update failed');
    }
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Application ID', 'Name', 'Organization', 'Position', 'Email', 'Mobile', 'Status', 'Submitted Date'];
    const rows = applications.map(a => [
      a.applicationId,
      `"${a.personalDetails?.firstName || ''} ${a.personalDetails?.lastName || ''}"`,
      a.organizationId,
      `"${a.positionApplied}"`,
      a.contactDetails?.email || '',
      a.contactDetails?.mobile || '',
      a.status,
      new Date(a.submittedAt).toLocaleDateString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rathinam_HR_Applications_${selectedOrgFilter}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Manual Applicant Creation
  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitApplication({
        organizationId: newApplicant.organizationId,
        positionApplied: newApplicant.positionApplied,
        personalDetails: {
          firstName: newApplicant.firstName,
          lastName: newApplicant.lastName,
          dob: '1995-01-01',
          gender: 'Male',
          maritalStatus: 'Single',
          nationality: 'Indian',
          category: 'General'
        },
        contactDetails: {
          email: newApplicant.email,
          mobile: newApplicant.mobile,
          address: 'HR Manual Entry',
          pincode: '641021',
          city: 'Coimbatore',
          state: 'Tamil Nadu'
        },
        educationDetails: [
          {
            id: 'edu-m',
            degree: newApplicant.qualification,
            division: 'First Class',
            institution: 'Verified College',
            boardUniversity: 'State University',
            majorSubjects: 'Core Specialization',
            yearOfPassing: '2022',
            percentage: '80%'
          }
        ]
      });

      setShowManualCreateModal(false);
      fetchAnalytics();
      fetchApplicationsList();
    } catch (err: any) {
      alert(err.message || 'Failed to create applicant');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn pb-24">
      
      {/* TOP BAR: Title & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              HR Administration
            </span>
            <span className="text-xs text-slate-400 font-mono">Logged as: {user?.name}</span>
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-white mt-1">
            Recruitment Command Dashboard
          </h1>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowManualCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Application</span>
          </button>

          <button
            onClick={() => onNavigate('field-mapper')}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>PDF Field Mapper</span>
          </button>

          <button
            onClick={() => onNavigate('audit-logs')}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Audit Logs</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ORGANIZATION-WISE SCOPING TABS */}
      <div className="glass-panel p-2 rounded-2xl border border-slate-800 flex items-center space-x-2 overflow-x-auto bg-slate-950">
        {[
          { id: 'ALL' as OrganizationId, label: 'All Organizations', count: metrics.totalApplications, icon: Building },
          { id: 'RGU' as OrganizationId, label: 'RGU (University)', count: orgBreakdown.RGU, icon: Building },
          { id: 'RTC' as OrganizationId, label: 'RTC (Technical)', count: orgBreakdown.RTC, icon: Building },
          { id: 'RPHARM' as OrganizationId, label: 'Rathinam Pharmacy', count: orgBreakdown.RPHARM, icon: Building }
        ].map((tab) => {
          const isActive = selectedOrgFilter === tab.id;
          const isDisabled = !canAccessOrg(tab.id);
          return (
            <button
              key={tab.id}
              disabled={isDisabled}
              onClick={() => {
                setSelectedOrgFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isDisabled ? 'opacity-30 cursor-not-allowed text-slate-600' :
                isActive 
                  ? 'bg-amber-500 text-slate-950 shadow-lg font-extrabold scale-105' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-slate-950 text-amber-400 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* SUMMARY STAT METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'Total', value: metrics.totalApplications, color: 'text-white', bg: 'border-slate-800' },
          { label: 'New', value: metrics.newApplications, color: 'text-blue-400', bg: 'border-blue-500/30' },
          { label: 'Under Review', value: metrics.underReview, color: 'text-purple-400', bg: 'border-purple-500/30' },
          { label: 'Shortlisted', value: metrics.shortlisted, color: 'text-emerald-400', bg: 'border-emerald-500/30' },
          { label: 'Interview', value: metrics.interviewScheduled, color: 'text-amber-400', bg: 'border-amber-500/30' },
          { label: 'Selected', value: metrics.selected, color: 'text-cyan-400', bg: 'border-cyan-500/30' },
          { label: 'Rejected', value: metrics.rejected, color: 'text-rose-400', bg: 'border-rose-500/30' }
        ].map((card, idx) => (
          <div key={idx} className={`glass-panel p-4 rounded-2xl border ${card.bg} text-center space-y-1`}>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
            <p className={`text-2xl font-extrabold font-heading ${card.color}`}>{card.value || 0}</p>
          </div>
        ))}
      </div>

      {/* VISUAL CHARTS & PROGRESS GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Org Breakdown Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Building className="w-4 h-4 text-amber-400" />
            <span>Organization Breakdown</span>
          </h3>

          <div className="space-y-3 pt-2">
            {[
              { code: 'RGU', name: 'Rathinam Global (Deemed to be University)', count: orgBreakdown.RGU, color: 'bg-blue-500' },
              { code: 'RTC', name: 'Rathinam Technical Campus', count: orgBreakdown.RTC, color: 'bg-emerald-500' },
              { code: 'RPHARM', name: 'Rathinam Pharmacy', count: orgBreakdown.RPHARM, color: 'bg-amber-500' }
            ].map((org, i) => {
              const pct = metrics.totalApplications > 0 ? Math.round((org.count / metrics.totalApplications) * 100) : 0;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{org.name}</span>
                    <span className="font-bold text-amber-400">{org.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div className={`${org.color} h-2 transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Recruitment Funnel & Status Distribution</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {statusDist.map((st, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                  <span className="text-xs font-semibold text-slate-300 truncate">{st.label}</span>
                </div>
                <p className="text-xl font-bold font-heading text-white">{st.count}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* APPLICATION MANAGEMENT TABLE */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden space-y-4 p-6">
        
        {/* Table Controls (Search, Filters, Bulk) */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Name, ID, Phone, Position..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          {/* Filters & Bulk Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            
            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={e => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl glass-input text-xs font-semibold"
            >
              <option value="ALL" className="bg-slate-900">📅 All Dates</option>
              <option value="TODAY" className="bg-slate-900">📅 Submitted Today</option>
              <option value="LAST_7_DAYS" className="bg-slate-900">📅 Last 7 Days</option>
              <option value="THIS_MONTH" className="bg-slate-900">📅 This Month</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl glass-input text-xs font-semibold"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="NEW" className="bg-slate-900">NEW</option>
              <option value="UNDER REVIEW" className="bg-slate-900">UNDER REVIEW</option>
              <option value="SHORTLISTED" className="bg-slate-900">SHORTLISTED</option>
              <option value="INTERVIEW SCHEDULED" className="bg-slate-900">INTERVIEW SCHEDULED</option>
              <option value="SELECTED" className="bg-slate-900">SELECTED</option>
              <option value="ON HOLD" className="bg-slate-900">ON HOLD</option>
              <option value="REJECTED" className="bg-slate-900">REJECTED</option>
            </select>

            {/* Bulk Selection Actions */}
            {selectedIds.length > 0 && (
              <button
                onClick={() => setBulkStatusModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg animate-pulse"
              >
                Bulk Action ({selectedIds.length} Selected)
              </button>
            )}

          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 uppercase tracking-wider font-bold border-b border-slate-800">
                <th className="py-3 px-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                    {selectedIds.length === applications.length && applications.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Org</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Qualification</th>
                <th className="py-3 px-4">Experience</th>
                <th className="py-3 px-4">Submission Date & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs animate-pulse">
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400">
                    <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No applications found</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting search query or date filter.</p>
                  </td>
                </tr>
              ) : (
                applications.map(app => {
                  const isSelected = selectedIds.includes(app.id);
                  const firstEdu = app.educationDetails?.[0];
                  return (
                    <tr key={app.id} className={`hover:bg-slate-900/60 transition-colors ${isSelected ? 'bg-amber-500/10' : ''}`}>
                      <td className="py-3 px-4">
                        <button onClick={() => toggleSelectOne(app.id)} className="text-slate-400 hover:text-white">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {app.applicationId}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={app.personalDetails?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'} 
                            alt="Photo"
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <p className="font-bold text-slate-100">{app.personalDetails?.firstName} {app.personalDetails?.lastName}</p>
                            <p className="text-[10px] text-slate-400">{app.contactDetails?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {app.organizationId}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-200 font-medium">
                        {app.positionApplied}
                      </td>

                      <td className="py-3 px-4 text-slate-300 text-[11px]">
                        {firstEdu ? `${firstEdu.degree} (${firstEdu.yearOfPassing})` : 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-slate-300 text-[11px]">
                        {app.financialDetails?.totalExperienceYears || '0'} Yrs
                      </td>

                      <td className="py-3 px-4 text-slate-300 text-[11px] whitespace-nowrap">
                        <p className="font-bold text-slate-200">
                          {app.submissionDate || new Date(app.submittedAt).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {app.submissionTime || new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider ${
                          app.status === 'SELECTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          app.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          app.status === 'SHORTLISTED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {app.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          
                          {/* View Resume Profile */}
                          <button
                            onClick={() => onNavigate('applicant-profile', { id: app.id })}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="View Applicant Profile & Resume"
                          >
                            <Eye className="w-4 h-4 text-amber-400" />
                          </button>

                          {/* Quick Change Status */}
                          <button
                            onClick={() => {
                              setActiveItemForStatus(app);
                              setTargetStatus(app.status);
                            }}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400"
                            title="Change Status"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete Item */}
                          <button
                            onClick={() => setItemToDelete(app)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                            title="Delete Application"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
          <span>Showing {applications.length} of {totalCount} Applications</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-bold text-white px-2">Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={applications.length < 15}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* CHANGE STATUS MODAL */}
      {activeItemForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-amber-500/40 space-y-4">
            <h3 className="text-lg font-heading font-extrabold text-white">
              Change Application Status ({activeItemForStatus.applicationId})
            </h3>
            <p className="text-xs text-slate-400">
              Candidate: <strong>{activeItemForStatus.personalDetails?.firstName} {activeItemForStatus.personalDetails?.lastName}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">New Status</label>
              <select
                value={targetStatus}
                onChange={e => setTargetStatus(e.target.value as ApplicationStatus)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                <option value="NEW" className="bg-slate-900">NEW</option>
                <option value="UNDER REVIEW" className="bg-slate-900">UNDER REVIEW</option>
                <option value="SHORTLISTED" className="bg-slate-900">SHORTLISTED</option>
                <option value="INTERVIEW SCHEDULED" className="bg-slate-900">INTERVIEW SCHEDULED</option>
                <option value="SELECTED" className="bg-slate-900">SELECTED</option>
                <option value="ON HOLD" className="bg-slate-900">ON HOLD</option>
                <option value="REJECTED" className="bg-slate-900">REJECTED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">HR Remarks / Log Entry</label>
              <textarea
                rows={3}
                placeholder="Reason or interview schedule details..."
                value={statusRemarks}
                onChange={e => setStatusRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setActiveItemForStatus(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSingleStatusChange}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOFT DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-rose-500/40 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-heading font-extrabold text-white">
              Delete Application {itemToDelete.applicationId}?
            </h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete the application for <strong>{itemToDelete.personalDetails?.firstName} {itemToDelete.personalDetails?.lastName}</strong>?
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-extrabold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL CREATE APPLICANT MODAL */}
      {showManualCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleManualCreate} className="glass-panel p-6 rounded-3xl max-w-md w-full border border-amber-500/40 space-y-4">
            <h3 className="text-lg font-heading font-extrabold text-white">
              Manual HR Applicant Entry
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Organization</label>
              <select
                value={newApplicant.organizationId}
                onChange={e => setNewApplicant({ ...newApplicant, organizationId: e.target.value as OrganizationId })}
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
                placeholder="e.g. Professor - ECE"
                value={newApplicant.positionApplied}
                onChange={e => setNewApplicant({ ...newApplicant, positionApplied: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="First name"
                  value={newApplicant.firstName}
                  onChange={e => setNewApplicant({ ...newApplicant, firstName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="Last name"
                  value={newApplicant.lastName}
                  onChange={e => setNewApplicant({ ...newApplicant, lastName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="Email ID"
                  value={newApplicant.email}
                  onChange={e => setNewApplicant({ ...newApplicant, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mobile</label>
                <input
                  type="tel"
                  required
                  placeholder="Mobile No"
                  value={newApplicant.mobile}
                  onChange={e => setNewApplicant({ ...newApplicant, mobile: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowManualCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold"
              >
                Create Applicant
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BULK ACTION MODAL */}
      {bulkStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-amber-500/40 space-y-4">
            <h3 className="text-lg font-heading font-extrabold text-white">
              Bulk Update {selectedIds.length} Applications
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Set Target Status</label>
              <select
                value={targetStatus}
                onChange={e => setTargetStatus(e.target.value as ApplicationStatus)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                <option value="NEW" className="bg-slate-900">NEW</option>
                <option value="UNDER REVIEW" className="bg-slate-900">UNDER REVIEW</option>
                <option value="SHORTLISTED" className="bg-slate-900">SHORTLISTED</option>
                <option value="INTERVIEW SCHEDULED" className="bg-slate-900">INTERVIEW SCHEDULED</option>
                <option value="SELECTED" className="bg-slate-900">SELECTED</option>
                <option value="ON HOLD" className="bg-slate-900">ON HOLD</option>
                <option value="REJECTED" className="bg-slate-900">REJECTED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Bulk Remarks</label>
              <textarea
                rows={2}
                placeholder="Bulk status change remark..."
                value={statusRemarks}
                onChange={e => setStatusRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setBulkStatusModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkStatusSubmit}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold"
              >
                Apply Bulk Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

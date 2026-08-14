import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, GraduationCap, Briefcase, Award, Languages, 
  Users, FileText, CheckCircle2, ChevronRight, ChevronLeft, Plus, Trash2, 
  Upload, AlertCircle, Save, Sparkles, Building, Calendar, HelpCircle, Check, Eye
} from 'lucide-react';
import { OrganizationId, Application, EducationDetail, ExperienceDetail, LanguageKnown, FamilyDetail, ReferenceDetail, ReferredFriend, ApplicationDocument } from '../../types';
import { api } from '../../services/api';

interface ApplicationFormPageProps {
  organizationId: OrganizationId;
  onNavigate: (view: string, param?: any) => void;
}

const STORAGE_KEY = 'rathinam_hr_draft';

export const ApplicationFormPage: React.FC<ApplicationFormPageProps> = ({ organizationId, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [pincodeAutoDetected, setPincodeAutoDetected] = useState<string | null>(null);

  const handlePincodeChange = async (pinVal: string) => {
    setFormData(prev => ({
      ...prev,
      contactDetails: { ...prev.contactDetails!, pincode: pinVal }
    }));

    const clean = pinVal.trim();
    if (clean.length === 6 && /^\d{6}$/.test(clean)) {
      const LOCAL_MAP: Record<string, { city: string; state: string }> = {
        '642001': { city: 'Pollachi', state: 'Tamil Nadu' },
        '642002': { city: 'Pollachi', state: 'Tamil Nadu' },
        '642003': { city: 'Pollachi', state: 'Tamil Nadu' },
        '642004': { city: 'Pollachi', state: 'Tamil Nadu' },
        '642005': { city: 'Pollachi', state: 'Tamil Nadu' },
        '642006': { city: 'Pollachi', state: 'Tamil Nadu' },
        '642007': { city: 'Pollachi', state: 'Tamil Nadu' },
        '641001': { city: 'Coimbatore', state: 'Tamil Nadu' },
        '641002': { city: 'Coimbatore', state: 'Tamil Nadu' },
        '641003': { city: 'Coimbatore', state: 'Tamil Nadu' },
        '641004': { city: 'Coimbatore', state: 'Tamil Nadu' },
        '641005': { city: 'Coimbatore', state: 'Tamil Nadu' },
        '641012': { city: 'Coimbatore', state: 'Tamil Nadu' },
        '641014': { city: 'Coimbatore', state: 'Tamil Nadu' },
        '641018': { city: 'Coimbatore', state: 'Tamil Nadu' },
        '641021': { city: 'Coimbatore', state: 'Tamil Nadu' },
        '641035': { city: 'Coimbatore', state: 'Tamil Nadu' },
        '641601': { city: 'Tiruppur', state: 'Tamil Nadu' },
        '638001': { city: 'Erode', state: 'Tamil Nadu' },
        '636001': { city: 'Salem', state: 'Tamil Nadu' },
        '625001': { city: 'Madurai', state: 'Tamil Nadu' },
        '620001': { city: 'Tiruchirappalli', state: 'Tamil Nadu' },
        '600001': { city: 'Chennai', state: 'Tamil Nadu' },
        '643001': { city: 'Ooty', state: 'Tamil Nadu' },
        '560001': { city: 'Bengaluru', state: 'Karnataka' },
        '500001': { city: 'Hyderabad', state: 'Telangana' }
      };

      if (LOCAL_MAP[clean]) {
        const loc = LOCAL_MAP[clean];
        setFormData(prev => ({
          ...prev,
          contactDetails: { ...prev.contactDetails!, pincode: clean, city: loc.city, state: loc.state }
        }));
        setPincodeAutoDetected(`${loc.city}, ${loc.state}`);
        return;
      }

      // Fetch Online Postal API
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          const detectedCity = (po.Block && po.Block !== 'NA') ? po.Block : (po.District || po.Name);
          const detectedState = po.State;
          setFormData(prev => ({
            ...prev,
            contactDetails: { ...prev.contactDetails!, pincode: clean, city: detectedCity, state: detectedState }
          }));
          setPincodeAutoDetected(`${detectedCity}, ${detectedState}`);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setPincodeAutoDetected(null);
    }
  };

  // Form State initialized with PDF Candidate Personal Data Sheet defaults
  const [formData, setFormData] = useState<Partial<Application>>({
    organizationId,
    positionApplied: '',
    source: 'Career Portal',
    personalDetails: {
      firstName: '',
      middleName: '',
      lastName: '',
      fullName: '',
      dob: '',
      age: 0,
      gender: '',
      maritalStatus: '',
      nationality: 'Indian',
      category: 'General',
      photoUrl: ''
    },
    contactDetails: {
      address: '',
      pincode: '',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      email: '',
      phone: '',
      mobile: '',
      altMobile: ''
    },
    financialDetails: {
      currentCompany: '',
      noticePeriod: '30 Days',
      totalExperienceYears: '0',
      currentSalary: '',
      expectedSalary: ''
    },
    educationDetails: [
      {
        id: `edu-1`,
        degree: '',
        division: 'First Class',
        institution: '',
        boardUniversity: '',
        majorSubjects: '',
        yearOfPassing: '',
        percentage: ''
      }
    ],
    experienceDetails: [
      {
        id: `exp-1`,
        organization: '',
        designation: '',
        periodFrom: '',
        periodTo: '',
        grossAnnualSalary: '',
        ctcPerMonth: '',
        reasonForLeaving: '',
        careerBreak: 'None'
      }
    ],
    certifications: '',
    languagesKnown: [
      { language: 'English', read: true, write: true, speak: true, understand: true },
      { language: 'Tamil', read: true, write: true, speak: true, understand: true },
      { language: 'Hindi', read: false, write: false, speak: false, understand: false }
    ],
    familyDetails: [],
    additionalInfo: {
      workSundays: 'Yes',
      joiningTimeRequired: '30 Days',
      litigationDetails: 'None',
      rathinamAcquaintance: 'No',
      rathinamAcquaintanceDetails: ''
    },
    references: [
      { name: '', designation: '', mobile: '', phone: '' },
      { name: '', designation: '', mobile: '', phone: '' }
    ],
    referredFriends: [
      { name: '', relationship: '', mobile: '' }
    ],
    documents: [],
    declarationAccepted: false,
    declarationDate: new Date().toISOString().split('T')[0],
    declarationPlace: 'Coimbatore'
  });

  // Restore Draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formData) {
          setFormData(prev => ({ ...prev, ...parsed.formData, organizationId }));
          setLastSavedTime(parsed.savedAt);
        }
      } catch (e) {
        console.error('Error loading draft', e);
      }
    }
  }, [organizationId]);

  // Auto-Save Draft
  const saveDraft = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      formData,
      savedAt: now
    }));
    setLastSavedTime(now);
  };

  // Calculate Progress Percentage
  const calculateProgress = () => {
    let score = 0;
    const totalChecks = 10;
    if (formData.positionApplied) score++;
    if (formData.personalDetails?.firstName && formData.personalDetails?.dob) score++;
    if (formData.contactDetails?.email && formData.contactDetails?.mobile) score++;
    if (formData.educationDetails && formData.educationDetails.length > 0 && formData.educationDetails[0].degree) score++;
    if (formData.experienceDetails && formData.experienceDetails.length > 0) score++;
    if (formData.languagesKnown && formData.languagesKnown.length > 0) score++;
    if (formData.documents && formData.documents.length > 0) score++;
    if (formData.additionalInfo?.workSundays) score++;
    if (formData.references && formData.references[0]?.name) score++;
    if (formData.declarationAccepted) score++;

    return Math.min(100, Math.round((score / totalChecks) * 100));
  };

  // Handlers for Education Table
  const addEducationRow = () => {
    setFormData(prev => ({
      ...prev,
      educationDetails: [
        ...(prev.educationDetails || []),
        {
          id: `edu-${Date.now()}`,
          degree: '',
          division: 'First Class',
          institution: '',
          boardUniversity: '',
          majorSubjects: '',
          yearOfPassing: '',
          percentage: ''
        }
      ]
    }));
  };

  const removeEducationRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      educationDetails: (prev.educationDetails || []).filter((_, i) => i !== index)
    }));
  };

  // Handlers for Experience Table
  const addExperienceRow = () => {
    setFormData(prev => ({
      ...prev,
      experienceDetails: [
        ...(prev.experienceDetails || []),
        {
          id: `exp-${Date.now()}`,
          organization: '',
          designation: '',
          periodFrom: '',
          periodTo: '',
          grossAnnualSalary: '',
          ctcPerMonth: '',
          reasonForLeaving: '',
          careerBreak: 'None'
        }
      ]
    }));
  };

  const removeExperienceRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experienceDetails: (prev.experienceDetails || []).filter((_, i) => i !== index)
    }));
  };

  // Handler for File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setUploadingDoc(true);
    try {
      const res = await api.uploadFile(file, docType);
      const uploadedFile: ApplicationDocument = {
        id: res.file.id,
        name: res.file.name,
        type: docType,
        size: res.file.size,
        url: res.file.url
      };

      setFormData(prev => ({
        ...prev,
        documents: [...(prev.documents || []), uploadedFile]
      }));

      // If photo, update photoUrl
      if (docType === 'Photograph') {
        setFormData(prev => ({
          ...prev,
          personalDetails: { ...prev.personalDetails!, photoUrl: res.file.url }
        }));
      }
    } catch (err: any) {
      alert(err.message || 'File upload failed');
    } finally {
      setUploadingDoc(false);
    }
  };

  const removeDocument = (docId: string) => {
    setFormData(prev => ({
      ...prev,
      documents: (prev.documents || []).filter(d => d.id !== docId)
    }));
  };

  // Step Validation & Navigation
  const validateCurrentStep = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!formData.positionApplied) {
        setErrorMsg('Please select or type the Position Applied For.');
        return false;
      }
      if (!formData.personalDetails?.firstName || !formData.personalDetails?.lastName) {
        setErrorMsg('Please enter candidate First Name and Last Name.');
        return false;
      }
      if (!formData.personalDetails?.dob) {
        setErrorMsg('Please select Date of Birth.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.contactDetails?.email || !formData.contactDetails?.mobile) {
        setErrorMsg('Valid Email address and Mobile Number are required.');
        return false;
      }
      if (!formData.contactDetails?.address) {
        setErrorMsg('Please provide Contact Address.');
        return false;
      }
    } else if (currentStep === 7) {
      if (!formData.declarationAccepted) {
        setErrorMsg('You must accept the solemn declaration terms before submitting.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      saveDraft();
      setCurrentStep(prev => Math.min(8, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Form Submission Handler
  const handleFinalSubmit = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setErrorMsg(null);

    // Compute Full Name
    const p = (formData.personalDetails || {}) as any;
    const fullName = `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.replace(/\s+/g, ' ').trim().toUpperCase();

    const payload = {
      ...formData,
      organizationId,
      personalDetails: { ...p, fullName }
    };

    try {
      const res = await api.submitApplication(payload);
      // Clear draft
      localStorage.removeItem(STORAGE_KEY);
      // Navigate to success screen
      onNavigate('success', { applicationId: res.applicationId, application: res.application });
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Personal Details' },
    { num: 2, label: 'Contact Info' },
    { num: 3, label: 'Education' },
    { num: 4, label: 'Work Experience' },
    { num: 5, label: 'Skills & Family' },
    { num: 6, label: 'References' },
    { num: 7, label: 'Documents' },
    { num: 8, label: 'Review & Submit' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn pb-24">
      
      {/* Top Header Card - Clean White & Sky Blue Theme */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-sky-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md shadow-sky-500/5">
        <div>
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-sky-100 text-sky-800 border border-sky-300">
              {organizationId} Candidate Portal
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              Doc Ref: RGI/3HR/3F6R3 001
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mt-3">
            Online Employment Application Form
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-medium leading-relaxed">
            Please fill in all details accurately as per your official academic and experience credentials.
          </p>
        </div>

        {/* Draft Auto-Save Bar */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={saveDraft}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4 text-white" />
            <span>Save Draft</span>
          </button>
          {lastSavedTime && (
            <span className="text-xs text-slate-500 font-medium italic whitespace-nowrap">
              Saved at {lastSavedTime}
            </span>
          )}
        </div>
      </div>

      {/* STEPPER PROGRESS BAR */}
      <div className="glass-panel p-4 rounded-2xl border border-sky-200 mb-8 overflow-x-auto shadow-sm">
        <div className="flex items-center justify-between min-w-[650px]">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <div 
                key={step.num} 
                onClick={() => {
                  if (step.num < currentStep) setCurrentStep(step.num);
                }}
                className={`flex flex-col items-center cursor-pointer transition-all ${
                  isCurrent ? 'text-sky-800 font-extrabold' : isCompleted ? 'text-emerald-700 font-bold' : 'text-slate-600 font-medium'
                }`}
              >
                <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center border transition-all mb-1.5 ${
                  isCurrent 
                    ? 'bg-sky-600 text-white border-sky-600 ring-4 ring-sky-500/20 shadow-md shadow-sky-500/25' 
                    : isCompleted 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
                    : 'bg-slate-100 border-slate-300 text-slate-700 font-bold'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : step.num}
                </div>
                <span className="text-[11px] tracking-tight text-center truncate max-w-[80px]">
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress % Bar */}
        <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>Form Progress</span>
          <span className="font-bold text-sky-700">{calculateProgress()}% Completed</span>
        </div>
        <div className="w-full bg-sky-100 rounded-full h-2 mt-1 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-sky-500 to-blue-600 h-2 transition-all duration-500" 
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>

      {/* Error Callout */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* FORM STEP CONTENT */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-sky-200 shadow-lg shadow-sky-500/5 min-h-[400px]">
        
        {/* STEP 1: PERSONAL DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-heading font-extrabold text-slate-900 flex items-center space-x-2 pb-3 border-b border-sky-100">
              <User className="w-5 h-5 text-sky-600" />
              <span>Step 1: Position & Candidate Personal Details</span>
            </h3>

            {/* Position Applied For & Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Position Applied For <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Assistant Professor - CSE / HR Executive"
                  value={formData.positionApplied || ''}
                  onChange={e => setFormData({ ...formData, positionApplied: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Source of Application
                </label>
                <select
                  value={formData.source || 'Career Portal'}
                  onChange={e => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                >
                  <option value="Career Portal" className="bg-white text-slate-900">Career Portal / Website</option>
                  <option value="LinkedIn" className="bg-white text-slate-900">LinkedIn</option>
                  <option value="Naukri" className="bg-white text-slate-900">Naukri.com</option>
                  <option value="Paper Advertisement" className="bg-white text-slate-900">Paper Advertisement</option>
                  <option value="Employee Referral" className="bg-white text-slate-900">Employee Referral</option>
                </select>
              </div>
            </div>

            {/* Name Fields (First, Middle, Last) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  First Name (Block Letters) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="FIRST NAME"
                  value={formData.personalDetails?.firstName || ''}
                  onChange={e => setFormData({
                    ...formData,
                    personalDetails: { ...formData.personalDetails!, firstName: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  placeholder="MIDDLE NAME"
                  value={formData.personalDetails?.middleName || ''}
                  onChange={e => setFormData({
                    ...formData,
                    personalDetails: { ...formData.personalDetails!, middleName: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Last Name / Initial <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="LAST NAME"
                  value={formData.personalDetails?.lastName || ''}
                  onChange={e => setFormData({
                    ...formData,
                    personalDetails: { ...formData.personalDetails!, lastName: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm uppercase"
                />
              </div>
            </div>

            {/* DOB, Age, Gender, Marital Status */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.personalDetails?.dob || ''}
                  onChange={e => {
                    const dob = e.target.value;
                    const birthYear = new Date(dob).getFullYear();
                    const currentYear = new Date().getFullYear();
                    const age = currentYear - birthYear;
                    setFormData({
                      ...formData,
                      personalDetails: { ...formData.personalDetails!, dob, age }
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  readOnly
                  value={formData.personalDetails?.age || ''}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-sky-50/60 text-slate-700 font-semibold border-sky-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.personalDetails?.gender || ''}
                  onChange={e => setFormData({
                    ...formData,
                    personalDetails: { ...formData.personalDetails!, gender: e.target.value as any }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                >
                  <option value="" className="bg-white text-slate-900">-- Select Gender --</option>
                  <option value="Male" className="bg-white text-slate-900">Male</option>
                  <option value="Female" className="bg-white text-slate-900">Female</option>
                  <option value="Other" className="bg-white text-slate-900">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Marital Status
                </label>
                <select
                  value={formData.personalDetails?.maritalStatus || ''}
                  onChange={e => setFormData({
                    ...formData,
                    personalDetails: { ...formData.personalDetails!, maritalStatus: e.target.value as any }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                >
                  <option value="" className="bg-white text-slate-900">-- Select Status --</option>
                  <option value="Single" className="bg-white text-slate-900">Single</option>
                  <option value="Married" className="bg-white text-slate-900">Married</option>
                  <option value="Other" className="bg-white text-slate-900">Other</option>
                </select>
              </div>
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nationality
              </label>
              <input
                type="text"
                value={formData.personalDetails?.nationality || 'Indian'}
                onChange={e => setFormData({
                  ...formData,
                  personalDetails: { ...formData.personalDetails!, nationality: e.target.value }
                })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

          </div>
        )}

        {/* STEP 2: CONTACT DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-heading font-extrabold text-slate-900 flex items-center space-x-2 pb-3 border-b border-sky-100">
              <Mail className="w-5 h-5 text-sky-600" />
              <span>Step 2: Contact Address & Communication</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Contact Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Door No, Street Name, Landmark, City/Town..."
                value={formData.contactDetails?.address || ''}
                onChange={e => setFormData({
                  ...formData,
                  contactDetails: { ...formData.contactDetails!, address: e.target.value }
                })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Pincode <span className="text-rose-500">*</span></span>
                  {pincodeAutoDetected && (
                    <span className="text-[10px] text-emerald-600 font-extrabold animate-pulse">
                      ✓ {pincodeAutoDetected}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 642001"
                  value={formData.contactDetails?.pincode || ''}
                  onChange={e => handlePincodeChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-mono tracking-wider"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.contactDetails?.city || 'Coimbatore'}
                  onChange={e => setFormData({
                    ...formData,
                    contactDetails: { ...formData.contactDetails!, city: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.contactDetails?.state || 'Tamil Nadu'}
                  onChange={e => setFormData({
                    ...formData,
                    contactDetails: { ...formData.contactDetails!, state: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="candidate@gmail.com"
                  value={formData.contactDetails?.email || ''}
                  onChange={e => setFormData({
                    ...formData,
                    contactDetails: { ...formData.contactDetails!, email: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile"
                  value={formData.contactDetails?.mobile || ''}
                  onChange={e => setFormData({
                    ...formData,
                    contactDetails: { ...formData.contactDetails!, mobile: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alternate Phone / Landline
                </label>
                <input
                  type="tel"
                  placeholder="Optional landline or phone"
                  value={formData.contactDetails?.phone || ''}
                  onChange={e => setFormData({
                    ...formData,
                    contactDetails: { ...formData.contactDetails!, phone: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EDUCATIONAL QUALIFICATIONS */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <h3 className="text-lg font-heading font-extrabold text-slate-900 flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-sky-600" />
                <span>Step 3: Educational Qualifications (From Latest)</span>
              </h3>
              <button
                onClick={addEducationRow}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Qualification</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              List your academic degrees starting from your highest / latest qualification.
            </p>

            <div className="space-y-6">
              {(formData.educationDetails || []).map((edu, idx) => (
                <div key={edu.id} className="p-4 rounded-xl bg-sky-50/50 border border-sky-200/80 relative space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-sky-700 uppercase tracking-wider">
                      Entry #{idx + 1}
                    </span>
                    {formData.educationDetails!.length > 1 && (
                      <button
                        onClick={() => removeEducationRow(idx)}
                        className="text-rose-600 hover:text-rose-700 p-1 text-xs flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Degree / Qualification
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ph.D. / M.Tech / B.E."
                        value={edu.degree}
                        onChange={e => {
                          const updated = [...formData.educationDetails!];
                          updated[idx].degree = e.target.value;
                          setFormData({ ...formData, educationDetails: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Division / Class
                      </label>
                      <select
                        value={edu.division}
                        onChange={e => {
                          const updated = [...formData.educationDetails!];
                          updated[idx].division = e.target.value;
                          setFormData({ ...formData, educationDetails: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      >
                        <option value="First Class with Distinction" className="bg-white text-slate-900">First Class with Distinction</option>
                        <option value="First Class" className="bg-white text-slate-900">First Class</option>
                        <option value="Second Class" className="bg-white text-slate-900">Second Class</option>
                        <option value="Pass Class" className="bg-white text-slate-900">Pass Class</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Year of Passing
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2022"
                        value={edu.yearOfPassing}
                        onChange={e => {
                          const updated = [...formData.educationDetails!];
                          updated[idx].yearOfPassing = e.target.value;
                          setFormData({ ...formData, educationDetails: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        College Name
                      </label>
                      <input
                        type="text"
                        placeholder="Institution / College name"
                        value={edu.institution}
                        onChange={e => {
                          const updated = [...formData.educationDetails!];
                          updated[idx].institution = e.target.value;
                          setFormData({ ...formData, educationDetails: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Board / University
                      </label>
                      <input
                        type="text"
                        placeholder="Board or University"
                        value={edu.boardUniversity}
                        onChange={e => {
                          const updated = [...formData.educationDetails!];
                          updated[idx].boardUniversity = e.target.value;
                          setFormData({ ...formData, educationDetails: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Major Subjects / Credit Points
                      </label>
                      <input
                        type="text"
                        placeholder="Specialization / Key Subjects"
                        value={edu.majorSubjects}
                        onChange={e => {
                          const updated = [...formData.educationDetails!];
                          updated[idx].majorSubjects = e.target.value;
                          setFormData({ ...formData, educationDetails: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        % of Marks / CGPA
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 84.5% or 8.8 CGPA"
                        value={edu.percentage}
                        onChange={e => {
                          const updated = [...formData.educationDetails!];
                          updated[idx].percentage = e.target.value;
                          setFormData({ ...formData, educationDetails: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: WORK EXPERIENCE */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <h3 className="text-lg font-heading font-extrabold text-slate-900 flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-sky-600" />
                <span>Step 4: Professional Experience (Starting from Present)</span>
              </h3>
              <button
                onClick={addExperienceRow}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Experience</span>
              </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-sky-50/70 border border-sky-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Total Experience (Years)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5.5"
                  value={formData.financialDetails?.totalExperienceYears || ''}
                  onChange={e => setFormData({
                    ...formData,
                    financialDetails: { ...formData.financialDetails!, totalExperienceYears: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Notice Period (Days)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 30 Days / Immediate"
                  value={formData.financialDetails?.noticePeriod || '30 Days'}
                  onChange={e => setFormData({
                    ...formData,
                    financialDetails: { ...formData.financialDetails!, noticePeriod: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Current Gross PA (₹)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6,50,000"
                  value={formData.financialDetails?.currentSalary || ''}
                  onChange={e => setFormData({
                    ...formData,
                    financialDetails: { ...formData.financialDetails!, currentSalary: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Expected Gross PA (₹)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8,00,000"
                  value={formData.financialDetails?.expectedSalary || ''}
                  onChange={e => setFormData({
                    ...formData,
                    financialDetails: { ...formData.financialDetails!, expectedSalary: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>
            </div>

            {/* Experience Table Entries */}
            <div className="space-y-6">
              {(formData.experienceDetails || []).map((exp, idx) => (
                <div key={exp.id} className="p-4 rounded-xl bg-sky-50/50 border border-sky-200/80 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-sky-700 uppercase tracking-wider">
                      Work Entry #{idx + 1}
                    </span>
                    {formData.experienceDetails!.length > 1 && (
                      <button
                        onClick={() => removeExperienceRow(idx)}
                        className="text-rose-600 hover:text-rose-700 p-1 text-xs flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Name of Organization
                      </label>
                      <input
                        type="text"
                        placeholder="Organization name"
                        value={exp.organization}
                        onChange={e => {
                          const updated = [...formData.experienceDetails!];
                          updated[idx].organization = e.target.value;
                          setFormData({ ...formData, experienceDetails: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        placeholder="Designation / Role"
                        value={exp.designation}
                        onChange={e => {
                          const updated = [...formData.experienceDetails!];
                          updated[idx].designation = e.target.value;
                          setFormData({ ...formData, experienceDetails: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={exp.periodFrom}
                        onChange={e => {
                          const updated = [...formData.experienceDetails!];
                          updated[idx].periodFrom = e.target.value;
                          setFormData({ ...formData, experienceDetails: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        To Date (Or 'Present')
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Present / YYYY-MM-DD"
                        value={exp.periodTo}
                        onChange={e => {
                          const updated = [...formData.experienceDetails!];
                          updated[idx].periodTo = e.target.value;
                          setFormData({ ...formData, experienceDetails: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Gross Annual Salary (₹)
                      </label>
                      <input
                        type="text"
                        placeholder="Annual CTC"
                        value={exp.grossAnnualSalary}
                        onChange={e => {
                          const updated = [...formData.experienceDetails!];
                          updated[idx].grossAnnualSalary = e.target.value;
                          setFormData({ ...formData, experienceDetails: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Reason for Leaving
                      </label>
                      <input
                        type="text"
                        placeholder="Reason"
                        value={exp.reasonForLeaving}
                        onChange={e => {
                          const updated = [...formData.experienceDetails!];
                          updated[idx].reasonForLeaving = e.target.value;
                          setFormData({ ...formData, experienceDetails: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: SKILLS & LANGUAGES KNOWN */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-heading font-extrabold text-slate-900 flex items-center space-x-2 pb-3 border-b border-sky-100">
              <Award className="w-5 h-5 text-sky-600" />
              <span>Step 5: Certifications & Languages Known Grid</span>
            </h3>

            {/* Certifications text area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Certifications (if any)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Oracle Certified, AWS Solutions Architect, ROS Master, Cisco CCNA..."
                value={formData.certifications || ''}
                onChange={e => setFormData({ ...formData, certifications: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            {/* Languages Known Grid */}
            <div>
              <h4 className="text-sm font-bold text-sky-700 mb-3 flex items-center space-x-2">
                <Languages className="w-4 h-4" />
                <span>Languages Known (Read, Write, Speak, Understand)</span>
              </h4>

              <div className="overflow-x-auto rounded-xl border border-sky-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-sky-100/70 border-b border-sky-200 text-sky-900 font-bold">
                      <th className="py-2.5 px-3">S.No</th>
                      <th className="py-2.5 px-3">Language</th>
                      <th className="py-2.5 px-3 text-center">Read (R)</th>
                      <th className="py-2.5 px-3 text-center">Write (W)</th>
                      <th className="py-2.5 px-3 text-center">Speak (S)</th>
                      <th className="py-2.5 px-3 text-center">Understand (U)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100">
                    {(formData.languagesKnown || []).map((lang, idx) => (
                      <tr key={idx} className="hover:bg-sky-50/60">
                        <td className="py-2.5 px-3 text-slate-500 font-medium">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{lang.language}</td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={lang.read}
                            onChange={e => {
                              const updated = [...formData.languagesKnown!];
                              updated[idx].read = e.target.checked;
                              setFormData({ ...formData, languagesKnown: updated });
                            }}
                            className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={lang.write}
                            onChange={e => {
                              const updated = [...formData.languagesKnown!];
                              updated[idx].write = e.target.checked;
                              setFormData({ ...formData, languagesKnown: updated });
                            }}
                            className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={lang.speak}
                            onChange={e => {
                              const updated = [...formData.languagesKnown!];
                              updated[idx].speak = e.target.checked;
                              setFormData({ ...formData, languagesKnown: updated });
                            }}
                            className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={lang.understand}
                            onChange={e => {
                              const updated = [...formData.languagesKnown!];
                              updated[idx].understand = e.target.checked;
                              setFormData({ ...formData, languagesKnown: updated });
                            }}
                            className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* STEP 6: REFERENCES & DECLARATIONS */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-heading font-extrabold text-slate-900 flex items-center space-x-2 pb-3 border-b border-sky-100">
              <Users className="w-5 h-5 text-sky-600" />
              <span>Step 6: References & Questionnaire</span>
            </h3>

            {/* Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-sky-50/70 border border-sky-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Are you willing to work on Sundays?
                </label>
                <select
                  value={formData.additionalInfo?.workSundays || 'Yes'}
                  onChange={e => setFormData({
                    ...formData,
                    additionalInfo: { ...formData.additionalInfo!, workSundays: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                >
                  <option value="Yes" className="bg-white text-slate-900">Yes</option>
                  <option value="No" className="bg-white text-slate-900">No</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Joining Time Required
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15 Days / Immediate"
                  value={formData.additionalInfo?.joiningTimeRequired || '30 Days'}
                  onChange={e => setFormData({
                    ...formData,
                    additionalInfo: { ...formData.additionalInfo!, joiningTimeRequired: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>
            </div>

            {/* Litigation Details */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Is there any litigation pending against you (filed by relative / otherwise)? If Yes, provide details.
              </label>
              <input
                type="text"
                placeholder="Type 'None' or details"
                value={formData.additionalInfo?.litigationDetails || 'None'}
                onChange={e => setFormData({
                  ...formData,
                  additionalInfo: { ...formData.additionalInfo!, litigationDetails: e.target.value }
                })}
                className="w-full px-4 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            {/* References */}
            <div>
              <h4 className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-3">
                Current Organization References (2 Required)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(formData.references || []).map((ref, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-200/80 space-y-2 shadow-sm">
                    <p className="text-[11px] font-bold text-sky-800">Reference #{idx + 1}</p>
                    <input
                      type="text"
                      placeholder="Name"
                      value={ref.name}
                      onChange={e => {
                        const updated = [...formData.references!];
                        updated[idx].name = e.target.value;
                        setFormData({ ...formData, references: updated });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg glass-input text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Designation"
                      value={ref.designation}
                      onChange={e => {
                        const updated = [...formData.references!];
                        updated[idx].designation = e.target.value;
                        setFormData({ ...formData, references: updated });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg glass-input text-xs"
                    />
                    <input
                      type="tel"
                      placeholder="Mobile / Phone"
                      value={ref.mobile}
                      onChange={e => {
                        const updated = [...formData.references!];
                        updated[idx].mobile = e.target.value;
                        setFormData({ ...formData, references: updated });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg glass-input text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* STEP 7: DOCUMENTS UPLOAD */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-heading font-extrabold text-slate-900 flex items-center space-x-2 pb-3 border-b border-sky-100">
              <Upload className="w-5 h-5 text-sky-600" />
              <span>Step 7: Upload Supporting Documents</span>
            </h3>

            <p className="text-xs text-slate-500">
              Upload your Resume/CV, Photograph, and Educational Certificates (PDF / Image, Max 10MB).
            </p>

            {/* Upload Buttons Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Resume Upload */}
              <div className="p-4 rounded-xl bg-sky-50/50 text-center border-dashed border-2 border-sky-300 hover:border-sky-500 transition-colors shadow-sm">
                <FileText className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">Resume / CV</p>
                <p className="text-[10px] text-slate-500 mb-3">PDF or DOCX</p>
                <label className="px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-xs cursor-pointer hover:bg-sky-500 inline-block shadow-sm">
                  <span>Browse CV</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={e => handleFileUpload(e, 'Resume')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Photo Upload */}
              <div className="p-4 rounded-xl bg-sky-50/50 text-center border-dashed border-2 border-sky-300 hover:border-sky-500 transition-colors shadow-sm">
                <User className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">Passport Photo</p>
                <p className="text-[10px] text-slate-500 mb-3">JPG or PNG</p>
                <label className="px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-xs cursor-pointer hover:bg-sky-500 inline-block shadow-sm">
                  <span>Browse Photo</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={e => handleFileUpload(e, 'Photograph')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Certificate Upload */}
              <div className="p-4 rounded-xl bg-sky-50/50 text-center border-dashed border-2 border-sky-300 hover:border-sky-500 transition-colors shadow-sm">
                <Award className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">Certificate / ID Proof</p>
                <p className="text-[10px] text-slate-500 mb-3">PDF or Image</p>
                <label className="px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-xs cursor-pointer hover:bg-sky-500 inline-block shadow-sm">
                  <span>Browse Doc</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => handleFileUpload(e, 'Certificate')}
                    className="hidden"
                  />
                </label>
              </div>

            </div>

            {uploadingDoc && (
              <div className="text-center py-2 text-xs text-sky-700 font-semibold animate-pulse">
                Uploading file to Rathinam HR server...
              </div>
            )}

            {/* Document List */}
            <div className="space-y-2 mt-6">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Uploaded Documents ({(formData.documents || []).length})
              </h4>
              {(formData.documents || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No files uploaded yet.</p>
              ) : (
                (formData.documents || []).map(doc => (
                  <div key={doc.id} className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-sky-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{doc.name}</p>
                        <p className="text-[10px] text-slate-500">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="p-1 text-rose-600 hover:bg-rose-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Solemn Declaration Checkbox */}
            <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 mt-8 space-y-3 shadow-sm">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.declarationAccepted}
                  onChange={e => setFormData({ ...formData, declarationAccepted: e.target.checked })}
                  className="w-5 h-5 accent-sky-600 rounded mt-0.5"
                />
                <span className="text-xs text-slate-700 leading-relaxed font-medium">
                  <strong>Solemn Declaration:</strong> I hereby solemnly declare that all details furnished above are true, complete and correct to the best of my knowledge and belief. I understand that any misrepresentation of facts will render my candidature liable to immediate disqualification.
                </span>
              </label>
            </div>

          </div>
        )}

        {/* STEP 8: REVIEW BEFORE SUBMISSION */}
        {currentStep === 8 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-heading font-extrabold text-slate-900 flex items-center space-x-2 pb-3 border-b border-sky-100">
              <Eye className="w-5 h-5 text-sky-600" />
              <span>Step 8: Review Candidate Profile Before Final Submit</span>
            </h3>

            <div className="p-6 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-6 shadow-sm">
              
              {/* Summary Card Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-sky-200 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-sky-400 flex items-center justify-center overflow-hidden shadow-sm">
                    {formData.personalDetails?.photoUrl ? (
                      <img src={formData.personalDetails.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-sky-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-heading font-bold text-slate-900">
                      {formData.personalDetails?.firstName} {formData.personalDetails?.middleName} {formData.personalDetails?.lastName}
                    </h4>
                    <p className="text-xs text-sky-700 font-semibold mt-0.5">
                      {formData.positionApplied} • ({organizationId})
                    </p>
                    <p className="text-xs text-slate-500">{formData.contactDetails?.email} • {formData.contactDetails?.mobile}</p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-full">
                  Ready to Submit
                </span>
              </div>

              {/* Grid Summaries */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <h5 className="font-bold text-sky-800 uppercase tracking-wider mb-2">Personal & Contact</h5>
                  <p className="text-slate-700"><strong>DOB & Age:</strong> {formData.personalDetails?.dob} ({formData.personalDetails?.age} Yrs)</p>
                  <p className="text-slate-700"><strong>Gender / Status:</strong> {formData.personalDetails?.gender} / {formData.personalDetails?.maritalStatus}</p>
                  <p className="text-slate-700"><strong>Address:</strong> {formData.contactDetails?.address}, {formData.contactDetails?.pincode}</p>
                </div>

                <div>
                  <h5 className="font-bold text-sky-800 uppercase tracking-wider mb-2">Financial & Notice</h5>
                  <p className="text-slate-700"><strong>Total Experience:</strong> {formData.financialDetails?.totalExperienceYears} Years</p>
                  <p className="text-slate-700"><strong>Notice Period:</strong> {formData.financialDetails?.noticePeriod}</p>
                  <p className="text-slate-700"><strong>Expected Salary:</strong> ₹{formData.financialDetails?.expectedSalary} PA</p>
                </div>
              </div>

              {/* Education Summary */}
              <div>
                <h5 className="font-bold text-sky-800 uppercase tracking-wider mb-2">Qualifications ({(formData.educationDetails || []).length})</h5>
                <ul className="space-y-1 text-xs text-slate-700">
                  {(formData.educationDetails || []).map((e, idx) => (
                    <li key={idx} className="p-2.5 rounded-lg bg-white border border-sky-200">
                      <strong>{e.degree}</strong> – {e.institution} ({e.yearOfPassing}) • Marks: {e.percentage}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Documents Summary */}
              <div>
                <h5 className="font-bold text-sky-800 uppercase tracking-wider mb-2">Uploaded Attachments ({(formData.documents || []).length})</h5>
                <div className="flex flex-wrap gap-2">
                  {(formData.documents || []).map((d, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 text-[11px] text-slate-700 font-medium">
                      📄 {d.type}: {d.name}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* FOOTER BUTTONS */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            currentStep === 1 
              ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200' 
              : 'bg-white hover:bg-sky-50 text-slate-700 border border-sky-200 shadow-sm'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {currentStep < 8 ? (
          <button
            onClick={handleNextStep}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
          >
            <span>Next Step</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/20 transition-all hover:scale-105"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Confirm & Submit Application</span>
          </button>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full border border-sky-300 space-y-4 text-center bg-white shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-sky-100 border border-sky-300 text-sky-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-heading font-extrabold text-slate-900">
              Submit Application to {organizationId}?
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to submit your application for <strong>{formData.positionApplied}</strong>? A unique Application ID will be generated immediately for tracking.
            </p>

            <div className="pt-4 flex items-center justify-center space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold shadow-lg shadow-sky-500/25"
              >
                {loading ? 'Submitting...' : 'Yes, Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

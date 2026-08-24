import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, GraduationCap, Briefcase, Award, Languages, 
  Users, FileText, CheckCircle2, ChevronRight, ChevronLeft, Plus, Trash2, X, Edit,
  Upload, AlertCircle, Save, Sparkles, Building, Calendar as CalendarIcon, HelpCircle, Check, Eye, Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OrganizationId, Application, EducationDetail, ExperienceDetail, LanguageKnown, FamilyDetail, ReferenceDetail, ReferredFriend, ApplicationDocument } from '../../types';
import { api } from '../../services/api';
import { CalendarDialogModal } from '../../components/CalendarDialogModal';

interface ApplicationFormPageProps {
  organizationId: OrganizationId;
  onNavigate: (view: string, param?: any) => void;
}

const STORAGE_KEY = 'rathinam_hr_draft';

const AVAILABLE_LANGUAGES = [
  'English',
  'Tamil',
  'Hindi',
  'Malayalam',
  'Telugu',
  'Kannada',
  'French',
  'German',
  'Spanish',
  'Sanskrit',
  'Arabic',
  'Japanese',
  'Other'
];

export const ApplicationFormPage: React.FC<ApplicationFormPageProps> = ({ organizationId, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [pincodeAutoDetected, setPincodeAutoDetected] = useState<string | null>(null);

  // Calendar Dialog Date Picker Modal State
  const [datePickerModal, setDatePickerModal] = useState<{
    isOpen: boolean;
    title: string;
    initialDate?: string;
    allowPresent?: boolean;
    onSelectDate: (selectedDate: string) => void;
  } | null>(null);

  // Family Details Modal State & Handlers
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [editingFamilyIndex, setEditingFamilyIndex] = useState<number | null>(null);
  const [familyForm, setFamilyForm] = useState<FamilyDetail>({
    id: '',
    name: '',
    age: '',
    relationship: 'Father',
    occupation: '',
    dependent: 'Dependent',
    contactNo: ''
  });

  const openAddFamilyModal = () => {
    setFamilyForm({
      id: `fam-${Date.now()}`,
      name: '',
      age: '',
      relationship: 'Father',
      occupation: '',
      dependent: 'Dependent',
      contactNo: ''
    });
    setEditingFamilyIndex(null);
    setShowFamilyModal(true);
  };

  const openEditFamilyModal = (index: number) => {
    const item = formData.familyDetails[index];
    setFamilyForm({ ...item });
    setEditingFamilyIndex(index);
    setShowFamilyModal(true);
  };

  const saveFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyForm.name.trim()) {
      alert('Please enter family member name.');
      return;
    }

    setFormData(prev => {
      const updated = [...(prev.familyDetails || [])];
      if (editingFamilyIndex !== null) {
        updated[editingFamilyIndex] = familyForm;
      } else {
        updated.push({
          ...familyForm,
          id: familyForm.id || `fam-${Date.now()}`
        });
      }
      return { ...prev, familyDetails: updated };
    });

    setShowFamilyModal(false);
  };

  const removeFamilyMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      familyDetails: (prev.familyDetails || []).filter((_, i) => i !== index)
    }));
  };

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
      { language: 'Tamil', read: true, write: true, speak: true, understand: true }
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
          // Filter out any unticked language rows from restored draft
          const restoredLangs = (parsed.formData.languagesKnown || []).filter(
            (l: any) => l.language && (l.read || l.write || l.speak || l.understand)
          );
          const cleanLangs = restoredLangs.length > 0 ? restoredLangs : [
            { language: 'English', read: true, write: true, speak: true, understand: true },
            { language: 'Tamil', read: true, write: true, speak: true, understand: true }
          ];
          setFormData(prev => ({
            ...prev,
            ...parsed.formData,
            languagesKnown: cleanLangs,
            organizationId
          }));
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

    const processFileWithUrl = (url: string, sizeStr: string) => {
      const uploadedFile: ApplicationDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        type: docType,
        size: sizeStr,
        url: url
      };

      setFormData(prev => ({
        ...prev,
        documents: [...(prev.documents || []).filter(d => d.type !== docType), uploadedFile]
      }));

      // If photo, update photoUrl
      if (docType === 'Photograph') {
        setFormData(prev => ({
          ...prev,
          personalDetails: { ...prev.personalDetails!, photoUrl: url }
        }));
      }
    };

    // Read via FileReader for instant client-side preview & reliable fallback
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

      try {
        const res = await api.uploadFile(file, docType);
        if (res && res.file && res.file.url) {
          processFileWithUrl(res.file.url, res.file.size || sizeStr);
        } else {
          processFileWithUrl(dataUrl, sizeStr);
        }
      } catch (uploadErr) {
        console.warn('Backend upload API error, falling back to base64 data URL:', uploadErr);
        processFileWithUrl(dataUrl, sizeStr);
      } finally {
        setUploadingDoc(false);
      }
    };

    reader.onerror = () => {
      alert('Failed to read file on device.');
      setUploadingDoc(false);
    };

    reader.readAsDataURL(file);
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
      // Strip out unticked languages when leaving Step 5
      if (currentStep === 5) {
        const activeLangs = (formData.languagesKnown || []).filter(
          l => l.language && (l.read || l.write || l.speak || l.understand)
        );
        setFormData(prev => ({
          ...prev,
          languagesKnown: activeLangs.length > 0 ? activeLangs : [
            { language: 'English', read: true, write: true, speak: true, understand: true }
          ]
        }));
      }
      saveDraft();
      setCurrentStep(prev => Math.min(8, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [submittedData, setSubmittedData] = useState<{ applicationId: string; application: any } | null>(null);

  // Final Form Submission Handler
  const handleFinalSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);

    // Compute Full Name
    const p = (formData.personalDetails || {}) as any;
    const fullName = `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.replace(/\s+/g, ' ').trim().toUpperCase();

    // Filter out languages where NO checkboxes (R, W, S, U) are ticked
    const validLanguages = (formData.languagesKnown || []).filter(
      l => l.language && (l.read || l.write || l.speak || l.understand)
    );

    const payload = {
      ...formData,
      languagesKnown: validLanguages,
      organizationId,
      personalDetails: { ...p, fullName }
    };

    try {
      const res = await api.submitApplication(payload);
      // Clear draft
      localStorage.removeItem(STORAGE_KEY);
      // Open Creative Success Popup Modal
      setSubmittedData({ applicationId: res.applicationId, application: res.application || payload });
      
      // Trigger festive celebratory confetti animation
      try {
        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.55 }
        });
      } catch (e) {}
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
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setDatePickerModal({
                      isOpen: true,
                      title: "Select Candidate Date of Birth",
                      initialDate: formData.personalDetails?.dob,
                      onSelectDate: (selectedDate) => {
                        const birthYear = new Date(selectedDate).getFullYear();
                        const currentYear = new Date().getFullYear();
                        const age = isNaN(birthYear) ? undefined : (currentYear - birthYear);
                        setFormData({
                          ...formData,
                          personalDetails: { ...formData.personalDetails!, dob: selectedDate, age }
                        });
                      }
                    })}
                    className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all hover:scale-105 shadow-sm flex items-center justify-center"
                    title="Open Date Picker Dialog"
                  >
                    <CalendarIcon className="w-4 h-4 text-sky-600" />
                  </button>
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
                value={formData.personalDetails?.nationality ?? ''}
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
                  value={formData.contactDetails?.city ?? ''}
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
                  value={formData.contactDetails?.state ?? ''}
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
                  Notice Period
                </label>
                <select
                  value={['Immediate', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days'].includes(formData.financialDetails?.noticePeriod || '30 Days') ? (formData.financialDetails?.noticePeriod || '30 Days') : 'Custom'}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      financialDetails: { ...formData.financialDetails!, noticePeriod: val === 'Custom' ? '' : val }
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs font-bold text-slate-800 bg-white border border-sky-300 shadow-sm"
                >
                  <option value="Immediate" className="bg-white text-slate-900 font-semibold">Immediate / 1-7 Days</option>
                  <option value="15 Days" className="bg-white text-slate-900 font-semibold">15 Days</option>
                  <option value="30 Days" className="bg-white text-slate-900 font-semibold">30 Days (1 Month)</option>
                  <option value="45 Days" className="bg-white text-slate-900 font-semibold">45 Days</option>
                  <option value="60 Days" className="bg-white text-slate-900 font-semibold">60 Days (2 Months)</option>
                  <option value="90 Days" className="bg-white text-slate-900 font-semibold">90 Days (3 Months)</option>
                  <option value="Custom" className="bg-white text-slate-900 font-semibold">Custom / Specify</option>
                </select>

                {(!['Immediate', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days'].includes(formData.financialDetails?.noticePeriod || '') || formData.financialDetails?.noticePeriod === '') && (
                  <input
                    type="text"
                    placeholder="Specify notice period"
                    value={formData.financialDetails?.noticePeriod || ''}
                    onChange={e => setFormData({
                      ...formData,
                      financialDetails: { ...formData.financialDetails!, noticePeriod: e.target.value }
                    })}
                    className="w-full mt-1.5 px-3 py-1.5 rounded-lg glass-input text-xs font-bold border border-sky-200"
                  />
                )}
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
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => setDatePickerModal({
                            isOpen: true,
                            title: `Select 'From Date' (Work Entry #${idx + 1})`,
                            initialDate: exp.periodFrom,
                            onSelectDate: (selectedDate) => {
                              const updated = [...formData.experienceDetails!];
                              updated[idx].periodFrom = selectedDate;
                              setFormData({ ...formData, experienceDetails: updated });
                            }
                          })}
                          className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all hover:scale-105 shadow-sm"
                          title="Open Date Picker Dialog"
                        >
                          <CalendarIcon className="w-4 h-4 text-sky-600" />
                        </button>
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
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        To Date (Or 'Present')
                      </label>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => setDatePickerModal({
                            isOpen: true,
                            title: `Select 'To Date' (Work Entry #${idx + 1})`,
                            initialDate: exp.periodTo,
                            allowPresent: true,
                            onSelectDate: (selectedDate) => {
                              const updated = [...formData.experienceDetails!];
                              updated[idx].periodTo = selectedDate;
                              setFormData({ ...formData, experienceDetails: updated });
                            }
                          })}
                          className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all hover:scale-105 shadow-sm flex items-center justify-center"
                          title="Open Date Picker Dialog"
                        >
                          <CalendarIcon className="w-4 h-4 text-sky-600" />
                        </button>
                        <input
                          type="text"
                          placeholder="YYYY-MM-DD or Present"
                          value={exp.periodTo}
                          onChange={e => {
                            const updated = [...formData.experienceDetails!];
                            updated[idx].periodTo = e.target.value;
                            setFormData({ ...formData, experienceDetails: updated });
                          }}
                          className={`w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold ${
                            exp.periodTo === 'Present' ? 'text-emerald-700 bg-emerald-50/80 border-emerald-300 font-extrabold' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...formData.experienceDetails!];
                            updated[idx].periodTo = exp.periodTo === 'Present' ? '' : 'Present';
                            setFormData({ ...formData, experienceDetails: updated });
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition-all whitespace-nowrap shadow-sm ${
                            exp.periodTo === 'Present'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                          title="Toggle 'Present' (Currently working here)"
                        >
                          {exp.periodTo === 'Present' ? '✓ Present' : 'Present'}
                        </button>
                      </div>
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

            {/* Languages Known Grid (Choose Options) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-sky-800 flex items-center space-x-2">
                    <Languages className="w-4 h-4 text-sky-600" />
                    <span>Languages Known (Read, Write, Speak, Understand)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select options for each language you are proficient in.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const currentLangs = formData.languagesKnown || [];
                    setFormData({
                      ...formData,
                      languagesKnown: [
                        ...currentLangs,
                        { language: '', read: true, write: true, speak: true, understand: true }
                      ]
                    });
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Other Language</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-sky-200 shadow-sm bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-sky-100/80 border-b border-sky-200 text-sky-900 font-bold">
                      <th className="py-3 px-4 w-12 text-center">S.No</th>
                      <th className="py-3 px-4 min-w-[150px]">Language</th>
                      <th className="py-3 px-4 text-center min-w-[90px]">Read (R)</th>
                      <th className="py-3 px-4 text-center min-w-[90px]">Write (W)</th>
                      <th className="py-3 px-4 text-center min-w-[90px]">Speak (S)</th>
                      <th className="py-3 px-4 text-center min-w-[90px]">Understand (U)</th>
                      <th className="py-3 px-4 text-center min-w-[120px]">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100">
                    {(formData.languagesKnown || []).map((lang, idx) => {
                      const allChecked = lang.read && lang.write && lang.speak && lang.understand;
                      const isStandard = AVAILABLE_LANGUAGES.filter(l => l !== 'Other').includes(lang.language);
                      return (
                        <tr key={idx} className="hover:bg-sky-50/70 transition-colors">
                          <td className="py-3 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                          
                          <td className="py-3 px-4 font-bold text-slate-900 min-w-[180px]">
                            <select
                              value={isStandard ? lang.language : (lang.language ? 'Other' : '')}
                              onChange={e => {
                                const val = e.target.value;
                                const updated = [...formData.languagesKnown!];
                                if (val === 'Other') {
                                  updated[idx].language = '';
                                } else {
                                  updated[idx].language = val;
                                }
                                setFormData({ ...formData, languagesKnown: updated });
                              }}
                              className="w-full px-3 py-1.5 rounded-xl glass-input text-xs font-extrabold text-slate-800 bg-white border border-sky-300 shadow-sm"
                            >
                              <option value="" className="text-slate-400">-- Choose Language --</option>
                              {AVAILABLE_LANGUAGES.map(l => (
                                <option key={l} value={l} className="bg-white text-slate-900 font-semibold">
                                  {l}
                                </option>
                              ))}
                            </select>

                            {!isStandard && (
                              <input
                                type="text"
                                placeholder="Type custom language..."
                                value={lang.language}
                                onChange={e => {
                                  const updated = [...formData.languagesKnown!];
                                  updated[idx].language = e.target.value;
                                  setFormData({ ...formData, languagesKnown: updated });
                                }}
                                className="w-full mt-1.5 px-3 py-1 rounded-lg glass-input text-xs font-bold border border-sky-200"
                              />
                            )}
                          </td>

                          {/* READ (R) */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.languagesKnown!];
                                updated[idx].read = !updated[idx].read;
                                setFormData({ ...formData, languagesKnown: updated });
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border shadow-sm inline-flex items-center justify-center space-x-1 ${
                                lang.read
                                  ? 'bg-sky-600 text-white border-sky-600 shadow-sky-500/25 scale-105'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200'
                              }`}
                              title="Toggle Read (R)"
                            >
                              {lang.read ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>YES</span>
                                </>
                              ) : (
                                <span>NO</span>
                              )}
                            </button>
                          </td>

                          {/* WRITE (W) */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.languagesKnown!];
                                updated[idx].write = !updated[idx].write;
                                setFormData({ ...formData, languagesKnown: updated });
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border shadow-sm inline-flex items-center justify-center space-x-1 ${
                                lang.write
                                  ? 'bg-sky-600 text-white border-sky-600 shadow-sky-500/25 scale-105'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200'
                              }`}
                              title="Toggle Write (W)"
                            >
                              {lang.write ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>YES</span>
                                </>
                              ) : (
                                <span>NO</span>
                              )}
                            </button>
                          </td>

                          {/* SPEAK (S) */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.languagesKnown!];
                                updated[idx].speak = !updated[idx].speak;
                                setFormData({ ...formData, languagesKnown: updated });
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border shadow-sm inline-flex items-center justify-center space-x-1 ${
                                lang.speak
                                  ? 'bg-sky-600 text-white border-sky-600 shadow-sky-500/25 scale-105'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200'
                              }`}
                              title="Toggle Speak (S)"
                            >
                              {lang.speak ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>YES</span>
                                </>
                              ) : (
                                <span>NO</span>
                              )}
                            </button>
                          </td>

                          {/* UNDERSTAND (U) */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.languagesKnown!];
                                updated[idx].understand = !updated[idx].understand;
                                setFormData({ ...formData, languagesKnown: updated });
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border shadow-sm inline-flex items-center justify-center space-x-1 ${
                                lang.understand
                                  ? 'bg-sky-600 text-white border-sky-600 shadow-sky-500/25 scale-105'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200'
                              }`}
                              title="Toggle Understand (U)"
                            >
                              {lang.understand ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>YES</span>
                                </>
                              ) : (
                                <span>NO</span>
                              )}
                            </button>
                          </td>

                          {/* QUICK ACTIONS: SELECT ALL / REMOVE */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...formData.languagesKnown!];
                                  const targetState = !allChecked;
                                  updated[idx] = {
                                    ...updated[idx],
                                    read: targetState,
                                    write: targetState,
                                    speak: targetState,
                                    understand: targetState
                                  };
                                  setFormData({ ...formData, languagesKnown: updated });
                                }}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                  allChecked
                                    ? 'bg-sky-100 text-sky-700 border-sky-300'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-sky-50'
                                }`}
                              >
                                {allChecked ? 'Uncheck All' : 'Check All'}
                              </button>

                              {(formData.languagesKnown || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = (formData.languagesKnown || []).filter((_, i) => i !== idx);
                                    setFormData({ ...formData, languagesKnown: updated });
                                  }}
                                  className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 border border-rose-200 transition-colors"
                                  title="Remove Row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* STEP 6: REFERENCES, FAMILY DETAILS & QUESTIONNAIRE */}
        {currentStep === 6 && (
          <div className="space-y-8 animate-fadeIn">
            <h3 className="text-lg font-heading font-extrabold text-slate-900 flex items-center space-x-2 pb-3 border-b border-sky-100">
              <Users className="w-5 h-5 text-sky-600" />
              <span>Step 6: Family Details, References & Questionnaire</span>
            </h3>

            {/* FAMILY DETAILS GRID SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-sky-800 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-sky-600" />
                    <span>Family Details (Spouse / Parents / Children / Dependents)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add family members to populate Page 2 of your Official Candidate Data Sheet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddFamilyModal}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Family Member</span>
                </button>
              </div>

              {/* Family Members Table */}
              {(formData.familyDetails || []).length === 0 ? (
                <div className="p-6 rounded-2xl bg-sky-50/50 border-dashed border-2 border-sky-300 text-center space-y-3">
                  <User className="w-8 h-8 text-sky-500 mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">No family details added yet</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Click the button below to open the Family Details dialog box.</p>
                  </div>
                  <button
                    type="button"
                    onClick={openAddFamilyModal}
                    className="px-4 py-2 rounded-xl bg-white border border-sky-300 text-sky-700 text-xs font-bold hover:bg-sky-50 shadow-sm inline-flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Open Add Family Member Dialog</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-sky-200 shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-sky-100/70 border-b border-sky-200 text-sky-900 font-bold">
                        <th className="py-2.5 px-3">S.No</th>
                        <th className="py-2.5 px-3">Full Name</th>
                        <th className="py-2.5 px-3">Relationship</th>
                        <th className="py-2.5 px-3 text-center">Age</th>
                        <th className="py-2.5 px-3">Occupation</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3">Contact No</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-100 bg-white">
                      {(formData.familyDetails || []).map((fam, idx) => (
                        <tr key={fam.id || idx} className="hover:bg-sky-50/60">
                          <td className="py-2.5 px-3 font-semibold text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{fam.name}</td>
                          <td className="py-2.5 px-3 font-semibold text-sky-700">{fam.relationship}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{fam.age || '-'}</td>
                          <td className="py-2.5 px-3 text-slate-700">{fam.occupation || '-'}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              fam.dependent === 'Dependent' || fam.dependent === 'Yes'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {fam.dependent || 'Not Dependent'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{fam.contactNo || '-'}</td>
                          <td className="py-2.5 px-3 text-right space-x-1">
                            <button
                              type="button"
                              onClick={() => openEditFamilyModal(idx)}
                              className="px-2 py-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 text-[11px] font-bold border border-sky-200"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFamilyMember(idx)}
                              className="px-2 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 text-[11px] font-bold border border-rose-200"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-sky-50/70 border border-sky-200 shadow-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Are you willing to work on Sundays?
                </label>
                <select
                  value={formData.additionalInfo?.workSundays || 'Yes'}
                  onChange={e => setFormData({
                    ...formData,
                    additionalInfo: { ...formData.additionalInfo!, workSundays: e.target.value as any }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-bold text-slate-800 bg-white border border-sky-300 shadow-sm"
                >
                  <option value="Yes" className="bg-white text-slate-900">Yes</option>
                  <option value="No" className="bg-white text-slate-900">No</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Joining Time Required
                </label>
                <select
                  value={['Immediate', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days'].includes(formData.additionalInfo?.joiningTimeRequired || '30 Days') ? (formData.additionalInfo?.joiningTimeRequired || '30 Days') : 'Custom'}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      additionalInfo: { ...formData.additionalInfo!, joiningTimeRequired: val === 'Custom' ? '' : val }
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-bold text-slate-800 bg-white border border-sky-300 shadow-sm"
                >
                  <option value="Immediate" className="bg-white text-slate-900 font-semibold">Immediate / 1-7 Days</option>
                  <option value="15 Days" className="bg-white text-slate-900 font-semibold">15 Days</option>
                  <option value="30 Days" className="bg-white text-slate-900 font-semibold">30 Days (1 Month)</option>
                  <option value="45 Days" className="bg-white text-slate-900 font-semibold">45 Days</option>
                  <option value="60 Days" className="bg-white text-slate-900 font-semibold">60 Days (2 Months)</option>
                  <option value="90 Days" className="bg-white text-slate-900 font-semibold">90 Days (3 Months)</option>
                  <option value="Custom" className="bg-white text-slate-900 font-semibold">Custom / Specify</option>
                </select>

                {(!['Immediate', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days'].includes(formData.additionalInfo?.joiningTimeRequired || '') || formData.additionalInfo?.joiningTimeRequired === '') && (
                  <input
                    type="text"
                    placeholder="Specify joining time (e.g. 2 weeks)"
                    value={formData.additionalInfo?.joiningTimeRequired || ''}
                    onChange={e => setFormData({
                      ...formData,
                      additionalInfo: { ...formData.additionalInfo!, joiningTimeRequired: e.target.value }
                    })}
                    className="w-full mt-2 px-3.5 py-2 rounded-xl glass-input text-xs font-bold border border-sky-200"
                  />
                )}
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
                value={formData.additionalInfo?.litigationDetails ?? ''}
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
              <span>Step 7: Upload Passport Size Photo & Resume / CV</span>
            </h3>

            <p className="text-xs text-slate-500">
              Please upload your clear Passport Size Photograph (JPG, PNG) and your updated Resume / CV document (PDF, DOC, DOCX, Max 10MB each).
            </p>

            {/* Upload Boxes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 1. Passport Size Photo Box */}
              <div className="p-6 rounded-2xl bg-sky-50/70 text-center border-dashed border-2 border-sky-400 hover:border-sky-600 transition-colors shadow-sm flex flex-col justify-between">
                <div>
                  {formData.personalDetails?.photoUrl ? (
                    <div className="mb-3">
                      <img 
                        src={formData.personalDetails.photoUrl} 
                        alt="Uploaded Photo Preview" 
                        className="w-24 h-28 object-cover rounded-xl border-2 border-sky-500 mx-auto shadow-md"
                      />
                      <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center justify-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Passport Photo Uploaded</span>
                      </p>
                    </div>
                  ) : (
                    <User className="w-12 h-12 text-sky-600 mx-auto mb-2" />
                  )}
                  
                  <p className="text-sm font-bold text-slate-800">Passport Size Photo</p>
                  <p className="text-xs text-slate-500 mb-4">JPG, PNG format (Max 10MB)</p>
                </div>
                
                <div>
                  <label className="px-5 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs cursor-pointer hover:bg-sky-500 inline-flex items-center space-x-2 shadow-md shadow-sky-500/25 transition-all">
                    <Upload className="w-4 h-4" />
                    <span>{formData.personalDetails?.photoUrl ? 'Change Passport Photo' : 'Browse Passport Photo'}</span>
                    <input
                      type="file"
                      accept="image/*,image/jpeg,image/png,image/webp,.jpg,.jpeg,.png"
                      onChange={e => handleFileUpload(e, 'Photograph')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* 2. Resume / CV Upload Box */}
              {(() => {
                const resumeDoc = (formData.documents || []).find(d => d.type === 'Resume');
                return (
                  <div className="p-6 rounded-2xl bg-sky-50/70 text-center border-dashed border-2 border-sky-400 hover:border-sky-600 transition-colors shadow-sm flex flex-col justify-between">
                    <div>
                      {resumeDoc ? (
                        <div className="mb-3 space-y-2">
                          <div className="w-14 h-16 rounded-xl bg-white border-2 border-emerald-400 mx-auto flex items-center justify-center shadow-md">
                            <FileText className="w-8 h-8 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 truncate max-w-[220px] mx-auto">{resumeDoc.name}</p>
                            <p className="text-[10px] text-slate-500">{resumeDoc.size}</p>
                          </div>
                          <p className="text-xs font-bold text-emerald-600 flex items-center justify-center space-x-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Resume / CV Uploaded</span>
                          </p>
                        </div>
                      ) : (
                        <FileText className="w-12 h-12 text-sky-600 mx-auto mb-2" />
                      )}

                      <p className="text-sm font-bold text-slate-800">Resume / CV Document</p>
                      <p className="text-xs text-slate-500 mb-4">PDF, DOC, DOCX format (Max 10MB)</p>
                    </div>

                    <div>
                      <label className="px-5 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs cursor-pointer hover:bg-sky-500 inline-flex items-center space-x-2 shadow-md shadow-sky-500/25 transition-all">
                        <Upload className="w-4 h-4" />
                        <span>{resumeDoc ? 'Change Resume / CV' : 'Browse Resume / CV'}</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={e => handleFileUpload(e, 'Resume')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                );
              })()}

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

            {/* OFFICIAL RATHINAM Candidate Personal Data Sheet PREVIEW */}
            <div className="bg-white text-black p-6 sm:p-10 font-sans shadow-xl rounded-2xl border border-sky-300 max-w-4xl mx-auto space-y-8">
              
              {/* Review Badge Banner */}
              <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl flex items-center justify-between no-print">
                <span className="text-xs font-bold text-sky-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>Official Application Paper Form Preview (Verify your details before final submission)</span>
                </span>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Step 8 of 8
                </span>
              </div>

              {/* ==================== PAGE 1 PREVIEW ==================== */}
              <div className="space-y-4 print-page">
                
                {/* Header: Rathinam Logo + Title + Passport Photo Box */}
                <div className="flex items-start justify-between border-b-2 border-black pb-3">
                  <div className="flex-1 text-center pl-24 sm:pl-28">
                    {/* Official Rathinam Group Logo */}
                    <div className="inline-flex flex-col items-center">
                      <img src="/rathinam_logo.png" alt="Rathinam Group Logo" className="h-16 w-auto object-contain mx-auto mb-1" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-black underline uppercase mt-1">
                      Candidate Personal Data Sheet
                    </h1>
                  </div>

                  {/* Passport Size Photo Box on Top Right */}
                  <div className="w-[105px] h-[130px] border-2 border-black p-0.5 flex flex-col items-center justify-center bg-slate-50 text-center flex-shrink-0 ml-2 sm:ml-4">
                    {formData.personalDetails?.photoUrl ? (
                      <img src={formData.personalDetails.photoUrl} alt="Candidate Photo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[10px] font-bold text-slate-500 uppercase leading-tight px-1">
                        Affix Candidate Passport Size Photo
                      </div>
                    )}
                  </div>
                </div>

                {/* Date / Time / Source Box */}
                <div className="border border-black grid grid-cols-3 text-xs divide-x divide-black font-semibold">
                  <div className="p-2">Date : <span className="font-normal">{new Date().toLocaleDateString()}</span></div>
                  <div className="p-2">Time : <span className="font-normal">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                  <div className="p-2">Source : <span className="font-normal">Online Application</span></div>
                </div>

                {/* Personal Details Form Lines */}
                <div className="space-y-2.5 text-xs font-semibold leading-relaxed pt-1">
                  <div className="border-b border-black/30 pb-1">
                    <span>Position Applied for : </span>
                    <span className="font-normal underline underline-offset-4">{formData.positionApplied || 'N/A'}</span>
                  </div>

                  <div className="border-b border-black/30 pb-1 flex items-baseline justify-between flex-wrap gap-2">
                    <span>Name (In Block Letters) : <span className="font-bold uppercase text-sm">{formData.personalDetails?.firstName || ''}</span> <span className="text-[10px] font-normal text-slate-500">(First Name)</span></span>
                    <span><span className="font-bold uppercase text-sm">{formData.personalDetails?.middleName || '-'}</span> <span className="text-[10px] font-normal text-slate-500">(Middle Name)</span></span>
                    <span><span className="font-bold uppercase text-sm">{formData.personalDetails?.lastName || ''}</span> <span className="text-[10px] font-normal text-slate-500">(Last Name)</span></span>
                  </div>

                  <div className="border-b border-black/30 pb-1">
                    <span>Contact Address : </span>
                    <span className="font-normal">{formData.contactDetails?.address}, {formData.contactDetails?.city}, {formData.contactDetails?.state}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-b border-black/30 pb-1">
                    <div>Pin code : <span className="font-normal">{formData.contactDetails?.pincode}</span></div>
                    <div>e – Mail id : <span className="font-normal">{formData.contactDetails?.email}</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-b border-black/30 pb-1">
                    <div>Phone : <span className="font-normal">{formData.contactDetails?.phone || 'N/A'}</span></div>
                    <div>Mobile : <span className="font-normal">{formData.contactDetails?.mobile}</span></div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 border-b border-black/30 pb-1">
                    <div>Date of Birth: <span className="font-normal">{formData.personalDetails?.dob}</span></div>
                    <div>Age : <span className="font-normal">{formData.personalDetails?.age} Yrs</span></div>
                    <div>Gender : <span className="font-normal">{formData.personalDetails?.gender}</span></div>
                    <div>Marital Status : <span className="font-normal">{formData.personalDetails?.maritalStatus}</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-b border-black/30 pb-1">
                    <div>Current Gross (Per Annum) : <span className="font-normal">₹{formData.financialDetails?.currentSalary || 'N/A'}</span></div>
                    <div>Expected Gross (Per Annum) : <span className="font-normal">₹{formData.financialDetails?.expectedSalary || 'N/A'}</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-b border-black/30 pb-1">
                    <div>Current Company Notice Period : <span className="font-normal">{formData.financialDetails?.noticePeriod || 'Immediate'}</span></div>
                    <div>Total years of Experience : <span className="font-normal">{formData.financialDetails?.totalExperienceYears || '0'} Years</span></div>
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
                      {(formData.educationDetails || []).map((edu, idx) => (
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
                      {Array.from({ length: Math.max(0, 3 - (formData.educationDetails?.length || 0)) }).map((_, i) => (
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
                      {(formData.experienceDetails || []).map((exp, idx) => (
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
                      {Array.from({ length: Math.max(0, 3 - (formData.experienceDetails?.length || 0)) }).map((_, i) => (
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
                  Career Break If any: <span className="font-normal">{formData.experienceDetails?.[0]?.careerBreak || 'None'}</span>
                </div>

                {/* Page 1 Footer */}
                <div className="pt-3 text-[10px] text-slate-600 font-semibold flex justify-between border-t border-black/20">
                  <span>Doc Ref: RGI/HR/FR 001 Rev:02 - Date of Issue: 01-06-2025</span>
                  <span>Page 1 of 2</span>
                </div>
              </div>

              {/* ==================== PAGE BREAK ==================== */}
              <div className="page-break my-8 border-b-2 border-dashed border-slate-300 no-print" />

              {/* ==================== PAGE 2 PREVIEW ==================== */}
              <div className="space-y-4 print-page pt-4">
                
                {/* Header: Rathinam Logo Page 2 */}
                <div className="text-center border-b-2 border-black pb-3">
                  <div className="inline-flex flex-col items-center">
                    <img src="/rathinam_logo.png" alt="Rathinam Group Logo" className="h-12 w-auto object-contain mx-auto mb-1" />
                  </div>
                </div>

                {/* Certifications */}
                <div className="border-b border-black/30 pb-1 text-xs font-semibold">
                  Certifications if Any? (E.g.: Oracle, Java, Network etc. ) : <span className="font-normal">{formData.certifications || 'None listed'}</span>
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
                      {(() => {
                        const activeLangs = (formData.languagesKnown || []).filter(
                          l => l.language && (l.read || l.write || l.speak || l.understand)
                        );
                        if (activeLangs.length === 0) {
                          return (
                            <tr>
                              <td className="border-r border-black p-1 text-[10px] text-slate-500 font-semibold" colSpan={3}>None specified</td>
                              <td className="p-1 text-[10px] text-slate-500 font-semibold" colSpan={3}>-</td>
                            </tr>
                          );
                        }
                        const rows = [];
                        for (let i = 0; i < activeLangs.length; i += 2) {
                          const left = activeLangs[i];
                          const right = activeLangs[i + 1];
                          rows.push(
                            <tr key={i}>
                              <td className="border-r border-black p-1 font-semibold">{i + 1}</td>
                              <td className="border-r border-black p-1 font-bold">{left.language}</td>
                              <td className="border-r border-black p-1 font-mono text-[10px]">
                                {left.read ? '☑' : '☐'} &nbsp; {left.write ? '☑' : '☐'} &nbsp; {left.speak ? '☑' : '☐'} &nbsp; {left.understand ? '☑' : '☐'}
                              </td>
                              {right ? (
                                <>
                                  <td className="border-r border-black p-1 font-semibold">{i + 2}</td>
                                  <td className="border-r border-black p-1 font-bold">{right.language}</td>
                                  <td className="p-1 font-mono text-[10px]">
                                    {right.read ? '☑' : '☐'} &nbsp; {right.write ? '☑' : '☐'} &nbsp; {right.speak ? '☑' : '☐'} &nbsp; {right.understand ? '☑' : '☐'}
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="border-r border-black p-1">-</td>
                                  <td className="border-r border-black p-1">-</td>
                                  <td className="p-1 font-mono text-[10px]">-</td>
                                </>
                              )}
                            </tr>
                          );
                        }
                        return rows;
                      })()}
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
                      {(formData.familyDetails || []).map((fam, idx) => (
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
                      {Array.from({ length: Math.max(0, 3 - (formData.familyDetails?.length || 0)) }).map((_, i) => (
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
                    Are you willing to work on Sundays? Yes / No : <span className="font-normal">{formData.additionalInfo?.workSundays || 'Yes'}</span>
                  </div>
                  <div className="border-b border-black/30 pb-1">
                    Joining time required: <span className="font-normal">{formData.additionalInfo?.joiningTimeRequired || '30 Days'}</span>
                  </div>
                  <div className="border-b border-black/30 pb-1">
                    Is there any litigation pending against you filed by (a) Any relative (b) Otherwise? If Yes, Please provide details: <span className="font-normal">{formData.additionalInfo?.litigationDetails || 'None'}</span>
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
                      {(formData.references || []).map((ref, idx) => (
                        <tr key={idx}>
                          <td className="border-r border-black p-1">{idx + 1}</td>
                          <td className="border-r border-black p-1 font-semibold">{ref.name}</td>
                          <td className="border-r border-black p-1">{ref.designation}</td>
                          <td className="border-r border-black p-1 font-mono">{ref.mobile}</td>
                          <td className="p-1 font-mono">{ref.phone || 'N/A'}</td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 2 - (formData.references?.length || 0)) }).map((_, i) => (
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
                  
                  <div className="grid grid-cols-2 text-xs font-bold pt-4 text-center max-w-md mx-auto">
                    <div>Date : <span className="font-normal underline">{new Date().toISOString().split('T')[0]}</span></div>
                    <div>Place : <span className="font-normal underline">Coimbatore</span></div>
                  </div>
                </div>

                {/* Page 2 Footer */}
                <div className="pt-4 text-[10px] text-slate-600 font-semibold flex justify-between border-t border-black/20">
                  <span>Doc Ref: RGI/HR/FR 001 Rev:02 - Date of Issue: 01-06-2025</span>
                  <span>Page 2 of 2</span>
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

      {/* UNIFIED CONFIRMATION & SUBMITTED POPUP DIALOG MODAL */}
      {(showConfirmModal || submittedData) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="glass-panel p-6 sm:p-9 rounded-3xl max-w-lg w-full border-2 border-sky-300 bg-white shadow-2xl space-y-6 text-center animate-scaleUp my-8 max-h-[90vh] overflow-y-auto">
            
            {/* STATE 1: LOADING STATE */}
            {loading ? (
              <div className="py-8 space-y-5">
                <div className="w-20 h-20 rounded-full bg-sky-100 border-2 border-sky-400 text-sky-600 flex items-center justify-center mx-auto shadow-xl shadow-sky-500/20 animate-spin">
                  <Sparkles className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
                    Submitting Application...
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Saving details into Rathinam HR Database & generating your Application ID...
                  </p>
                </div>
                <div className="w-full bg-sky-100 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                  <div className="bg-sky-600 h-full w-2/3 animate-pulse rounded-full" />
                </div>
              </div>
            ) : submittedData ? (
              /* STATE 2: SUBMITTED SUCCESS POPUP */
              <>
                {/* Celebratory Icon */}
                <div className="relative pt-2">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 ring-8 ring-emerald-100 animate-pulse">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <span className="absolute top-0 right-1/4 text-2xl">✨</span>
                  <span className="absolute bottom-0 left-1/4 text-2xl">🎉</span>
                </div>

                {/* Badge & Title */}
                <div className="space-y-2">
                  <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-extrabold uppercase tracking-widest inline-block shadow-sm">
                    🎉 APPLICATION SUBMITTED
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 leading-tight">
                    Application Submitted Successfully!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
                    Thank you, <strong className="text-slate-900">{formData.personalDetails?.firstName}</strong>! Your official employment application for <strong className="text-slate-900">{formData.positionApplied}</strong> has been logged into Rathinam HR database.
                  </p>
                </div>

                {/* Unique Application ID Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 border border-sky-300 shadow-md space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-sky-800">
                    <span>Unique Application Reference ID</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono">CONFIRMED</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white py-3 px-4 rounded-xl border border-sky-200 shadow-inner">
                    <span className="font-mono text-xl sm:text-2xl font-extrabold tracking-wider text-slate-900 select-all">
                      {submittedData.applicationId}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(submittedData.applicationId);
                        alert(`Application ID ${submittedData.applicationId} copied to clipboard!`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition-all hover:scale-105"
                      title="Copy Application ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ID</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium text-left leading-normal">
                    📌 Save or copy this Application ID to track recruitment status and interview schedules online.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmModal(false);
                      const id = submittedData.applicationId;
                      setSubmittedData(null);
                      onNavigate('track', { searchId: id });
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
                  >
                    <span>Track Application Status</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmModal(false);
                      setSubmittedData(null);
                      onNavigate('landing');
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </>
            ) : (
              /* STATE 3: PRE-SUBMISSION CONFIRMATION QUESTION */
              <>
                <div className="w-16 h-16 rounded-full bg-sky-100 border-2 border-sky-300 text-sky-600 flex items-center justify-center mx-auto shadow-md">
                  <Sparkles className="w-8 h-8" />
                </div>

                <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
                  Submit Application to {organizationId}?
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                  Are you sure you want to submit your application for <strong>{formData.positionApplied}</strong>? A unique Application ID will be generated immediately for tracking.
                </p>

                {errorMsg && (
                  <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-slate-800 text-xs space-y-2.5 text-left shadow-sm">
                    <div className="flex items-center space-x-2 text-amber-800 font-extrabold">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>{errorMsg.toLowerCase().includes('duplicate') ? 'Duplicate Application Detected' : 'Submission Alert'}</span>
                    </div>
                    <p className="text-slate-600 font-medium text-[11px] leading-relaxed">
                      {errorMsg}
                    </p>
                    {errorMsg.toLowerCase().includes('duplicate') && (
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowConfirmModal(false);
                            onNavigate('track');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold shadow-sm"
                        >
                          🔍 Track Existing Application
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowConfirmModal(false);
                            setErrorMsg(null);
                            setCurrentStep(2); // Go to Contact Details step to edit email/mobile
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-[11px] font-bold"
                        >
                          ✏️ Edit Contact Details
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 flex items-center justify-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmModal(false);
                      setErrorMsg(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white text-xs font-extrabold shadow-lg shadow-sky-600/25 transition-all hover:scale-105"
                  >
                    Yes, Submit Application
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* FAMILY DETAILS MODAL DIALOG BOX */}
      {showFamilyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-sky-300 space-y-5 bg-white shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-extrabold text-slate-900">
                    {editingFamilyIndex !== null ? 'Edit Family Member Details' : 'Add Family Member Details'}
                  </h3>
                  <p className="text-xs text-slate-500">Enter family info for Candidate Data Sheet</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFamilyModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveFamilyMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramasamy / Priya"
                  value={familyForm.name}
                  onChange={e => setFamilyForm({ ...familyForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Relationship <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={familyForm.relationship}
                    onChange={e => setFamilyForm({ ...familyForm, relationship: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  >
                    <option value="Father" className="bg-white">Father</option>
                    <option value="Mother" className="bg-white">Mother</option>
                    <option value="Spouse" className="bg-white">Spouse</option>
                    <option value="Son" className="bg-white">Son</option>
                    <option value="Daughter" className="bg-white">Daughter</option>
                    <option value="Brother" className="bg-white">Brother</option>
                    <option value="Sister" className="bg-white">Sister</option>
                    <option value="Other" className="bg-white">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 52"
                    value={familyForm.age}
                    onChange={e => setFamilyForm({ ...familyForm, age: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Business / Service / Homemaker"
                    value={familyForm.occupation}
                    onChange={e => setFamilyForm({ ...familyForm, occupation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dependent Status
                  </label>
                  <select
                    value={familyForm.dependent}
                    onChange={e => setFamilyForm({ ...familyForm, dependent: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                  >
                    <option value="Dependent" className="bg-white">Dependent</option>
                    <option value="Not Dependent" className="bg-white">Not Dependent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={familyForm.contactNo}
                  onChange={e => setFamilyForm({ ...familyForm, contactNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setShowFamilyModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-500/25 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Family Member</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}



      {/* DATE PICKER CALENDAR DIALOG MODAL */}
      {datePickerModal?.isOpen && (
        <CalendarDialogModal
          isOpen={true}
          onClose={() => setDatePickerModal(null)}
          title={datePickerModal.title}
          initialDate={datePickerModal.initialDate}
          allowPresent={datePickerModal.allowPresent}
          mode="picker"
          onSelectDate={(selectedDate) => {
            datePickerModal.onSelectDate(selectedDate);
            setDatePickerModal(null);
          }}
        />
      )}

    </div>
  );
};

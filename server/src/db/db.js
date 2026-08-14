const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, 'data.json');

const INITIAL_DATA = {
  organizations: [
    {
      id: 'RGU',
      name: 'Rathinam Global (Deemed to be University)',
      code: 'RGU',
      subtitle: 'Excellence in Higher Education & Research',
      description: 'Premier university offering undergraduate, postgraduate, and doctoral programs across arts, science, commerce, and advanced technology.',
      icon: 'GraduationCap',
      badgeColor: 'bg-blue-600',
      accentColor: '#0052CC',
      active: true
    },
    {
      id: 'RTC',
      name: 'Rathinam Technical Campus',
      code: 'RTC',
      subtitle: 'Engineering, Technology & Innovation Hub',
      description: 'AICTE approved & NAAC accredited engineering campus offering cutting-edge programs in CS, AI, ECE, Robotics, and Mechanical Engineering.',
      icon: 'Cpu',
      badgeColor: 'bg-emerald-600',
      accentColor: '#059669',
      active: true
    },
    {
      id: 'RPHARM',
      name: 'Rathinam Pharmacy',
      code: 'RPHARM',
      subtitle: 'Pharmaceutical Sciences & Healthcare',
      description: 'PCI approved institution delivering top-tier B.Pharm, M.Pharm, and Pharm.D education with state-of-the-art research laboratories.',
      icon: 'Pill',
      badgeColor: 'bg-amber-600',
      accentColor: '#D97706',
      active: true
    }
  ],
  users: [
    {
      id: 'usr-superadmin',
      name: 'Dr. Subramaniam (Super Admin)',
      email: 'admin@rathinam.in',
      passwordHash: 'admin123',
      role: 'SUPER_ADMIN',
      organizationId: null,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    },
    {
      id: 'usr-hr-rgu',
      name: 'Priya Sharma (RGU HR Lead)',
      email: 'hr.rgu@rathinam.in',
      passwordHash: 'admin123',
      role: 'HR_ADMIN',
      organizationId: 'RGU',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
    },
    {
      id: 'usr-hr-rtc',
      name: 'Karthik Raja (RTC HR Officer)',
      email: 'hr.rtc@rathinam.in',
      passwordHash: 'admin123',
      role: 'HR_ADMIN',
      organizationId: 'RTC',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250'
    },
    {
      id: 'usr-hr-pharmacy',
      name: 'Ananya Ramesh (Pharmacy HR)',
      email: 'hr.pharmacy@rathinam.in',
      passwordHash: 'admin123',
      role: 'HR_ADMIN',
      organizationId: 'RPHARM',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250'
    },
    {
      id: 'usr-viewer',
      name: 'Academic Inspector (Viewer)',
      email: 'viewer@rathinam.in',
      passwordHash: 'viewer123',
      role: 'VIEWER',
      organizationId: null,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250'
    }
  ],
  pdfFieldMappings: [
    { pdfField: 'Doc Ref', webFormField: 'docRef', category: 'Header', pdfRef: 'RGI/HR/FR 001 Rev:02' },
    { pdfField: 'Position Applied for', webFormField: 'positionApplied', category: 'Position Meta', pdfRef: 'Candidate Personal Data Sheet' },
    { pdfField: 'Source of Application', webFormField: 'source', category: 'Position Meta', pdfRef: 'Header Section' },
    { pdfField: 'Name In Block Letters', webFormField: 'personalDetails.fullName', category: 'Personal', pdfRef: 'First / Middle / Last Name' },
    { pdfField: 'Contact Address & Pincode', webFormField: 'contactDetails.address', category: 'Contact', pdfRef: 'Address Field' },
    { pdfField: 'E-Mail ID', webFormField: 'contactDetails.email', category: 'Contact', pdfRef: 'Email Address' },
    { pdfField: 'Phone / Mobile', webFormField: 'contactDetails.mobile', category: 'Contact', pdfRef: 'Mobile Field' },
    { pdfField: 'Date of Birth & Age', webFormField: 'personalDetails.dob', category: 'Personal', pdfRef: 'DOB Field' },
    { pdfField: 'Gender & Marital Status', webFormField: 'personalDetails.gender', category: 'Personal', pdfRef: 'Gender & Marital Status' },
    { pdfField: 'Current & Expected Gross Salary', webFormField: 'experience.currentSalary', category: 'Experience', pdfRef: 'Financial Details' },
    { pdfField: 'Educational Qualifications Table', webFormField: 'educationDetails', category: 'Education', pdfRef: 'Degree, Division, Institution, Year, %' },
    { pdfField: 'Work Experience Table', webFormField: 'experienceDetails', category: 'Experience', pdfRef: 'Org, Designation, Period, Salary, Reason' },
    { pdfField: 'Certifications', webFormField: 'certifications', category: 'Skills', pdfRef: 'Oracle, Java, Network etc.' },
    { pdfField: 'Languages Known Table', webFormField: 'languagesKnown', category: 'Skills', pdfRef: 'Read, Write, Speak, Understand' },
    { pdfField: 'Family Details Table', webFormField: 'familyDetails', category: 'Personal', pdfRef: 'Name, Age, Relationship, Occupation, Dependent' },
    { pdfField: 'Sundays Work & Notice Period', webFormField: 'additionalInfo.workSundays', category: 'Preferences', pdfRef: 'Notice Period & Sundays' },
    { pdfField: 'Litigation Details', webFormField: 'additionalInfo.litigationDetails', category: 'Declaration', pdfRef: 'Pending Litigation Question' },
    { pdfField: 'References & Referred Friends', webFormField: 'references', category: 'References', pdfRef: '2 Current Org Ref + 2 Referred Friends' },
    { pdfField: 'Rathinam Employee Reference', webFormField: 'additionalInfo.rathinamAcquaintance', category: 'References', pdfRef: 'Known Rathinam Employee' },
    { pdfField: 'Solemn Declaration', webFormField: 'declarationAccepted', category: 'Declaration', pdfRef: 'True to best of knowledge' }
  ],
  applications: [
    {
      id: 'app-vignesh01',
      applicationId: 'RHR-2026-000001',
      organizationId: 'RGU',
      positionApplied: 'Assistant Professor - Computer Science & Engineering',
      source: 'Career Portal',
      status: 'NEW',
      personalDetails: {
        firstName: 'VIGNESH',
        middleName: '',
        lastName: 'K',
        fullName: 'VIGNESH K',
        dob: '1993-06-15',
        age: 33,
        gender: 'Male',
        maritalStatus: 'Single',
        nationality: 'Indian',
        category: 'General',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
      },
      contactDetails: {
        address: '12, Techzone Main Road, Eachanari',
        pincode: '641021',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        email: 'vignesh.k@gmail.com',
        phone: '0422-2591000',
        mobile: '9876543210',
        altMobile: '9443322110'
      },
      financialDetails: {
        currentCompany: 'PSG College of Technology',
        noticePeriod: '30 Days',
        totalExperienceYears: '6',
        currentSalary: '6,00,000',
        expectedSalary: '7,50,000'
      },
      educationDetails: [
        {
          id: 'edu-1',
          degree: 'Ph.D. in Computer Science & Engineering',
          division: 'First Class with Distinction',
          institution: 'Anna University, Chennai',
          boardUniversity: 'Anna University',
          majorSubjects: 'Machine Learning, Artificial Intelligence',
          yearOfPassing: '2023',
          percentage: '8.9 CGPA'
        },
        {
          id: 'edu-2',
          degree: 'M.E. Computer Science',
          division: 'First Class',
          institution: 'Government College of Technology, Coimbatore',
          boardUniversity: 'Anna University',
          majorSubjects: 'Advanced Data Structures & Algorithms',
          yearOfPassing: '2017',
          percentage: '85.0%'
        },
        {
          id: 'edu-3',
          degree: 'B.E. Computer Science & Engineering',
          division: 'First Class',
          institution: 'Coimbatore Institute of Technology',
          boardUniversity: 'Anna University',
          majorSubjects: 'Software Engineering, Database Systems',
          yearOfPassing: '2015',
          percentage: '82.5%'
        }
      ],
      experienceDetails: [
        {
          id: 'exp-1',
          organization: 'PSG College of Technology',
          designation: 'Assistant Professor',
          periodFrom: '2017-07-01',
          periodTo: 'Present',
          grossAnnualSalary: '6,00,000',
          ctcPerMonth: '50,000',
          reasonForLeaving: 'Career Growth & Academic Opportunities at Rathinam',
          careerBreak: 'None'
        }
      ],
      certifications: 'AWS Certified Solutions Architect, Oracle Java SE Professional Certificate',
      languagesKnown: [
        { language: 'English', read: true, write: true, speak: true, understand: true },
        { language: 'Tamil', read: true, write: true, speak: true, understand: true }
      ],
      familyDetails: [
        { id: 'fam-1', name: 'Karthikeyan S', age: 62, relationship: 'Father', occupation: 'Retired Officer', dependent: 'Yes', contactNo: '9842100111' }
      ],
      additionalInfo: {
        workSundays: 'Yes',
        joiningTimeRequired: '30 Days',
        litigationDetails: 'None',
        rathinamAcquaintance: 'No',
        rathinamAcquaintanceDetails: ''
      },
      references: [
        { name: 'Dr. S. Kanthaswamy', designation: 'Professor & Dean, PSG Tech', mobile: '9442211001', phone: '0422-2572111' }
      ],
      referredFriends: [],
      documents: [
        { id: 'doc-1', name: 'Vignesh_K_Resume.pdf', type: 'Resume', size: '1.2 MB', url: '/uploads/sample_resume.pdf' }
      ],
      declarationAccepted: true,
      declarationDate: '2026-08-12',
      declarationPlace: 'Coimbatore',
      submittedAt: '2026-08-12T04:20:00.000Z',
      updatedAt: '2026-08-12T04:20:00.000Z',
      isDeleted: false
    }
  ],
  statusHistory: [
    {
      id: 'his-1',
      applicationId: 'RHR-2026-000001',
      fromStatus: 'NONE',
      toStatus: 'NEW',
      updatedBy: 'Applicant Submission',
      remarks: 'Application submitted successfully by candidate VIGNESH K through online portal.',
      timestamp: '2026-08-12T04:20:00.000Z'
    }
  ],
  hrNotes: [
    {
      id: 'note-1',
      applicationId: 'RHR-2026-000001',
      author: 'Priya Sharma (RGU HR Lead)',
      content: 'Verified Ph.D. credentials and research background of candidate VIGNESH K.',
      createdAt: '2026-08-12T04:21:00.000Z'
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      applicationId: 'RHR-2026-000001',
      applicantName: 'VIGNESH K',
      organizationId: 'RGU',
      title: 'New Application Received',
      message: 'VIGNESH K applied for Assistant Professor - Computer Science & Engineering (RGU)',
      status: 'New Application',
      isRead: false,
      timestamp: '2026-08-12T04:20:00.000Z'
    }
  ],
  auditLogs: [
    {
      id: 'audit-1',
      user: 'VIGNESH K',
      action: 'APPLICATION_SUBMITTED',
      details: 'Created application RHR-2026-000001 for RGU',
      timestamp: '2026-08-12T04:20:00.000Z'
    }
  ],
  seqCounter: 2
};

// Data Store Class
class JsonDatabase {
  constructor() {
    this.ensureFileExists();
  }

  ensureFileExists() {
    if (!fs.existsSync(DATA_FILE)) {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf8');
    }
  }

  read() {
    try {
      this.ensureFileExists();
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading DB file, returning fallback data:', e);
      return INITIAL_DATA;
    }
  }

  write(data) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('Error writing to DB file:', e);
      return false;
    }
  }

  getNextApplicationId() {
    const db = this.read();
    const current = db.seqCounter || (db.applications.length + 1);
    db.seqCounter = current + 1;
    this.write(db);
    const numStr = String(current).padStart(6, '0');
    return `RHR-2026-${numStr}`;
  }
}

module.exports = new JsonDatabase();
